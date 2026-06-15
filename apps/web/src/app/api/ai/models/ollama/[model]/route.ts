import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('users').select('organization_id').eq('id', session.user.id).single();
  const { data: org } = await supabase.from('organizations').select('ollama_base_url').eq('id', user?.organization_id).single();
  const ollamaUrl = org?.ollama_base_url ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

  const modelName = decodeURIComponent(model);

  const res = await fetch(`${ollamaUrl}/api/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: modelName }),
  });

  if (!res.ok) return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 });
  return NextResponse.json({ success: true });
}
