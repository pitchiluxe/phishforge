'use client';

import { useEffect, useState } from 'react';
import { Mail, TrendingDown, ShieldCheck, Activity } from 'lucide-react';

interface Campaign {
  status: string;
  stats: { total_targets?: number; clicked?: number; reported?: number };
}

const CARD_STYLE = {
  background: 'rgba(0,255,65,0.03)',
  border: '1px solid rgba(0,255,65,0.18)',
  borderRadius: 6,
  padding: '20px 18px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 14,
  boxShadow: '0 0 20px rgba(0,255,65,0.04), inset 0 1px 0 rgba(0,255,65,0.06)',
};

const LABEL_STYLE = {
  fontFamily: 'var(--font-fira-code), monospace',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: '#00ff41',
  opacity: 0.45,
};

const VALUE_STYLE = {
  fontFamily: 'var(--font-fira-code), monospace',
  fontSize: 28,
  fontWeight: 700,
  color: '#00ff41',
  lineHeight: 1,
};

export function OverviewStats({ campaigns: serverCampaigns }: { campaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(serverCampaigns);

  useEffect(() => {
    if (serverCampaigns.length > 0) return;
    try {
      const local = JSON.parse(localStorage.getItem('pf_demo_campaigns') ?? '[]') as Campaign[];
      if (local.length > 0) setCampaigns(local);
    } catch {}
  }, [serverCampaigns.length]);

  const total = campaigns.length;
  const active = campaigns.filter(c => ['running', 'scheduled'].includes(c.status)).length;
  const completed = campaigns.filter(c => c.status === 'completed');
  const totalTargets = completed.reduce((s, c) => s + (c.stats?.total_targets ?? 0), 0);
  const totalClicks  = completed.reduce((s, c) => s + (c.stats?.clicked ?? 0), 0);
  const totalReports = completed.reduce((s, c) => s + (c.stats?.reported ?? 0), 0);
  const clickRate  = totalTargets ? Math.round((totalClicks  / totalTargets) * 100) : 0;
  const reportRate = totalTargets ? Math.round((totalReports / totalTargets) * 100) : 0;

  const stats = [
    { label: 'Total Campaigns', value: total,          icon: Mail,        trend: null,                                          warn: false },
    { label: 'Active',          value: active,         icon: Activity,    trend: active > 0 ? `${active} running` : 'none running', warn: false },
    { label: 'Avg. Click Rate', value: `${clickRate}%`, icon: TrendingDown, trend: clickRate > 30 ? 'High risk' : 'Healthy',      warn: clickRate > 30 },
    { label: 'Report Rate',     value: `${reportRate}%`, icon: ShieldCheck, trend: reportRate > 20 ? 'Excellent' : 'Needs work',   warn: false },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} style={CARD_STYLE}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={LABEL_STYLE}>{stat.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 4, background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={13} style={{ color: '#00ff41', opacity: 0.8 }} />
              </div>
            </div>
            <div style={VALUE_STYLE}>{stat.value}</div>
            {stat.trend && (
              <div style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: stat.warn ? '#ff4444' : '#00ff41', opacity: stat.warn ? 0.85 : 0.6 }}>
                {stat.warn ? '⚠ ' : '✓ '}{stat.trend}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
