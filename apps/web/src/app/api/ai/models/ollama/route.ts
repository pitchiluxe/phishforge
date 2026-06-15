import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

async function getOllamaUrl(orgId: string): Promise<string> {
  const supabase = await createServerClient();
  const { data } = await supabase.from('organizations').select('ollama_base_url').eq('id', orgId).single();
  return data?.ollama_base_url ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
}

export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('users').select('organization_id').eq('id', session.user.id).single();
  const ollamaUrl = await getOllamaUrl(user?.organization_id ?? '');

  try {
    const res = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Ollama error ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data.models ?? []);
  } catch (error: any) {
    return NextResponse.json([], { status: 200 });
  }
}
