'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate, formatPercent } from '@/lib/utils';
import { Plus, ExternalLink } from 'lucide-react';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

const STATUS_S: Record<string, { color: string; bg: string; border: string }> = {
  draft:     { color: '#888',    bg: 'rgba(136,136,136,0.08)', border: 'rgba(136,136,136,0.2)' },
  scheduled: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)' },
  running:   { color: '#00ff41', bg: 'rgba(0,255,65,0.07)',    border: 'rgba(0,255,65,0.25)' },
  completed: { color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.25)' },
  paused:    { color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.25)' },
  cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
};

interface Campaign {
  id: string;
  name: string;
  status: string;
  simulation_type: string;
  industry: string;
  stats: { total_targets?: number; clicked?: number; opened?: number };
  created_at: string;
}

export function CampaignsTable({ campaigns: serverCampaigns }: { campaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(serverCampaigns);

  useEffect(() => {
    if (serverCampaigns.length > 0) return; // real DB has data
    try {
      const local = JSON.parse(localStorage.getItem('pf_demo_campaigns') ?? '[]') as Campaign[];
      if (local.length > 0) setCampaigns(local);
    } catch {}
  }, [serverCampaigns.length]);

  if (campaigns.length === 0) {
    return (
      <div style={{
        background: 'rgba(0,255,65,0.02)', border: '1px dashed rgba(0,255,65,0.2)',
        borderRadius: 6, padding: '56px 24px', textAlign: 'center',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Plus size={20} style={{ color: '#00ff41', opacity: 0.7 }} />
        </div>
        <p style={{ ...MONO, fontSize: 12, color: '#00ff41', opacity: 0.6, marginBottom: 6 }}>no campaigns yet</p>
        <p style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.3, marginBottom: 16 }}>Create your first phishing simulation to get started</p>
        <Link href="/dashboard/campaigns/new" style={{
          ...MONO, fontSize: 11, color: '#000', background: '#00ff41',
          textDecoration: 'none', padding: '8px 18px', borderRadius: 3,
          boxShadow: '0 0 12px rgba(0,255,65,0.35)',
        }}>
          + new_campaign
        </Link>
      </div>
    );
  }

  const HEADS = ['Campaign', 'Status', 'Type', 'Targets', 'Open Rate', 'Click Rate', 'Created', ''];

  return (
    <div style={{ background: 'rgba(0,255,65,0.025)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,255,65,0.1)', background: 'rgba(0,255,65,0.03)' }}>
              {HEADS.map((h, i) => (
                <th key={h + i} style={{
                  ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.45, fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  textAlign: i >= 3 && i <= 5 ? 'right' : 'left',
                  padding: '10px 14px', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign, i) => {
              const targets = campaign.stats?.total_targets ?? 0;
              const openRate = targets > 0 ? formatPercent(campaign.stats?.opened ?? 0, targets) : '—';
              const clickRate = targets > 0 ? formatPercent(campaign.stats?.clicked ?? 0, targets) : '—';
              const clickPct = targets > 0 ? Math.round(((campaign.stats?.clicked ?? 0) / targets) * 100) : 0;
              const s = STATUS_S[campaign.status] ?? STATUS_S.draft;
              return (
                <tr key={campaign.id} style={{ borderBottom: i < campaigns.length - 1 ? '1px solid rgba(0,255,65,0.07)' : 'none' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ ...MONO, fontSize: 12, color: '#c8ffd4', marginBottom: 2 }}>{campaign.name}</div>
                    <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.35, textTransform: 'capitalize' }}>{campaign.industry}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ ...MONO, fontSize: 9, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 3, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {campaign.status}
                    </span>
                  </td>
                  <td style={{ ...MONO, padding: '12px 14px', fontSize: 11, color: '#00ff41', opacity: 0.5, textTransform: 'capitalize' }}>
                    {campaign.simulation_type ?? '—'}
                  </td>
                  <td style={{ ...MONO, padding: '12px 14px', fontSize: 12, color: '#c8ffd4', textAlign: 'right' }}>{targets.toLocaleString()}</td>
                  <td style={{ ...MONO, padding: '12px 14px', fontSize: 12, color: '#00ff41', opacity: 0.6, textAlign: 'right' }}>{openRate}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <span style={{ ...MONO, fontSize: 12, fontWeight: 600, color: clickPct > 30 ? '#ff4444' : '#00ff41' }}>
                      {clickRate}
                    </span>
                  </td>
                  <td style={{ ...MONO, padding: '12px 14px', fontSize: 10, color: '#00ff41', opacity: 0.4, whiteSpace: 'nowrap' }}>
                    {formatDate(campaign.created_at)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Link href={`/dashboard/campaigns/${campaign.id}`} style={{ display: 'flex', alignItems: 'center', color: '#00ff41', opacity: 0.4 }}>
                      <ExternalLink size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
