import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { mapEmployee } from '@/lib/db';
import { getMealAllowanceEligible, getWorkingDaysInMonth } from '@/lib/attendance-utils';
import { AttendanceStatus } from '@/types';

async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') ?? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const [year, m] = month.split('-').map(Number);

    const supabase = createServerClient();

    const { data: empRows } = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('name');

    const start = `${year}-${String(m).padStart(2, '0')}-01`;
    const end = new Date(year, m, 0).toISOString().slice(0, 10);

    const { data: attRows } = await supabase
      .from('attendances')
      .select('employee_id, status')
      .gte('date', start)
      .lte('date', end);

    const employees = (empRows ?? []).map(mapEmployee);
    const attendances = attRows ?? [];
    const workingDays = getWorkingDaysInMonth(year, m - 1);

    const summaries = employees.map((emp) => {
      const empAttendances = attendances.filter((a) => a.employee_id === emp.id);
      let presentDays = 0;
      let deductionDays = 0;
      const statusBreakdown: Record<string, number> = {};

      for (const att of empAttendances) {
        const status = att.status as AttendanceStatus;
        statusBreakdown[status] = (statusBreakdown[status] ?? 0) + 1;
        if (getMealAllowanceEligible(status)) {
          presentDays++;
        } else if (status === 'ALPHA') {
          deductionDays++;
        }
      }

      return {
        employee: emp,
        workingDays: workingDays.length,
        presentDays,
        deductionDays,
        totalAmount: presentDays * emp.mealAllowance,
        statusBreakdown,
      };
    });

    return NextResponse.json({ month, summaries, workingDays: workingDays.length });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
