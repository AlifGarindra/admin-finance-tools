import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { mapEmployee } from '@/lib/db';

const CreateEmployeeSchema = z.object({
  name: z.string().min(1),
  position: z.string().optional(),
  department: z.string().optional(),
  joinDate: z.string(),
  mealAllowance: z.number().min(0).default(40000),
  normalCheckIn: z.string().default('08:00'),
  lateToleranceMinutes: z.number().min(0).default(15),
  workDays: z.array(z.string()).default(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
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

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const supabase = createServerClient();
    let query = supabase.from('employees').select('*').order('name');
    if (!includeInactive) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json((data ?? []).map(mapEmployee));
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = CreateEmployeeSchema.parse(body);

    const supabase = createServerClient();
    const { data: row, error } = await supabase
      .from('employees')
      .insert({
        name: data.name,
        position: data.position ?? null,
        department: data.department ?? null,
        join_date: data.joinDate,
        meal_allowance: data.mealAllowance,
        normal_check_in: data.normalCheckIn,
        late_tolerance_minutes: data.lateToleranceMinutes,
        work_days: data.workDays,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapEmployee(row), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
