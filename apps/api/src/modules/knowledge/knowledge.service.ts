import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import type { VectorSearchResult } from '@phishforge/shared';

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 50;
const EMBEDDING_MODEL = 'text-embedding-3-small';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private readonly pinecone: Pinecone;
  private readonly openai: OpenAI;

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {
    this.pinecone = new Pinecone({ apiKey: this.config.getOrThrow('PINECONE_API_KEY') });
    this.openai = new OpenAI({
      apiKey: this.config.get('OPENROUTER_API_KEY'),
      baseURL: this.config.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
    });
  }

  async processDocument(documentId: string, text: string, orgId: string): Promise<void> {
    await this.supabase.db
      .from('knowledge_documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    try {
      const chunks = this.chunkText(text);
      const namespace = `org-${orgId}`;
      const index = this.pinecone.index(this.config.getOrThrow('PINECONE_INDEX'));

      const batchSize = 100;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const embeddings = await this.embed(batch);

        const vectors = embeddings.map((embedding, j) => ({
          id: `${documentId}-chunk-${i + j}`,
          values: embedding,
          metadata: {
            document_id: documentId,
            organization_id: orgId,
            chunk_index: i + j,
            text: batch[j],
          },
        }));

        await index.namespace(namespace).upsert(vectors);
      }

      await this.supabase.db
        .from('knowledge_documents')
        .update({ status: 'indexed', chunk_count: chunks.length, pinecone_namespace: namespace })
        .eq('id', documentId);
    } catch (error: any) {
      this.logger.error(`Failed to process document ${documentId}: ${error.message}`);
      await this.supabase.db
        .from('knowledge_documents')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', documentId);
    }
  }

  async search(query: string, orgId: string, topK = 5): Promise<VectorSearchResult[]> {
    try {
      const [embedding] = await this.embed([query]);
      const namespace = `org-${orgId}`;
      const index = this.pinecone.index(this.config.getOrThrow('PINECONE_INDEX'));

      const results = await index.namespace(namespace).query({
        vector: embedding,
        topK,
        includeMetadata: true,
      });

      return (results.matches ?? []).map((match) => ({
        id: match.id,
        score: match.score ?? 0,
        text: (match.metadata?.text as string) ?? '',
        metadata: {
          document_id: (match.metadata?.document_id as string) ?? '',
          document_name: (match.metadata?.document_name as string) ?? '',
          chunk_index: (match.metadata?.chunk_index as number) ?? 0,
          organization_id: orgId,
        },
      }));
    } catch (error: any) {
      this.logger.error(`Vector search failed: ${error.message}`);
      return [];
    }
  }

  async deleteDocument(documentId: string, orgId: string): Promise<void> {
    const namespace = `org-${orgId}`;
    const index = this.pinecone.index(this.config.getOrThrow('PINECONE_INDEX'));

    const { data: doc } = await this.supabase.db
      .from('knowledge_documents')
      .select('chunk_count')
      .eq('id', documentId)
      .single();

    if (doc?.chunk_count) {
      const ids = Array.from({ length: doc.chunk_count }, (_, i) => `${documentId}-chunk-${i}`);
      await index.namespace(namespace).deleteMany(ids);
    }

    await this.supabase.db.from('knowledge_documents').delete().eq('id', documentId);
  }

  private async embed(texts: string[]): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    });
    return response.data.map((d) => d.embedding);
  }

  private chunkText(text: string): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let i = 0;

    while (i < words.length) {
      const chunk = words.slice(i, i + CHUNK_SIZE).join(' ');
      chunks.push(chunk);
      i += CHUNK_SIZE - CHUNK_OVERLAP;
    }

    return chunks.filter((c) => c.trim().length > 0);
  }
}
