import { Employee, Attendance } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEmployee(row: any): Employee {
  return {
    id: row.id,
    name: row.name,
    position: row.position ?? null,
    department: row.department ?? null,
    joinDate: row.join_date,
    isActive: row.is_active,
    mealAllowance: row.meal_allowance,
    normalCheckIn: row.normal_check_in,
    lateToleranceMinutes: row.late_tolerance_minutes,
    workDays: row.work_days ?? ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAttendance(row: any): Attendance {
  return {
    id: row.id,
    employeeId: row.employee_id,
    date: row.date,
    checkIn: row.check_in ?? null,
    checkOut: row.check_out ?? null,
    status: row.status,
    isLate: row.is_late,
    notes: row.notes ?? null,
    ...(row.employees ? { employee: mapEmployee(row.employees) } : {}),
  };
}
