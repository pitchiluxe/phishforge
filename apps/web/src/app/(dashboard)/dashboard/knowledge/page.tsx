import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { KnowledgeBase } from '@/components/knowledge/knowledge-base';

export default async function KnowledgePage() {
  const supabase = await getSafeClient();
  const documents = supabase
    ? (await supabase.from('knowledge_documents').select('*').order('created_at', { ascending: false })).data ?? []
    : [];

  return (
    <div className="animate-in">
      <Header title="Knowledge Base" subtitle="Cybersecurity article library + upload your own documents to personalize simulations" />
      <div style={{ padding: 24 }}>
        <KnowledgeBase documents={documents as Parameters<typeof KnowledgeBase>[0]['documents']} />
      </div>
    </div>
  );
}
