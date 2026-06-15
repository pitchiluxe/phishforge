import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { OverviewStats } from '@/components/dashboard/overview-stats';
import { RecentCampaigns } from '@/components/dashboard/recent-campaigns';
import { ThreatFeed } from '@/components/dashboard/threat-feed';
import { UsageBar } from '@/components/dashboard/usage-bar';

export default async function DashboardPage() {
  const supabase = await getSafeClient();

  const [campaigns, threats, org] = supabase
    ? await Promise.all([
        supabase.from('campaigns').select('id,name,status,stats,created_at').order('created_at', { ascending: false }).limit(5).then(r => r.data ?? []),
        supabase.from('threat_intelligence').select('*').eq('is_active', true).order('published_at', { ascending: false }).limit(4).then(r => r.data ?? []),
        supabase.from('organizations').select('plan,simulations_used_this_month,monthly_simulation_limit').single().then(r => r.data),
      ])
    : [[], [], null];

  return (
    <div className="animate-in">
      <Header title="Overview" subtitle="Security awareness at a glance" />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <UsageBar
          used={org?.simulations_used_this_month ?? 0}
          limit={org?.monthly_simulation_limit ?? 100}
          plan={org?.plan ?? 'free'}
        />
        <OverviewStats campaigns={campaigns as Parameters<typeof OverviewStats>[0]['campaigns']} />
        <div className="dashboard-main-grid">
          <RecentCampaigns campaigns={campaigns as Parameters<typeof RecentCampaigns>[0]['campaigns']} />
          <ThreatFeed threats={threats as Parameters<typeof ThreatFeed>[0]['threats']} />
        </div>
      </div>
      <style>{`
        .dashboard-main-grid { display:grid; grid-template-columns:minmax(0,2fr) minmax(0,1fr); gap:16px; }
        @media(max-width:900px){ .dashboard-main-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
