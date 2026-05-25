import { AttendanceStatus } from '@/types';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'HADIR',
  'TERLAMBAT',
  'WFH',
  'IZIN',
  'SAKIT',
  'CUTI',
  'DINAS_LUAR',
  'SIDANG',
  'PENDAMPINGAN',
  'ALPHA',
];

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  HADIR: 'Hadir',
  TERLAMBAT: 'Terlambat',
  WFH: 'WFH',
  IZIN: 'Izin',
  SAKIT: 'Sakit',
  CUTI: 'Cuti',
  DINAS_LUAR: 'Dinas Luar',
  SIDANG: 'Sidang',
  PENDAMPINGAN: 'Pendampingan',
  ALPHA: 'Alpha',
};

export const STATUS_COLORS: Record<AttendanceStatus, { color: string; bg: string }> = {
  HADIR:        { color: '#22c55e', bg: '#f0fdf4' },
  TERLAMBAT:    { color: '#f97316', bg: '#fff7ed' },
  WFH:          { color: '#3b82f6', bg: '#eff6ff' },
  IZIN:         { color: '#a855f7', bg: '#faf5ff' },
  SAKIT:        { color: '#ef4444', bg: '#fef2f2' },
  CUTI:         { color: '#06b6d4', bg: '#ecfeff' },
  DINAS_LUAR:   { color: '#eab308', bg: '#fefce8' },
  SIDANG:       { color: '#8b5cf6', bg: '#f5f3ff' },
  PENDAMPINGAN: { color: '#0ea5e9', bg: '#f0f9ff' },
  ALPHA:        { color: '#dc2626', bg: '#fef2f2' },
};

export const MEAL_ELIGIBLE_STATUSES: AttendanceStatus[] = [
  'HADIR',
  'TERLAMBAT',
  'WFH',
  'DINAS_LUAR',
  'SIDANG',
  'PENDAMPINGAN',
];

export const STATUS_REQUIRES_CHECK_IN: AttendanceStatus[] = ['HADIR', 'TERLAMBAT'];

export function checkIsLate(
  checkInTime: string,
  normalCheckIn: string,
  toleranceMinutes: number
): boolean {
  const [checkInH, checkInM] = checkInTime.split(':').map(Number);
  const [normalH, normalM] = normalCheckIn.split(':').map(Number);
  const checkInTotal = checkInH * 60 + checkInM;
  const normalTotal = normalH * 60 + normalM;
  return checkInTotal > normalTotal + toleranceMinutes;
}

export function shouldCheckLate(status: AttendanceStatus): boolean {
  return STATUS_REQUIRES_CHECK_IN.includes(status);
}

export function getMealAllowanceEligible(status: AttendanceStatus): boolean {
  return MEAL_ELIGIBLE_STATUSES.includes(status);
}

const PUBLIC_HOLIDAYS_2026: Record<string, string> = {
  '2026-01-01': 'Tahun Baru Masehi',
  '2026-01-27': 'Isra Miraj',
  '2026-02-17': 'Hari Raya Imlek',
  '2026-03-20': 'Hari Raya Nyepi',
  '2026-04-03': 'Wafat Isa Almasih',
  '2026-04-20': 'Idul Fitri',
  '2026-04-21': 'Idul Fitri (Cuti Bersama)',
  '2026-05-14': 'Kenaikan Isa Almasih',
  '2026-05-23': 'Hari Raya Waisak',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-27': 'Idul Adha',
  '2026-07-17': 'Tahun Baru Islam',
  '2026-08-17': 'HUT Kemerdekaan RI',
  '2026-09-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-25': 'Hari Raya Natal',
};

export function isPublicHoliday(dateStr: string): string | null {
  return PUBLIC_HOLIDAYS_2026[dateStr] ?? null;
}

export function getWorkingDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (isPublicHoliday(dateStr)) continue;
    days.push(date);
  }
  return days;
}
