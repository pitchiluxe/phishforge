import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

function isDemoOrPlaceholder() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return !url || url.includes('placeholder');
}

export async function GET(req: NextRequest) {
  if (isDemoOrPlaceholder()) return NextResponse.json([]);

  const cookieStore = await cookies();
  if (cookieStore.get('pf_demo')?.value === '1') return NextResponse.json([]);

  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('users').select('organization_id').eq('id', session.user.id).single();

  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .eq('organization_id', user?.organization_id)
    .order('created_at', { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Demo / placeholder mode — return a fake campaign ID so the generator can proceed to the AI step
  if (isDemoOrPlaceholder()) {
    const fakeId = `demo-${Date.now()}`;
    return NextResponse.json({ id: fakeId, name: body.name ?? 'Demo Campaign', status: 'draft' }, { status: 201 });
  }

  const cookieStore = await cookies();
  if (cookieStore.get('pf_demo')?.value === '1') {
    const fakeId = `demo-${Date.now()}`;
    return NextResponse.json({ id: fakeId, name: body.name ?? 'Demo Campaign', status: 'draft' }, { status: 201 });
  }

  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('users').select('organization_id, role').eq('id', session.user.id).single();
  if (!['owner', 'admin', 'manager'].includes(user?.role ?? '')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      ...body,
      organization_id: user?.organization_id,
      created_by: session.user.id,
      status: 'draft',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
