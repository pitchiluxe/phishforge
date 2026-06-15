import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';

export default async function AnalyticsPage() {
  const supabase = await getSafeClient();

  const [campaigns, events] = supabase
    ? await Promise.all([
        supabase.from('campaigns').select('id,name,status,stats,created_at').order('created_at', { ascending: false }).then(r => r.data ?? []),
        supabase.from('tracking_events').select('event_type,created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true }).then(r => r.data ?? []),
      ])
    : [[], []];

  return (
    <div className="animate-in">
      <Header title="Analytics" subtitle="Security awareness trends and insights" />
      <div style={{ padding: 24 }}>
        <AnalyticsDashboard
          campaigns={campaigns as Parameters<typeof AnalyticsDashboard>[0]['campaigns']}
          events={events as Parameters<typeof AnalyticsDashboard>[0]['events']}
        />
      </div>
    </div>
  );
}
