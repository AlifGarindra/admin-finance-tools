export type AttendanceStatus =
  | 'HADIR'
  | 'TERLAMBAT'
  | 'WFH'
  | 'IZIN'
  | 'SAKIT'
  | 'CUTI'
  | 'DINAS_LUAR'
  | 'SIDANG'
  | 'PENDAMPINGAN'
  | 'ALPHA';

export interface Employee {
  id: string;
  name: string;
  position?: string | null;
  department?: string | null;
  joinDate: string;
  isActive: boolean;
  mealAllowance: number;
  normalCheckIn: string;
  lateToleranceMinutes: number;
  workDays: string[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: AttendanceStatus;
  isLate: boolean;
  notes?: string | null;
}

export interface MealAllowanceSummary {
  employee: Employee;
  workingDays: number;
  presentDays: number;
  deductionDays: number;
  totalAmount: number;
  statusBreakdown: Record<string, number>;
}

export interface CreateAttendanceInput {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface StatusConfig {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  getMealAllowance: boolean;
  countAsWorkDay: boolean;
  requiresCheckIn: boolean;
}

export interface AppSettings {
  normalCheckIn: string;
  lateToleranceMinutes: number;
  workDays: string[];
  defaultMealAllowance: number;
  companyName: string;
  deductOnAlpha: boolean;
}
