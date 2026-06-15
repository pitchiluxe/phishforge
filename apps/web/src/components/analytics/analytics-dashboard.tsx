'use client';

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  status: string;
  stats: { total_targets?: number; sent?: number; opened?: number; clicked?: number; reported?: number };
  created_at: string;
}

interface TrackingEvent {
  event_type: string;
  created_at: string;
}

interface AnalyticsDashboardProps {
  campaigns: Campaign[];
  events: TrackingEvent[];
}

export function AnalyticsDashboard({ campaigns, events }: AnalyticsDashboardProps) {
  // Build daily click/open timeseries
  const dailyData = buildDailyTimeseries(events);

  // Campaign performance
  const completed = campaigns.filter((c) => c.status === 'completed' && c.stats?.total_targets);
  const campaignPerformance = completed.slice(0, 10).map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + '…' : c.name,
    openRate: c.stats.total_targets ? Math.round(((c.stats.opened ?? 0) / c.stats.total_targets) * 100) : 0,
    clickRate: c.stats.total_targets ? Math.round(((c.stats.clicked ?? 0) / c.stats.total_targets) * 100) : 0,
    reportRate: c.stats.total_targets ? Math.round(((c.stats.reported ?? 0) / c.stats.total_targets) * 100) : 0,
  }));

  const totalTargets = completed.reduce((s, c) => s + (c.stats?.total_targets ?? 0), 0);
  const totalClicked = completed.reduce((s, c) => s + (c.stats?.clicked ?? 0), 0);
  const totalReported = completed.reduce((s, c) => s + (c.stats?.reported ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total targets tested', value: totalTargets.toLocaleString(), color: 'text-indigo-500' },
          { label: 'Overall click rate', value: totalTargets ? `${Math.round((totalClicked / totalTargets) * 100)}%` : '—', color: totalTargets && totalClicked / totalTargets > 0.3 ? 'text-red-500' : 'text-green-500' },
          { label: 'Report rate', value: totalTargets ? `${Math.round((totalReported / totalTargets) * 100)}%` : '—', color: 'text-violet-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className={cn('text-3xl font-bold', s.color)}>{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Time series */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4">Event Activity (Last 30 days)</h2>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="opens" name="Opens" stroke="#8b5cf6" fill="url(#colorOpens)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#6366f1" fill="url(#colorClicks)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
            No event data for this period
          </div>
        )}
      </div>

      {/* Campaign performance */}
      {campaignPerformance.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Campaign Performance Comparison</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={campaignPerformance} margin={{ top: 4, right: 8, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} unit="%" />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="openRate" name="Open %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clickRate" name="Click %" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reportRate" name="Report %" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function buildDailyTimeseries(events: TrackingEvent[]) {
  const map = new Map<string, { date: string; opens: number; clicks: number; reports: number }>();

  events.forEach((e) => {
    const date = e.created_at.split('T')[0];
    const existing = map.get(date) ?? { date, opens: 0, clicks: 0, reports: 0 };
    if (e.event_type === 'opened') existing.opens++;
    if (e.event_type === 'clicked') existing.clicks++;
    if (e.event_type === 'reported') existing.reports++;
    map.set(date, existing);
  });

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
