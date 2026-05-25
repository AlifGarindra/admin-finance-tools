import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { mapAttendance } from '@/lib/db';
import { checkIsLate, shouldCheckLate } from '@/lib/attendance-utils';
import { AttendanceStatus } from '@/types';

const AttendanceStatusEnum = z.enum([
  'HADIR', 'TERLAMBAT', 'WFH', 'IZIN', 'SAKIT', 'CUTI',
  'DINAS_LUAR', 'SIDANG', 'PENDAMPINGAN', 'ALPHA',
]);

const CreateAttendanceSchema = z.object({
  employeeId: z.string(),
  date: z.string(),
  status: AttendanceStatusEnum,
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (['HADIR', 'TERLAMBAT'].includes(data.status) && !data.checkIn) return false;
  return true;
}, { message: 'Jam masuk wajib diisi untuk status Hadir/Terlambat' });

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
    const month = searchParams.get('month');
    const employeeId = searchParams.get('employeeId');

    const supabase = createServerClient();
    let query = supabase
      .from('attendances')
      .select('*, employees(*)')
      .order('date');

    if (month) {
      const [year, m] = month.split('-').map(Number);
      const start = `${year}-${String(m).padStart(2, '0')}-01`;
      const end = new Date(year, m, 0).toISOString().slice(0, 10);
      query = query.gte('date', start).lte('date', end);
    }
    if (employeeId) query = query.eq('employee_id', employeeId);

    const { data, error } = await query;
    if (error) throw error;

    const sorted = (data ?? [])
      .map(mapAttendance)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.employee?.name ?? '').localeCompare(b.employee?.name ?? '');
      });

    return NextResponse.json(sorted);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = CreateAttendanceSchema.parse(body);

    const supabase = createServerClient();
    const { data: emp, error: empError } = await supabase
      .from('employees')
      .select('normal_check_in, late_tolerance_minutes')
      .eq('id', data.employeeId)
      .single();
    if (empError || !emp) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });

    let isLate = false;
    if (shouldCheckLate(data.status as AttendanceStatus) && data.checkIn) {
      isLate = checkIsLate(data.checkIn, emp.normal_check_in, emp.late_tolerance_minutes);
    }

    const { data: row, error } = await supabase
      .from('attendances')
      .upsert(
        {
          employee_id: data.employeeId,
          date: data.date,
          status: data.status,
          check_in: data.checkIn ?? null,
          check_out: data.checkOut ?? null,
          is_late: isLate,
          notes: data.notes ?? null,
        },
        { onConflict: 'employee_id,date' }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapAttendance(row), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
