import * as XLSX from 'xlsx';
import { Attendance, Employee, MealAllowanceSummary } from '@/types';
import { STATUS_LABELS } from './attendance-utils';
import { formatRupiah } from './utils';

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function exportToExcel(
  employees: Employee[],
  attendances: Attendance[],
  mealSummaries: MealAllowanceSummary[],
  month: string
) {
  const [year, monthNum] = month.split('-').map(Number);
  const monthName = MONTH_NAMES_ID[monthNum - 1];
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  const wb = XLSX.utils.book_new();

  // Sheet 1: Absensi
  const header = ['No', 'Nama', 'Jabatan', ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1))];
  const rows: (string | number)[][] = [header];

  employees.forEach((emp, idx) => {
    const row: (string | number)[] = [idx + 1, emp.name, emp.position ?? '-'];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const att = attendances.find(
        (a) => a.employeeId === emp.id && a.date.startsWith(dateStr)
      );
      row.push(att ? STATUS_LABELS[att.status] ?? att.status : '');
    }
    rows.push(row);
  });

  const wsAttendance = XLSX.utils.aoa_to_sheet(rows);
  wsAttendance['!cols'] = [{ wch: 4 }, { wch: 20 }, { wch: 15 }, ...Array(daysInMonth).fill({ wch: 12 })];
  XLSX.utils.book_append_sheet(wb, wsAttendance, 'Rekap Absensi');

  // Sheet 2: Uang Makan
  const mealHeader = ['No', 'Nama', 'Jabatan', 'Tarif/Hari', 'Hari Hadir', 'Total'];
  const mealRows: (string | number)[][] = [mealHeader];
  let grandTotal = 0;
  mealSummaries.forEach((s, idx) => {
    mealRows.push([
      idx + 1,
      s.employee.name,
      s.employee.position ?? '-',
      s.employee.mealAllowance,
      s.presentDays,
      s.totalAmount,
    ]);
    grandTotal += s.totalAmount;
  });
  mealRows.push(['', '', '', '', 'TOTAL', grandTotal]);

  const wsMeal = XLSX.utils.aoa_to_sheet(mealRows);
  wsMeal['!cols'] = [{ wch: 4 }, { wch: 20 }, { wch: 15 }, { wch: 14 }, { wch: 12 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsMeal, 'Uang Makan');

  XLSX.writeFile(wb, `Rekap_HR_${monthName}_${year}.xlsx`);
}
