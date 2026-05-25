import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

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

    const supabase = createServerClient();
    const { data, error } = await supabase.from('app_settings').select('key, value');
    if (error) throw error;

    const map: Record<string, string> = {};
    (data ?? []).forEach((s) => { map[s.key] = s.value; });
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body: Record<string, string> = await req.json();
    const supabase = createServerClient();

    const rows = Object.entries(body).map(([key, value]) => ({ key, value }));
    const { error } = await supabase
      .from('app_settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
