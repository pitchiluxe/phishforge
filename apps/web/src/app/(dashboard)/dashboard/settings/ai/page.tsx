import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { AISettingsPanel } from '@/components/ai/ai-settings-panel';

export default async function AISettingsPage() {
  const supabase = await getSafeClient();
  const org = supabase
    ? (await supabase.from('organizations').select('ai_provider,ai_model,ollama_base_url,openrouter_model').single()).data
    : null;

  return (
    <div className="animate-in">
      <Header title="AI Settings" subtitle="Configure AI providers and models" />
      <div style={{ padding: 24 }}>
        <AISettingsPanel
          currentProvider={org?.ai_provider ?? 'openrouter'}
          currentModel={org?.ai_model ?? ''}
          ollamaBaseUrl={org?.ollama_base_url ?? process.env.NEXT_PUBLIC_OLLAMA_BASE_URL ?? 'http://localhost:11434'}
          openrouterModel={org?.openrouter_model ?? 'deepseek/deepseek-chat-v3-0324'}
        />
      </div>
    </div>
  );
}
