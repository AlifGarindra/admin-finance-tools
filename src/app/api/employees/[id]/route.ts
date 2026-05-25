import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { mapEmployee } from '@/lib/db';

const UpdateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  joinDate: z.string().optional(),
  isActive: z.boolean().optional(),
  mealAllowance: z.number().min(0).optional(),
  normalCheckIn: z.string().optional(),
  lateToleranceMinutes: z.number().min(0).optional(),
  workDays: z.array(z.string()).optional(),
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = createServerClient();
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(mapEmployee(data));
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const data = UpdateEmployeeSchema.parse(body);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.position !== undefined) updates.position = data.position;
    if (data.department !== undefined) updates.department = data.department;
    if (data.joinDate !== undefined) updates.join_date = data.joinDate;
    if (data.isActive !== undefined) updates.is_active = data.isActive;
    if (data.mealAllowance !== undefined) updates.meal_allowance = data.mealAllowance;
    if (data.normalCheckIn !== undefined) updates.normal_check_in = data.normalCheckIn;
    if (data.lateToleranceMinutes !== undefined) updates.late_tolerance_minutes = data.lateToleranceMinutes;
    if (data.workDays !== undefined) updates.work_days = data.workDays;

    const supabase = createServerClient();
    const { data: row, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapEmployee(row));
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
    const { error } = await supabase.from('employees').update({ is_active: false }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
