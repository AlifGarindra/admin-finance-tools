import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { Attendance, Employee, MealAllowanceSummary } from '@/types';
import { STATUS_LABELS, isPublicHoliday, MEAL_ELIGIBLE_STATUSES } from './attendance-utils';
import type { AttendanceStatus } from '@/types';

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Late deduction per terlambat day (Rp)
const LATE_DEDUCTION = 10_000;

// Colors (ARGB)
const RED    = 'FFFF0000';
const ORANGE = 'FFFFC000';
const BLUE   = 'FFD9E1F2';  // WFH row (meal sheet)

// Employee header colors cycling
const EMP_COLORS = [
  'FF70AD47', 'FFFFC000', 'FF5B9BD5', 'FFED7D31',
  'FF9E480E', 'FF4BACC6', 'FF7030A0', 'FFFF7030',
];

type Fill = ExcelJS.Fill;
type Borders = ExcelJS.Borders;

const solidFill = (argb: string): Fill =>
  ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });

const thinBorder = { style: 'thin' as const, color: { argb: 'FFD9D9D9' } };
const BORDER: Partial<Borders> = {
  top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder,
};

function applyStyle(cell: ExcelJS.Cell, opts: {
  fill?: string;
  fontColor?: string;
  bold?: boolean;
  align?: ExcelJS.Alignment['horizontal'];
  numFmt?: string;
  italic?: boolean;
}) {
  if (opts.fill) cell.fill = solidFill(opts.fill);
  cell.font = {
    ...(opts.bold && { bold: true }),
    ...(opts.italic && { italic: true }),
    ...(opts.fontColor && { color: { argb: opts.fontColor } }),
  };
  cell.alignment = { horizontal: opts.align ?? 'center', vertical: 'middle' };
  cell.border = BORDER;
  if (opts.numFmt) cell.numFmt = opts.numFmt;
}

function getColLetter(col: number): string {
  let result = '';
  while (col > 0) {
    const mod = (col - 1) % 26;
    result = String.fromCharCode(65 + mod) + result;
    col = Math.floor((col - 1) / 26);
  }
  return result;
}

function fmtTime(t: string | null | undefined): string {
  return t ? t.replace(':', '.') : '';
}

function isWeekendDay(year: number, month: number, day: number): boolean {
  const dow = new Date(year, month - 1, day).getDay();
  return dow === 0 || dow === 6;
}

function dateLabel(year: number, month: number, day: number): string {
  return format(new Date(year, month - 1, day), 'd-MMM-yy');
}

function isNonWorkDay(year: number, month: number, day: number): boolean {
  const ds = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return isWeekendDay(year, month, day) || !!isPublicHoliday(ds);
}

function getAtt(attendances: Attendance[], empId: string, year: number, month: number, day: number): Attendance | undefined {
  const prefix = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return attendances.find(a => a.employeeId === empId && a.date.startsWith(prefix));
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export function (async because ExcelJS uses streams internally)
// ─────────────────────────────────────────────────────────────────────────────
export async function exportToExcel(
  employees: Employee[],
  attendances: Attendance[],
  _mealSummaries: MealAllowanceSummary[],
  month: string
): Promise<void> {
  const [year, monthNum] = month.split('-').map(Number);
  const monthName = MONTH_NAMES_ID[monthNum - 1];
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const N = employees.length;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'HR Admin Tool';

  // ── SHEET 1: REKAP ABSENSI ────────────────────────────────────────────────
  // Layout: row 1 = DATE (merged 2 rows) + employee names (each merged 2 cols)
  //         row 2 = in | out per employee
  //         rows 3+ = date data
  buildAbsensiSheet(wb, employees, attendances, year, monthNum, daysInMonth, N);

  // ── SHEET 2: REKAPAN UANG MAKAN ───────────────────────────────────────────
  // Layout: row 1 = title (merged all cols)
  //         row 2 = DATE (merged 2 rows) + employee names (each merged 2 cols)
  //         row 3 = Harian | Potongan per employee
  //         rows 4+ = date data
  //         last row = TOTAL
  buildMealSheet(wb, employees, attendances, year, monthNum, daysInMonth, N);

  // Trigger browser download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rekap_HR_${monthName}_${year}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────

function buildAbsensiSheet(
  wb: ExcelJS.Workbook,
  employees: Employee[],
  attendances: Attendance[],
  year: number,
  monthNum: number,
  daysInMonth: number,
  N: number
) {
  const ws = wb.addWorksheet('Rekap Absensi');

  // Column widths
  ws.getColumn(1).width = 12;
  for (let i = 0; i < N; i++) {
    ws.getColumn(2 + i * 2).width = 9;
    ws.getColumn(2 + i * 2 + 1).width = 9;
  }

  // Row 1: DATE (merged with row 2) + employee names (each merged 2 cols)
  const r1 = ws.addRow([]);
  r1.height = 22;
  ws.mergeCells(1, 1, 2, 1);
  const dateHdr = r1.getCell(1);
  dateHdr.value = 'DATE';
  applyStyle(dateHdr, { bold: true });

  for (let i = 0; i < N; i++) {
    const col = 2 + i * 2;
    const color = EMP_COLORS[i % EMP_COLORS.length];
    ws.mergeCells(1, col, 1, col + 1);
    const cell = r1.getCell(col);
    cell.value = employees[i].name;
    applyStyle(cell, { fill: color, fontColor: 'FFFFFFFF', bold: true });
  }

  // Row 2: in | out sub-headers
  const r2 = ws.addRow([]);
  r2.height = 16;
  for (let i = 0; i < N; i++) {
    const col = 2 + i * 2;
    const color = EMP_COLORS[i % EMP_COLORS.length];
    const inCell = r2.getCell(col);
    const outCell = r2.getCell(col + 1);
    inCell.value = 'in';
    outCell.value = 'out';
    applyStyle(inCell,  { fill: color, fontColor: 'FFFFFFFF', bold: true });
    applyStyle(outCell, { fill: color, fontColor: 'FFFFFFFF', bold: true });
  }

  // Data rows
  for (let d = 1; d <= daysInMonth; d++) {
    const row = ws.addRow([]);
    row.height = 16;
    const nonWork = isNonWorkDay(year, monthNum, d);

    const dateCell = row.getCell(1);
    dateCell.value = dateLabel(year, monthNum, d);

    if (nonWork) {
      applyStyle(dateCell, { fill: RED, fontColor: 'FFFFFFFF', bold: true });
      for (let i = 0; i < N; i++) {
        applyStyle(row.getCell(2 + i * 2),     { fill: RED });
        applyStyle(row.getCell(2 + i * 2 + 1), { fill: RED });
      }
      continue;
    }

    applyStyle(dateCell, { bold: true });

    for (let i = 0; i < N; i++) {
      const att = getAtt(attendances, employees[i].id, year, monthNum, d);
      const inCell  = row.getCell(2 + i * 2);
      const outCell = row.getCell(2 + i * 2 + 1);

      if (!att) {
        applyStyle(inCell,  {});
        applyStyle(outCell, {});
        continue;
      }

      const status = att.status as AttendanceStatus;
      const needsTime = status === 'HADIR' || status === 'TERLAMBAT';

      if (needsTime) {
        inCell.value  = fmtTime(att.checkIn);
        outCell.value = fmtTime(att.checkOut);
        applyStyle(inCell,  att.isLate ? { fill: ORANGE, bold: true } : {});
        applyStyle(outCell, {});
      } else {
        inCell.value = STATUS_LABELS[status] ?? status;
        applyStyle(inCell,  { italic: status === 'WFH' });
        applyStyle(outCell, {});
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function buildMealSheet(
  wb: ExcelJS.Workbook,
  employees: Employee[],
  attendances: Attendance[],
  year: number,
  monthNum: number,
  daysInMonth: number,
  N: number
) {
  const ws = wb.addWorksheet('Uang Makan');
  const totalCols = 1 + N * 2;
  const RUPIAH = '"Rp  "#,##0';

  // Column widths
  ws.getColumn(1).width = 12;
  for (let i = 0; i < N; i++) {
    ws.getColumn(2 + i * 2).width = 14;
    ws.getColumn(2 + i * 2 + 1).width = 14;
  }

  // Row 1: Title
  const r1 = ws.addRow([]);
  r1.height = 24;
  ws.mergeCells(1, 1, 1, totalCols);
  const titleCell = r1.getCell(1);
  titleCell.value =
    `REKAPAN UANG MAKAN ${dateLabel(year, monthNum, 1)} - ${dateLabel(year, monthNum, daysInMonth)}`;
  titleCell.font = { bold: true, size: 12 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.border = BORDER;

  // Row 2: DATE header (merged with row 3) + employee names
  const r2 = ws.addRow([]);
  r2.height = 22;
  ws.mergeCells(2, 1, 3, 1);
  const dateHdr = r2.getCell(1);
  dateHdr.value = 'DATE';
  applyStyle(dateHdr, { bold: true });

  for (let i = 0; i < N; i++) {
    const col = 2 + i * 2;
    const color = EMP_COLORS[i % EMP_COLORS.length];
    ws.mergeCells(2, col, 2, col + 1);
    const cell = r2.getCell(col);
    cell.value = employees[i].name;
    applyStyle(cell, { fill: color, fontColor: 'FFFFFFFF', bold: true });
  }

  // Row 3: Harian | Potongan sub-headers
  const r3 = ws.addRow([]);
  r3.height = 16;
  for (let i = 0; i < N; i++) {
    const col = 2 + i * 2;
    const color = EMP_COLORS[i % EMP_COLORS.length];
    const hCell = r3.getCell(col);
    const pCell = r3.getCell(col + 1);
    hCell.value = 'Harian';
    pCell.value = 'Potongan';
    applyStyle(hCell, { fill: color, fontColor: 'FFFFFFFF', bold: true });
    applyStyle(pCell, { fill: color, fontColor: 'FFFFFFFF', bold: true });
  }

  // Data rows: start at Excel row 4
  for (let d = 1; d <= daysInMonth; d++) {
    const row = ws.addRow([]);
    row.height = 16;
    const nonWork = isNonWorkDay(year, monthNum, d);

    const dateCell = row.getCell(1);
    dateCell.value = dateLabel(year, monthNum, d);

    if (nonWork) {
      applyStyle(dateCell, { fill: RED, fontColor: 'FFFFFFFF', bold: true });
      for (let i = 0; i < N; i++) {
        applyStyle(row.getCell(2 + i * 2),     { fill: RED });
        applyStyle(row.getCell(2 + i * 2 + 1), { fill: RED });
      }
      continue;
    }

    // Check if all-WFH day for blue row coloring
    const dayAtts = employees.map(emp => getAtt(attendances, emp.id, year, monthNum, d));
    const hasAnyAtt = dayAtts.some(Boolean);
    const allWfh = hasAnyAtt && dayAtts.every(a => !a || a.status === 'WFH');

    applyStyle(dateCell, allWfh ? { fill: BLUE, bold: true } : { bold: true });

    for (let i = 0; i < N; i++) {
      const emp = employees[i];
      const att = dayAtts[i];
      const hCell = row.getCell(2 + i * 2);
      const pCell = row.getCell(2 + i * 2 + 1);

      if (!att) {
        applyStyle(hCell, {});
        applyStyle(pCell, {});
        continue;
      }

      const status = att.status as AttendanceStatus;
      const eligible = MEAL_ELIGIBLE_STATUSES.includes(status);

      if (eligible) {
        const isWfh = status === 'WFH';
        hCell.value = emp.mealAllowance;
        hCell.numFmt = RUPIAH;

        if (att.isLate) {
          applyStyle(hCell, { fill: ORANGE, bold: true, numFmt: RUPIAH });
          pCell.value = LATE_DEDUCTION;
          pCell.numFmt = RUPIAH;
          applyStyle(pCell, { numFmt: RUPIAH });
        } else if (isWfh) {
          applyStyle(hCell, { fill: BLUE, numFmt: RUPIAH });
          applyStyle(pCell, { fill: BLUE });
        } else {
          applyStyle(hCell, { numFmt: RUPIAH });
          applyStyle(pCell, {});
        }
      } else {
        // Not eligible: show label (IZIN, SAKIT, CUTI, ALPHA)
        hCell.value = STATUS_LABELS[status] ?? status;
        applyStyle(hCell, { italic: true });
        applyStyle(pCell, {});
      }
    }
  }

  // Total row
  const dataStart = 4;
  const dataEnd   = 3 + daysInMonth;
  const totalRow  = ws.addRow([]);
  totalRow.height = 20;

  const totalDateCell = totalRow.getCell(1);
  totalDateCell.value = 'TOTAL';
  applyStyle(totalDateCell, { bold: true });

  for (let i = 0; i < N; i++) {
    const hCol = 2 + i * 2;
    const pCol = 2 + i * 2 + 1;
    const hLet = getColLetter(hCol);
    const pLet = getColLetter(pCol);

    const hTotal = totalRow.getCell(hCol);
    const pTotal = totalRow.getCell(pCol);

    hTotal.value = { formula: `SUMIF(${hLet}${dataStart}:${hLet}${dataEnd},"<>",${hLet}${dataStart}:${hLet}${dataEnd})` };
    hTotal.numFmt = RUPIAH;
    applyStyle(hTotal, { bold: true, numFmt: RUPIAH });

    pTotal.value = { formula: `SUM(${pLet}${dataStart}:${pLet}${dataEnd})` };
    pTotal.numFmt = RUPIAH;
    applyStyle(pTotal, { bold: true, numFmt: RUPIAH });
  }
}
