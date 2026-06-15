import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { model } = await req.json();
  if (!model) return NextResponse.json({ error: 'model required' }, { status: 400 });

  const { data: user } = await supabase.from('users').select('organization_id').eq('id', session.user.id).single();
  const { data: org } = await supabase.from('organizations').select('ollama_base_url').eq('id', user?.organization_id).single();
  const ollamaUrl = org?.ollama_base_url ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

  const ollamaRes = await fetch(`${ollamaUrl}/api/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: model, stream: true }),
  });

  if (!ollamaRes.ok) {
    return NextResponse.json({ error: 'Ollama pull failed' }, { status: 500 });
  }

  return new NextResponse(ollamaRes.body, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
    },
  });
}
