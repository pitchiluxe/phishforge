import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { CampaignGenerator } from '@/components/campaigns/campaign-generator';

export default async function NewCampaignPage() {
  const supabase = await getSafeClient();
  const org = supabase
    ? (await supabase.from('organizations').select('ai_provider,openrouter_model,ai_model,plan').single()).data
    : null;

  return (
    <div className="animate-in">
      <Header title="New Campaign" subtitle="Generate an AI-powered phishing simulation" />
      <div style={{ padding: 24 }}>
        <CampaignGenerator
          defaultProvider={org?.ai_provider ?? 'openrouter'}
          defaultModel={org?.openrouter_model ?? 'deepseek/deepseek-chat-v3-0324'}
          plan={org?.plan ?? 'free'}
        />
      </div>
    </div>
  );
}
