import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { mapAttendance } from '@/lib/db';
import { checkIsLate, shouldCheckLate } from '@/lib/attendance-utils';
import { AttendanceStatus } from '@/types';

const UpdateAttendanceSchema = z.object({
  status: z.enum([
    'HADIR', 'TERLAMBAT', 'WFH', 'IZIN', 'SAKIT', 'CUTI',
    'DINAS_LUAR', 'SIDANG', 'PENDAMPINGAN', 'ALPHA',
  ]).optional(),
  checkIn: z.string().nullable().optional(),
  checkOut: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const data = UpdateAttendanceSchema.parse(body);

    const supabase = createServerClient();
    const { data: existing, error: fetchError } = await supabase
      .from('attendances')
      .select('*, employees(normal_check_in, late_tolerance_minutes)')
      .eq('id', id)
      .single();
    if (fetchError || !existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const status = (data.status ?? existing.status) as AttendanceStatus;
    const checkIn = 'checkIn' in data ? data.checkIn : existing.check_in;
    let isLate = existing.is_late;

    if (shouldCheckLate(status) && checkIn) {
      isLate = checkIsLate(
        checkIn,
        existing.employees.normal_check_in,
        existing.employees.late_tolerance_minutes,
      );
    } else if (!shouldCheckLate(status)) {
      isLate = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = { status, is_late: isLate };
    if ('checkIn' in data) updates.check_in = data.checkIn;
    if ('checkOut' in data) updates.check_out = data.checkOut;
    if ('notes' in data) updates.notes = data.notes;

    const { data: row, error } = await supabase
      .from('attendances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapAttendance(row));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = createServerClient();
    const { error } = await supabase.from('attendances').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
