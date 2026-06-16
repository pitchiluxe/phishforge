import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase.from('users').select('organization_id, role').eq('id', session.user.id).single();
  if (!['owner', 'admin', 'manager'].includes(user?.role ?? '')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 413 });

  const { data: doc, error } = await supabase.from('knowledge_documents').insert({
    organization_id: user?.organization_id,
    uploaded_by: session.user.id,
    name: file.name,
    file_type: file.type,
    file_size: file.size,
    status: 'uploading',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Process asynchronously (fire and forget)
  processDocument(doc.id, file, user?.organization_id ?? '', supabase).catch(console.error);

  return NextResponse.json({ document: doc });
}

async function processDocument(docId: string, file: File, orgId: string, supabase: any) {
  await supabase.from('knowledge_documents').update({ status: 'processing' }).eq('id', docId);

  try {
    const buffer = await file.arrayBuffer();
    let text = '';

    if (file.type === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = await pdfParse(Buffer.from(buffer));
      text = parsed.text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      text = result.value;
    } else {
      text = new TextDecoder().decode(buffer);
    }

    if (!text.trim()) throw new Error('No text content found in document');

    // Chunk text
    const chunks = chunkText(text);

    // Embed and index via OpenRouter (text-embedding-3-small via OpenAI compat)
    const { Pinecone } = await import('@pinecone-database/pinecone');
    const OpenAI = (await import('openai')).default;

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.ANTHROPIC_AUTH_TOKEN ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.OPENAI_API_KEY ||
      '';
    if (!apiKey) throw new Error('No AI API key configured');

    const openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
    });

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX ?? 'phishforge-knowledge');
    const namespace = `org-${orgId}`;

    const BATCH = 50;
    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH);
      const embedRes = await openai.embeddings.create({ model: 'text-embedding-3-small', input: batch });
      const vectors = embedRes.data.map((e, j) => ({
        id: `${docId}-chunk-${i + j}`,
        values: e.embedding,
        metadata: { document_id: docId, organization_id: orgId, chunk_index: i + j, text: batch[j], document_name: '' },
      }));
      await index.namespace(namespace).upsert(vectors);
    }

    await supabase.from('knowledge_documents').update({
      status: 'indexed',
      chunk_count: chunks.length,
      pinecone_namespace: namespace,
    }).eq('id', docId);
  } catch (error: any) {
    await supabase.from('knowledge_documents').update({
      status: 'failed',
      error_message: error.message,
    }).eq('id', docId);
  }
}

function chunkText(text: string, size = 512, overlap = 50): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    chunks.push(words.slice(i, i + size).join(' '));
    i += size - overlap;
  }
  return chunks;
}
