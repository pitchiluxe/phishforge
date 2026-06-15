import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('users').select('organization_id, role').eq('id', session.user.id).single();

  const { data: doc } = await supabase.from('knowledge_documents')
    .select('*').eq('id', id).eq('organization_id', user?.organization_id).single();

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    if (doc.chunk_count > 0 && doc.pinecone_namespace) {
      const { Pinecone } = await import('@pinecone-database/pinecone');
      const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
      const index = pinecone.index(process.env.PINECONE_INDEX ?? 'phishforge-knowledge');
      const ids = Array.from({ length: doc.chunk_count }, (_, i) => `${id}-chunk-${i}`);
      await index.namespace(doc.pinecone_namespace).deleteMany(ids);
    }
  } catch {}

  await supabase.from('knowledge_documents').delete().eq('id', id);
  return NextResponse.json({ success: true });
}
