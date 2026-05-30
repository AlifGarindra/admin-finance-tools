'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Home, CheckSquare } from 'lucide-react';
import { MonthPicker } from '@/components/shared/MonthPicker';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Toast } from '@/components/shared/Toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { Employee, Attendance, AttendanceStatus } from '@/types';
import {
  ATTENDANCE_STATUSES, STATUS_LABELS, STATUS_COLORS,
  STATUS_REQUIRES_CHECK_IN, isPublicHoliday,
} from '@/lib/attendance-utils';
import { exportToExcel } from '@/lib/export-utils';
import { MealAllowanceSummary } from '@/types';

const MONTH_NAMES_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const DAY_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

interface DayInfo {
  day: number;
  date: Date;
  dayName: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  isPast: boolean;
  isToday: boolean;
}

function getDaysInMonth(year: number, month: number): DayInfo[] {
  const count = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = i + 1;
    const date = new Date(year, month, d);
    const dow = date.getDay();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const holidayName = isPublicHoliday(dateStr);
    return {
      day: d,
      date,
      dayName: DAY_SHORT[dow],
      isWeekend: dow === 0 || dow === 6,
      isHoliday: !!holidayName,
      holidayName,
      isPast: date < today,
      isToday: date.getTime() === today.getTime(),
    };
  });
}

// Attendance popover
interface PopoverState {
  empId: string;
  empName: string;
  day: number;
  dateStr: string;
  currentAtt: Attendance | null;
  rect: DOMRect;
}

function AttendancePopover({
  popover, onSave, onClose,
}: {
  popover: PopoverState;
  onSave: (data: { status: AttendanceStatus; checkIn: string; checkOut: string }) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<AttendanceStatus | ''>(popover.currentAtt?.status ?? '');
  const [checkIn, setCheckIn] = useState(popover.currentAtt?.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(popover.currentAtt?.checkOut ?? '');

  const needsTime = status ? STATUS_REQUIRES_CHECK_IN.includes(status as AttendanceStatus) : false;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-popover="attendance"]')) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', h), 10);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', h); };
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const W = 296;
  const H = needsTime ? 380 : 300;
  const vW = window.innerWidth;
  const vH = window.innerHeight;
  let top = popover.rect.bottom + 6;
  let left = popover.rect.left;
  if (top + H > vH - 12) top = popover.rect.top - H - 6;
  if (left + W > vW - 12) left = vW - W - 12;
  if (left < 12) left = 12;
  if (top < 12) top = 12;

  const [yr, mo] = popover.dateStr.split('-');
  const dayLabel = `${DAY_SHORT[new Date(Number(yr), Number(mo) - 1, popover.day).getDay()]}, ${popover.day} ${MONTH_NAMES_ID[Number(mo) - 1]} ${yr}`;

  return (
    <div
      data-popover="attendance"
      style={{
        position: 'fixed', top, left, zIndex: 3000, width: W,
        background: 'white', borderRadius: 13,
        boxShadow: '0 8px 30px rgba(0,0,0,0.16)',
        border: '1px solid #E2E8F0',
      }}
    >
      {/* Header */}
      <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{dayLabel}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>{popover.empName}</div>
        </div>
        <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 6, padding: 5, cursor: 'pointer', display: 'flex', color: '#64748B' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5, marginBottom: 14 }}>
          {ATTENDANCE_STATUSES.map((s) => {
            const cfg = STATUS_COLORS[s];
            const isSelected = status === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: '6px 10px', borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                  border: `1.5px solid ${isSelected ? cfg.color : '#E2E8F0'}`,
                  background: isSelected ? cfg.bg : 'white',
                  color: cfg.color, fontWeight: s === 'ALPHA' ? 700 : (isSelected ? 600 : 400),
                  fontSize: 12, transition: 'all 0.1s',
                }}
              >
                {STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>

        {needsTime && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jam Kerja</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#64748B', marginBottom: 3, display: 'block' }}>Masuk</label>
                <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#0F172A' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#64748B', marginBottom: 3, display: 'block' }}>Keluar</label>
                <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#0F172A' }} />
              </div>
            </div>
          </div>
        )}

        {!needsTime && status === 'WFH' && (
          <p style={{ fontSize: 12, color: '#2563EB', background: '#DBEAFE', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
            WFH tidak memerlukan pencatatan jam masuk/keluar.
          </p>
        )}

        <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'white', color: '#475569', border: '1px solid #E2E8F0', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Batal</button>
          <button
            onClick={() => { if (status) onSave({ status: status as AttendanceStatus, checkIn, checkOut }); }}
            disabled={!status}
            style={{ background: '#4F46E5', color: 'white', border: 'none', padding: '7px 14px', borderRadius: 8, cursor: status ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 500, opacity: status ? 1 : 0.45 }}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// Attendance cell
function AttendanceCell({ emp, dateStr, att, onEdit }: {
  emp: Employee; dateStr: string; att: Attendance | undefined;
  onEdit: (e: React.MouseEvent, emp: Employee, dateStr: string, att: Attendance | undefined) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isFuture = !att && new Date(dateStr) > new Date();

  return (
    <td
      onClick={!isFuture ? (e) => onEdit(e, emp, dateStr, att) : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '7px 10px', border: '1px solid #F1F5F9',
        cursor: isFuture ? 'default' : 'pointer',
        minWidth: 140, maxWidth: 180,
        background: hovered && !isFuture ? '#F8FAFC' : 'white',
        transition: 'background 0.1s',
        verticalAlign: 'middle', position: 'relative',
      }}
    >
      {att ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <StatusBadge status={att.status as AttendanceStatus} size="sm" />
          {att.checkIn && (
            <span style={{ fontSize: 11, color: '#94A3B8' }}>
              {att.checkIn} – {att.checkOut ?? '--:--'}
            </span>
          )}
        </div>
      ) : isFuture ? (
        <span style={{ color: '#E2E8F0', fontSize: 12 }}>—</span>
      ) : (
        <span style={{ fontSize: 12, color: hovered ? '#4F46E5' : '#CBD5E1', fontWeight: hovered ? 500 : 400 }}>
          + Input
        </span>
      )}
      {att && !isFuture && hovered && (
        <div style={{ position: 'absolute', top: 5, right: 5, color: '#94A3B8' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
      )}
    </td>
  );
}

export default function AbsensiPage() {
  const { get, post } = useApi();
  const { activeMonth, setActiveMonth } = useAppStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [wfhAllConfirm, setWfhAllConfirm] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());

  const [year, month] = activeMonth.split('-').map(Number);
  const days = getDaysInMonth(year, month - 1);
  const activeEmployees = employees.filter((e) => e.isActive);

  const attMap = new Map<string, Attendance>();
  attendances.forEach((a) => {
    const key = `${a.employeeId}__${a.date.slice(0, 10)}`;
    attMap.set(key, a);
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, atts] = await Promise.all([
        get('/api/employees'),
        get(`/api/attendance?month=${activeMonth}`),
      ]);
      setEmployees(emps);
      setAttendances(atts);
    } catch { /* middleware handles redirect */ }
    finally { setLoading(false); }
  }, [get, activeMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCellEdit = (e: React.MouseEvent, emp: Employee, dateStr: string, att: Attendance | undefined) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopover({ empId: emp.id, empName: emp.name, day: Number(dateStr.slice(8)), dateStr, currentAtt: att ?? null, rect });
  };

  const handleSave = async ({ status, checkIn, checkOut }: { status: AttendanceStatus; checkIn: string; checkOut: string }) => {
    if (!popover) return;
    try {
      await post('/api/attendance', {
        employeeId: popover.empId,
        date: popover.dateStr,
        status,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
      });
      setToast({ message: 'Absensi berhasil disimpan', type: 'success' });
      fetchData();
    } catch {
      setToast({ message: 'Gagal menyimpan absensi', type: 'error' });
    }
    setPopover(null);
  };

  const handleWfhAll = async () => {
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    try {
      const result = await post('/api/attendance/wfh-all', { date: todayStr });
      setToast({ message: `WFH diterapkan: ${result.created} karyawan (${result.skipped} dilewati)`, type: 'success' });
      fetchData();
    } catch {
      setToast({ message: 'Gagal menerapkan WFH', type: 'error' });
    }
  };

  const handleWfhPartial = async () => {
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    try {
      const result = await post('/api/attendance/wfh-partial', {
        date: todayStr,
        employeeIds: Array.from(selectedEmpIds),
      });
      setToast({ message: `WFH diterapkan: ${result.created} karyawan`, type: 'success' });
      setSelectMode(false);
      setSelectedEmpIds(new Set());
      fetchData();
    } catch {
      setToast({ message: 'Gagal menerapkan WFH', type: 'error' });
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const mealData = await get(`/api/meal-allowance?month=${activeMonth}`);
      await exportToExcel(activeEmployees, attendances, mealData.summaries as MealAllowanceSummary[], activeMonth);
      setToast({ message: 'File berhasil diunduh', type: 'success' });
    } catch {
      setToast({ message: 'Gagal export file', type: 'error' });
    }
    setExportLoading(false);
  };

  const getSummary = (empId: string) => {
    const counts: Record<string, number> = {};
    attendances.filter((a) => a.employeeId === empId).forEach((a) => {
      counts[a.status] = (counts[a.status] ?? 0) + 1;
    });
    return counts;
  };

  const monthLabel = `${['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][month - 1]} ${year}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Rekap Absensi</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>{monthLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <MonthPicker value={activeMonth} onChange={setActiveMonth} />
          <button
            onClick={handleExport}
            disabled={exportLoading}
            style={{ background: '#4F46E5', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={15} />
            {exportLoading ? 'Mengunduh...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* WFH Action Bar */}
      <div style={{ padding: '8px 20px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        <button
          onClick={() => setWfhAllConfirm(true)}
          style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <Home size={13} /> Set WFH Semua
        </button>
        <button
          onClick={() => { setSelectMode(!selectMode); setSelectedEmpIds(new Set()); }}
          style={{ background: selectMode ? '#EDE9FE' : 'white', color: selectMode ? '#7C3AED' : '#475569', border: '1px solid', borderColor: selectMode ? '#C4B5FD' : '#E2E8F0', padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <CheckSquare size={13} /> {selectMode ? 'Batal Pilih' : 'Set WFH Sebagian'}
        </button>

        {/* Legend */}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#94A3B8' }}>Klik sel untuk input/edit</div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Memuat data...</div>
        ) : (
          <table style={{ borderCollapse: 'collapse', fontSize: 13, width: 'max-content', minWidth: '100%' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                <th style={{ position: 'sticky', left: 0, zIndex: 30, background: '#0F172A', color: 'white', padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, minWidth: 110, borderRight: '2px solid #1E293B' }}>
                  Tanggal
                </th>
                {activeEmployees.map((emp) => (
                  <th key={emp.id} style={{ background: '#0F172A', color: 'white', padding: '10px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12, minWidth: 150, whiteSpace: 'nowrap', borderRight: '1px solid #1E293B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {selectMode && (
                        <input
                          type="checkbox"
                          checked={selectedEmpIds.has(emp.id)}
                          onChange={(e) => {
                            const next = new Set(selectedEmpIds);
                            e.target.checked ? next.add(emp.id) : next.delete(emp.id);
                            setSelectedEmpIds(next);
                          }}
                          style={{ width: 14, height: 14, accentColor: '#818CF8', cursor: 'pointer' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 400, marginTop: 1 }}>{emp.position ?? ''}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((dayInfo) => {
                const { day, dayName, isWeekend, isHoliday, holidayName, isToday } = dayInfo;
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                if (isWeekend) return (
                  <tr key={day} style={{ background: '#F8FAFC' }}>
                    <td style={{ position: 'sticky', left: 0, zIndex: 10, padding: '7px 16px', borderRight: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#CBD5E1', minWidth: 22 }}>{day}</span>
                        <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 500 }}>{dayName}</span>
                      </div>
                    </td>
                    <td colSpan={activeEmployees.length} style={{ padding: '7px 14px', color: '#CBD5E1', fontSize: 12, fontStyle: 'italic' }}>Libur akhir pekan</td>
                  </tr>
                );

                if (isHoliday) return (
                  <tr key={day} style={{ background: '#FFFBEB' }}>
                    <td style={{ position: 'sticky', left: 0, zIndex: 10, padding: '7px 16px', borderRight: '2px solid #FDE68A', background: '#FFFBEB' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#D97706', minWidth: 22 }}>{day}</span>
                        <span style={{ fontSize: 11, color: '#D97706', fontWeight: 500 }}>{dayName}</span>
                      </div>
                    </td>
                    <td colSpan={activeEmployees.length} style={{ padding: '7px 14px', color: '#D97706', fontSize: 12, fontWeight: 500 }}>
                      Libur Nasional — {holidayName}
                    </td>
                  </tr>
                );

                const rowBg = isToday ? '#EEF2FF' : 'white';
                return (
                  <tr key={day} style={{ background: rowBg }}>
                    <td style={{ position: 'sticky', left: 0, zIndex: 10, padding: '7px 16px', borderRight: '2px solid #E2E8F0', background: rowBg, borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: isToday ? '#4F46E5' : '#0F172A', minWidth: 22 }}>{day}</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: isToday ? '#4F46E5' : '#94A3B8' }}>{dayName}</span>
                      </div>
                      {isToday && <div style={{ fontSize: 10, color: '#4F46E5', fontWeight: 600, marginTop: 2, letterSpacing: '0.04em' }}>HARI INI</div>}
                    </td>
                    {activeEmployees.map((emp) => {
                      const att = attMap.get(`${emp.id}__${dateStr}`);
                      return (
                        <AttendanceCell key={emp.id} emp={emp} dateStr={dateStr} att={att} onEdit={handleCellEdit} />
                      );
                    })}
                  </tr>
                );
              })}

              {/* Summary row */}
              <tr style={{ position: 'sticky', bottom: 0, zIndex: 20, background: '#F8FAFC', borderTop: '2px solid #E2E8F0' }}>
                <td style={{ position: 'sticky', left: 0, zIndex: 30, padding: '10px 16px', fontWeight: 700, fontSize: 12, color: '#0F172A', background: '#F8FAFC', borderRight: '2px solid #E2E8F0' }}>
                  TOTAL
                </td>
                {activeEmployees.map((emp) => {
                  const counts = getSummary(emp.id);
                  const hadir = ['HADIR','TERLAMBAT','WFH','DINAS_LUAR','SIDANG','PENDAMPINGAN'].reduce((s, k) => s + (counts[k] ?? 0), 0);
                  return (
                    <td key={emp.id} style={{ padding: '8px 10px', borderRight: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>{hadir} hadir</span>
                        {(counts['ALPHA'] ?? 0) > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{counts['ALPHA']} alpha</span>}
                        {((counts['IZIN'] ?? 0) + (counts['SAKIT'] ?? 0) + (counts['CUTI'] ?? 0)) > 0 && (
                          <span style={{ fontSize: 11, color: '#94A3B8' }}>{(counts['IZIN'] ?? 0) + (counts['SAKIT'] ?? 0) + (counts['CUTI'] ?? 0)} absent</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Popover */}
      {popover && <AttendancePopover popover={popover} onSave={handleSave} onClose={() => setPopover(null)} />}

      {/* WFH All confirm */}
      <ConfirmDialog
        isOpen={wfhAllConfirm}
        onClose={() => setWfhAllConfirm(false)}
        onConfirm={handleWfhAll}
        title="Set WFH Semua Karyawan"
        message={`Set WFH untuk semua ${activeEmployees.length} karyawan aktif pada hari ini? Karyawan yang sudah memiliki data absensi tidak akan tertimpa.`}
        confirmLabel="Ya, Set WFH"
        isDanger={false}
      />

      {/* WFH partial floating bar */}
      {selectMode && selectedEmpIds.size > 0 && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#0F172A', color: 'white', borderRadius: 12, padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          zIndex: 1000, whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{selectedEmpIds.size} karyawan dipilih</span>
          <button
            onClick={handleWfhPartial}
            style={{ background: '#4F46E5', color: 'white', border: 'none', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            Terapkan WFH
          </button>
          <button
            onClick={() => { setSelectMode(false); setSelectedEmpIds(new Set()); }}
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
          >
            Batal
          </button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
