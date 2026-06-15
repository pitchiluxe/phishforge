'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  status: string;
  stats: { total_targets?: number; clicked?: number };
  created_at: string;
}

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  draft:     { color: '#888',    bg: 'rgba(136,136,136,0.08)', border: 'rgba(136,136,136,0.2)'  },
  scheduled: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)'  },
  running:   { color: '#00ff41', bg: 'rgba(0,255,65,0.07)',    border: 'rgba(0,255,65,0.25)'    },
  completed: { color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.25)' },
  paused:    { color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.25)'  },
  cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
};

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

const CARD = {
  background: 'rgba(0,255,65,0.03)',
  border: '1px solid rgba(0,255,65,0.18)',
  borderRadius: 6,
  boxShadow: '0 0 20px rgba(0,255,65,0.04)',
  overflow: 'hidden' as const,
};

export function RecentCampaigns({ campaigns: serverCampaigns }: { campaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(serverCampaigns);

  useEffect(() => {
    if (serverCampaigns.length > 0) return;
    try {
      const local = JSON.parse(localStorage.getItem('pf_demo_campaigns') ?? '[]') as Campaign[];
      if (local.length > 0) setCampaigns(local.slice(0, 5));
    } catch {}
  }, [serverCampaigns.length]);

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
        <span style={{ ...MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#00ff41', textTransform: 'uppercase' }}>
          // Recent Campaigns
        </span>
        <Link href="/dashboard/campaigns" style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.55, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          view_all <ArrowRight size={10} />
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 12, textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} style={{ color: '#00ff41', opacity: 0.7 }} />
          </div>
          <div>
            <p style={{ ...MONO, fontSize: 12, color: '#00ff41', opacity: 0.7, marginBottom: 4 }}>no campaigns yet</p>
            <p style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.35 }}>run your first phishing simulation</p>
          </div>
          <Link href="/dashboard/campaigns/new" style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.65, textDecoration: 'none', marginTop: 4 }}>
            + new_campaign →
          </Link>
        </div>
      ) : (
        <div>
          {campaigns.map((campaign, i) => {
            const clickRate = campaign.stats?.total_targets
              ? Math.round(((campaign.stats?.clicked ?? 0) / campaign.stats.total_targets) * 100)
              : null;
            const s = STATUS_STYLE[campaign.status] ?? STATUS_STYLE.draft;
            return (
              <Link
                key={campaign.id}
                href={`/dashboard/campaigns/${campaign.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 18px',
                  borderBottom: i < campaigns.length - 1 ? '1px solid rgba(0,255,65,0.07)' : 'none',
                  textDecoration: 'none', background: 'transparent', transition: 'background 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,65,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: s.color, boxShadow: `0 0 6px ${s.color}60` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...MONO, fontSize: 12, color: '#c8ffd4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campaign.name}</div>
                  <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.35, marginTop: 2 }}>{formatDate(campaign.created_at)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {clickRate !== null && (
                    <span style={{ ...MONO, fontSize: 11, color: clickRate > 30 ? '#ff4444' : '#00ff41', opacity: 0.8 }}>{clickRate}% clicked</span>
                  )}
                  <span style={{ ...MONO, fontSize: 10, fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 3, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {campaign.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
