import { NextRequest, NextResponse } from 'next/server';

function isPlaceholder() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return !url || url.includes('placeholder');
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, role } = body as { email?: string; role?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  // Demo mode — simulate a successful invite
  if (isPlaceholder()) {
    await new Promise(r => setTimeout(r, 600));
    return NextResponse.json({ ok: true, demo: true, message: `Demo: invite would be sent to ${email} with role ${role ?? 'analyst'}` });
  }

  // Real Supabase — use admin invite
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role: role ?? 'analyst' },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/accept-invite`,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, userId: data.user.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send invite';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
