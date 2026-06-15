import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import type { DashboardStats, AnalyticsSummary } from '@phishforge/shared';

@Injectable()
export class AnalyticsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getDashboardStats(orgId: string): Promise<DashboardStats> {
    const [campaignsRes, orgRes, aiLogsRes] = await Promise.all([
      this.supabase.db
        .from('campaigns')
        .select('id, status, stats')
        .eq('organization_id', orgId),
      this.supabase.db
        .from('organizations')
        .select('simulations_used_this_month, monthly_simulation_limit')
        .eq('id', orgId)
        .single(),
      this.supabase.db
        .from('ai_generation_logs')
        .select('id')
        .eq('organization_id', orgId)
        .eq('success', true),
    ]);

    const campaigns = campaignsRes.data ?? [];
    const completedCampaigns = campaigns.filter((c) => c.status === 'completed');
    const activeCampaigns = campaigns.filter((c) => ['running', 'scheduled'].includes(c.status));

    let totalClicked = 0, totalTargets = 0, totalReported = 0;
    completedCampaigns.forEach((c) => {
      totalTargets += c.stats?.total_targets ?? 0;
      totalClicked += c.stats?.clicked ?? 0;
      totalReported += c.stats?.reported ?? 0;
    });

    return {
      total_campaigns: campaigns.length,
      active_campaigns: activeCampaigns.length,
      total_simulations: aiLogsRes.data?.length ?? 0,
      simulations_this_month: orgRes.data?.simulations_used_this_month ?? 0,
      average_click_rate: totalTargets > 0 ? Math.round((totalClicked / totalTargets) * 100) : 0,
      average_report_rate: totalTargets > 0 ? Math.round((totalReported / totalTargets) * 100) : 0,
      improvement_rate: 0,
    };
  }

  async getSummary(orgId: string, period: '7d' | '30d' | '90d' | '365d' = '30d'): Promise<AnalyticsSummary> {
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
    const days = daysMap[period];
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: events } = await this.supabase.db
      .from('tracking_events')
      .select('event_type, created_at')
      .eq('organization_id', orgId)
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    const clicksByDay = this.groupEventsByDay(events ?? [], 'clicked');
    const campaignsByDay = await this.getCampaignsByDay(orgId, since);

    return {
      period,
      click_rate_trend: clicksByDay,
      campaigns_launched: campaignsByDay,
      department_scores: [],
      top_risky_employees: [],
    };
  }

  async getThreatIntelligence(industry?: string, limit = 20) {
    let query = this.supabase.db
      .from('threat_intelligence')
      .select('*')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (industry) {
      query = query.contains('industries', [industry]);
    }

    const { data } = await query;
    return data ?? [];
  }

  private groupEventsByDay(events: any[], eventType: string) {
    const map = new Map<string, number>();
    events
      .filter((e) => e.event_type === eventType)
      .forEach((e) => {
        const day = e.created_at.split('T')[0];
        map.set(day, (map.get(day) ?? 0) + 1);
      });
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
  }

  private async getCampaignsByDay(orgId: string, since: string) {
    const { data } = await this.supabase.db
      .from('campaigns')
      .select('created_at')
      .eq('organization_id', orgId)
      .gte('created_at', since);

    const map = new Map<string, number>();
    (data ?? []).forEach((c) => {
      const day = c.created_at.split('T')[0];
      map.set(day, (map.get(day) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
  }
}
