// ============================================================
// data.jsx — HR Admin Tool: Data Layer
// Simbolon & Partners — May 2026
// ============================================================

const TODAY_DATE = new Date(2026, 4, 23); // May 23, 2026 (Saturday)
const CURRENT_MONTH = { year: 2026, month: 4 }; // 0-indexed

const STATUS_CONFIG = {
  hadir:        { label: 'Hadir',         color: '#22c55e', bg: '#f0fdf4', bold: false },
  terlambat:    { label: 'Terlambat',     color: '#f97316', bg: '#fff7ed', bold: false },
  wfh:          { label: 'WFH',           color: '#3b82f6', bg: '#eff6ff', bold: false },
  izin:         { label: 'Izin',          color: '#a855f7', bg: '#faf5ff', bold: false },
  sakit:        { label: 'Sakit',         color: '#ef4444', bg: '#fef2f2', bold: false },
  cuti:         { label: 'Cuti',          color: '#06b6d4', bg: '#ecfeff', bold: false },
  dinas_luar:   { label: 'Dinas Luar',    color: '#eab308', bg: '#fefce8', bold: false },
  sidang:       { label: 'Sidang',        color: '#8b5cf6', bg: '#f5f3ff', bold: false },
  pendampingan: { label: 'Pendampingan',  color: '#0ea5e9', bg: '#f0f9ff', bold: false },
  alpha:        { label: 'Alpha',         color: '#dc2626', bg: '#fef2f2', bold: true  },
};

// Statuses that count toward meal allowance
const MEAL_ELIGIBLE = ['hadir', 'terlambat', 'wfh', 'dinas_luar', 'sidang', 'pendampingan'];

const INITIAL_EMPLOYEES = [
  { id: 1, name: 'Budi Santoso',   role: 'Staff Admin',     tarif: 25000, active: true, phone: '0812-3456-7890', email: 'budi@simbolon.co.id',  joinDate: '2022-03-15' },
  { id: 2, name: 'Sari Dewi',      role: 'HR Officer',      tarif: 25000, active: true, phone: '0812-3456-7891', email: 'sari@simbolon.co.id',   joinDate: '2021-08-01' },
  { id: 3, name: 'Ahmad Fauzi',    role: 'Finance Staff',   tarif: 25000, active: true, phone: '0812-3456-7892', email: 'ahmad@simbolon.co.id',  joinDate: '2023-01-10' },
  { id: 4, name: 'Rina Putri',     role: 'Marketing Staff', tarif: 25000, active: true, phone: '0812-3456-7893', email: 'rina@simbolon.co.id',   joinDate: '2022-06-20' },
  { id: 5, name: 'Dimas Prasetyo', role: 'IT Support',      tarif: 25000, active: true, phone: '0812-3456-7894', email: 'dimas@simbolon.co.id',  joinDate: '2023-05-01' },
];

// May 2026 Indonesian public holidays
const HOLIDAYS_MAY_2026 = {
  1:  'Hari Buruh',
  20: 'Hari Kebangkitan Nasional',
};

function getDaysInMonth(year, month) {
  const count = new Date(year, month + 1, 0).getDate();
  const NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return Array.from({ length: count }, (_, i) => {
    const d = i + 1;
    const date = new Date(year, month, d);
    const dow = date.getDay();
    const isHol = year === 2026 && month === 4 && !!HOLIDAYS_MAY_2026[d];
    return {
      day: d,
      date,
      dayName: NAMES[dow],
      isWeekend: dow === 0 || dow === 6,
      isHoliday: isHol,
      holidayName: isHol ? HOLIDAYS_MAY_2026[d] : null,
      isPast: date < TODAY_DATE,
      isToday: date.toDateString() === TODAY_DATE.toDateString(),
    };
  });
}

// Attendance: empId → { day: { status, timeIn, timeOut } }
const INITIAL_ATTENDANCE = {
  1: { // Budi Santoso
    4:  { status: 'hadir',     timeIn: '07:58', timeOut: '17:02' },
    5:  { status: 'hadir',     timeIn: '08:01', timeOut: '17:00' },
    6:  { status: 'terlambat', timeIn: '09:15', timeOut: '17:30' },
    7:  { status: 'hadir',     timeIn: '07:55', timeOut: '17:00' },
    8:  { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    11: { status: 'wfh',       timeIn: '08:00', timeOut: '17:00' },
    12: { status: 'hadir',     timeIn: '07:59', timeOut: '17:01' },
    13: { status: 'hadir',     timeIn: '08:02', timeOut: '17:00' },
    14: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    15: { status: 'hadir',     timeIn: '07:57', timeOut: '17:00' },
    18: { status: 'hadir',     timeIn: '08:03', timeOut: '17:00' },
    19: { status: 'izin',      timeIn: '',      timeOut: ''      },
    21: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    22: { status: 'hadir',     timeIn: '07:58', timeOut: '17:00' },
  },
  2: { // Sari Dewi
    4:  { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    5:  { status: 'terlambat', timeIn: '08:45', timeOut: '17:30' },
    6:  { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    7:  { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    8:  { status: 'sakit',     timeIn: '',      timeOut: ''      },
    11: { status: 'sakit',     timeIn: '',      timeOut: ''      },
    12: { status: 'hadir',     timeIn: '08:10', timeOut: '17:00' },
    13: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    14: { status: 'wfh',       timeIn: '08:00', timeOut: '17:00' },
    15: { status: 'hadir',     timeIn: '07:58', timeOut: '17:00' },
    18: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    19: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    21: { status: 'cuti',      timeIn: '',      timeOut: ''      },
    22: { status: 'hadir',     timeIn: '08:05', timeOut: '17:00' },
  },
  3: { // Ahmad Fauzi
    4:  { status: 'hadir',      timeIn: '07:50', timeOut: '17:00' },
    5:  { status: 'hadir',      timeIn: '08:00', timeOut: '17:00' },
    6:  { status: 'hadir',      timeIn: '08:00', timeOut: '17:15' },
    7:  { status: 'dinas_luar', timeIn: '08:00', timeOut: '17:00' },
    8:  { status: 'dinas_luar', timeIn: '08:00', timeOut: '17:00' },
    11: { status: 'hadir',      timeIn: '08:00', timeOut: '17:00' },
    12: { status: 'terlambat',  timeIn: '09:30', timeOut: '17:30' },
    13: { status: 'hadir',      timeIn: '08:00', timeOut: '17:00' },
    14: { status: 'hadir',      timeIn: '08:00', timeOut: '17:00' },
    15: { status: 'hadir',      timeIn: '07:55', timeOut: '17:00' },
    18: { status: 'wfh',        timeIn: '08:00', timeOut: '17:00' },
    19: { status: 'hadir',      timeIn: '08:00', timeOut: '17:00' },
    21: { status: 'hadir',      timeIn: '08:02', timeOut: '17:00' },
    22: { status: 'hadir',      timeIn: '07:58', timeOut: '17:00' },
  },
  4: { // Rina Putri
    4:  { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    5:  { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    6:  { status: 'hadir',     timeIn: '08:05', timeOut: '17:00' },
    7:  { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    8:  { status: 'terlambat', timeIn: '08:55', timeOut: '17:00' },
    11: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    12: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    13: { status: 'izin',      timeIn: '',      timeOut: ''      },
    14: { status: 'izin',      timeIn: '',      timeOut: ''      },
    15: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    18: { status: 'hadir',     timeIn: '07:58', timeOut: '17:00' },
    19: { status: 'alpha',     timeIn: '',      timeOut: ''      },
    21: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    22: { status: 'hadir',     timeIn: '07:56', timeOut: '17:00' },
  },
  5: { // Dimas Prasetyo
    4:  { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    5:  { status: 'wfh',       timeIn: '08:00', timeOut: '17:00' },
    6:  { status: 'wfh',       timeIn: '08:00', timeOut: '17:00' },
    7:  { status: 'hadir',     timeIn: '07:52', timeOut: '17:00' },
    8:  { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    11: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    12: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    13: { status: 'sidang',    timeIn: '08:00', timeOut: '14:00' },
    14: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    15: { status: 'hadir',     timeIn: '07:59', timeOut: '17:00' },
    18: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
    19: { status: 'hadir',     timeIn: '08:01', timeOut: '17:00' },
    21: { status: 'terlambat', timeIn: '09:10', timeOut: '17:30' },
    22: { status: 'hadir',     timeIn: '08:00', timeOut: '17:00' },
  },
};

const INITIAL_SETTINGS = {
  jamMasuk: '08:00',
  toleransiMenit: 15,
  hariKerja: [1, 2, 3, 4, 5], // Mon–Fri
  tarifMakanDefault: 25000,
  potonganAlpha: true,
  namaPerusahaan: 'Simbolon & Partners',
};

// ── Utilities ──────────────────────────────────────────────
function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function formatRupiah(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function getAvatarColor(id) {
  const colors = ['#4F46E5', '#059669', '#7C3AED', '#E11D48', '#0EA5E9'];
  return colors[(id - 1) % colors.length];
}

function calcMealEligibleDays(empId, attendanceData) {
  const empData = attendanceData[empId] || {};
  return Object.values(empData).filter(r => MEAL_ELIGIBLE.includes(r.status)).length;
}

Object.assign(window, {
  TODAY_DATE, CURRENT_MONTH,
  STATUS_CONFIG, MEAL_ELIGIBLE,
  INITIAL_EMPLOYEES, getDaysInMonth,
  INITIAL_ATTENDANCE, INITIAL_SETTINGS,
  getInitials, formatRupiah, getAvatarColor, calcMealEligibleDays,
});
