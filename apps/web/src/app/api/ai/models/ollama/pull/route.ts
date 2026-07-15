import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { model } = await req.json().catch(() => ({ model: undefined }));
  if (!model) return NextResponse.json({ error: 'model required' }, { status: 400 });

  // Resolve the Ollama endpoint. Prefer the org's configured URL when a session
  // exists, but never hard-fail on a missing session — pulling is a local, non-
  // destructive operation and must also work in demo mode.
  let ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: user } = await supabase.from('users').select('organization_id').eq('id', session.user.id).single();
      const { data: org } = await supabase.from('organizations').select('ollama_base_url').eq('id', user?.organization_id).single();
      if (org?.ollama_base_url) ollamaUrl = org.ollama_base_url;
    }
  } catch {
    // no session / supabase unavailable — fall back to the env Ollama URL
  }

  let ollamaRes: Response;
  try {
    ollamaRes = await fetch(`${ollamaUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model, stream: true }),
    });
  } catch {
    return NextResponse.json(
      { error: `Cannot reach Ollama at ${ollamaUrl}. Start it with "ollama serve" (models pull locally; there is no Ollama on the hosted deployment).` },
      { status: 502 },
    );
  }

  if (!ollamaRes.ok || !ollamaRes.body) {
    const detail = await ollamaRes.text().catch(() => '');
    return NextResponse.json(
      { error: `Ollama could not pull "${model}"${detail ? `: ${detail.slice(0, 200)}` : ''}` },
      { status: 502 },
    );
  }

  return new NextResponse(ollamaRes.body, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
    },
  });
}
