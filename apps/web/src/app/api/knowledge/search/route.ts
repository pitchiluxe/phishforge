import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('users').select('organization_id').eq('id', session.user.id).single();
  const orgId = user?.organization_id;

  const q = req.nextUrl.searchParams.get('q');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '5');

  if (!q) return NextResponse.json([]);

  try {
    const OpenAI = (await import('openai')).default;
    const { Pinecone } = await import('@pinecone-database/pinecone');

    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
    });

    const embedRes = await openai.embeddings.create({ model: 'text-embedding-3-small', input: [q] });
    const vector = embedRes.data[0].embedding;

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX ?? 'phishforge-knowledge');
    const namespace = `org-${orgId}`;

    const results = await index.namespace(namespace).query({ vector, topK: limit, includeMetadata: true });
    return NextResponse.json(
      (results.matches ?? []).map((m) => ({
        id: m.id,
        score: m.score,
        text: m.metadata?.text ?? '',
        metadata: m.metadata,
      })),
    );
  } catch (error: any) {
    return NextResponse.json([]);
  }
}
