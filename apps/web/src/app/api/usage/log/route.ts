import { NextRequest, NextResponse } from 'next/server';

function isPlaceholder() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return !url || url.includes('placeholder');
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    feature: string;       // 'cyberlm' | 'brain' | 'training' | 'classroom' | 'campaign'
    tokensUsed: number;
    model: string;
    latencyMs?: number;
  };

  // Demo mode — nothing to persist, caller stores in localStorage
  if (isPlaceholder()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const { createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: user } = await supabase
      .from('users').select('organization_id').eq('id', session.user.id).single();

    if (!user?.organization_id) return NextResponse.json({ error: 'No org' }, { status: 400 });

    // Log individual event
    await supabase.from('ai_token_usage').insert({
      organization_id: user.organization_id,
      user_id: session.user.id,
      feature: body.feature,
      tokens_used: body.tokensUsed,
      model: body.model,
      latency_ms: body.latencyMs ?? 0,
    });

    // Atomically increment monthly counter on org
    await supabase.rpc('increment_token_usage', {
      org_id: user.organization_id,
      amount: body.tokensUsed,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    // Non-fatal — usage logging should never break the primary flow
    console.error('[usage/log]', err);
    return NextResponse.json({ ok: true, warning: 'logging failed' });
  }
}
