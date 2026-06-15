import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { CampaignsTable } from '@/components/campaigns/campaigns-table';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function CampaignsPage() {
  const supabase = await getSafeClient();
  const campaigns = supabase
    ? (await supabase.from('campaigns').select('*').order('created_at', { ascending: false })).data ?? []
    : [];

  return (
    <div className="animate-in">
      <Header title="Campaigns" subtitle="Manage your phishing simulations">
        <Link
          href="/dashboard/campaigns/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, fontWeight: 600,
            color: '#000', background: '#00ff41',
            padding: '6px 14px', borderRadius: 3, textDecoration: 'none',
            boxShadow: '0 0 12px rgba(0,255,65,0.4)',
            letterSpacing: '0.05em',
          }}
        >
          <Plus size={13} />
          new_campaign
        </Link>
      </Header>
      <div style={{ padding: 24 }}>
        <CampaignsTable campaigns={campaigns as Parameters<typeof CampaignsTable>[0]['campaigns']} />
      </div>
    </div>
  );
}
