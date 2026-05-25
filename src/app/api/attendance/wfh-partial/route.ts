import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const Schema = z.object({
  date: z.string(),
  employeeIds: z.array(z.string()).min(1),
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

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { date, employeeIds } = Schema.parse(await req.json());
    const supabase = createServerClient();

    const { data: existing } = await supabase
      .from('attendances')
      .select('employee_id')
      .eq('date', date)
      .in('employee_id', employeeIds);

    const existingIds = new Set((existing ?? []).map((a) => a.employee_id));

    const toCreate = employeeIds
      .filter((id) => !existingIds.has(id))
      .map((employee_id) => ({ employee_id, date, status: 'WFH', is_late: false }));

    if (toCreate.length > 0) {
      const { error } = await supabase.from('attendances').insert(toCreate);
      if (error) throw error;
    }

    return NextResponse.json({ created: toCreate.length, skipped: existingIds.size });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
