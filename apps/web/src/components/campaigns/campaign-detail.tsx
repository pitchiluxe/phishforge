'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Calendar, Target, Shield, Zap,
  BarChart2, MousePointerClick, Mail, Eye, Flag,
  Pencil, Play, Trash2, RefreshCw,
} from 'lucide-react';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  draft:     { color: '#888',    bg: 'rgba(136,136,136,0.08)', border: 'rgba(136,136,136,0.25)' },
  scheduled: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.3)'  },
  running:   { color: '#00ff41', bg: 'rgba(0,255,65,0.07)',    border: 'rgba(0,255,65,0.3)'    },
  completed: { color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.3)' },
  paused:    { color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.3)'  },
  cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.3)' },
};

const DIFF_LABEL = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Expert'];

interface Campaign {
  id: string;
  name: string;
  status: string;
  simulation_type: string;
  industry: string;
  target_role?: string;
  difficulty?: number;
  stats?: { total_targets?: number; opened?: number; clicked?: number; reported?: number };
  created_at: string;
}

function Stat({ icon: Icon, label, value, color = '#00ff41' }: {
  icon: React.ElementType; label: string; value: string | number; color?: string;
}) {
  return (
    <div style={{
      background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.1)',
      borderRadius: 6, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={11} style={{ color, opacity: 0.6 }} />
        <span style={{ ...MONO, fontSize: 9, color, opacity: 0.45, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <span style={{ ...MONO, fontSize: 22, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ ...MONO, fontSize: 12, color: '#c8ffd4', textTransform: 'capitalize' }}>{value}</span>
    </div>
  );
}

export function CampaignDetail({ id }: { id: string }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
      const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

      if (isPlaceholder || id.startsWith('demo-')) {
        // Read from localStorage
        try {
          const stored: Campaign[] = JSON.parse(localStorage.getItem('pf_demo_campaigns') ?? '[]');
          const found = stored.find(c => c.id === id);
          if (found) { setCampaign(found); } else { setNotFound(true); }
        } catch { setNotFound(true); }
        setLoading(false);
        return;
      }

      // Real Supabase fetch
      try {
        const res = await fetch(`/api/campaigns/${id}`);
        if (!res.ok) { setNotFound(true); } else { setCampaign(await res.json()); }
      } catch { setNotFound(true); }
      setLoading(false);
    }
    load();
  }, [id]);

  function handleDelete() {
    try {
      const stored: Campaign[] = JSON.parse(localStorage.getItem('pf_demo_campaigns') ?? '[]');
      localStorage.setItem('pf_demo_campaigns', JSON.stringify(stored.filter(c => c.id !== id)));
    } catch {}
    router.push('/dashboard/campaigns');
  }

  function handleStatusCycle() {
    if (!campaign) return;
    const cycle: Record<string, string> = { draft: 'scheduled', scheduled: 'running', running: 'completed', completed: 'draft' };
    const next = cycle[campaign.status] ?? 'draft';
    const updated = { ...campaign, status: next };
    setCampaign(updated);
    try {
      const stored: Campaign[] = JSON.parse(localStorage.getItem('pf_demo_campaigns') ?? '[]');
      localStorage.setItem('pf_demo_campaigns', JSON.stringify(stored.map(c => c.id === id ? updated : c)));
    } catch {}
  }

  if (loading) return (
    <div style={{ padding: 48, textAlign: 'center', ...MONO, fontSize: 12, color: '#00ff41', opacity: 0.4 }}>
      Loading campaign...
    </div>
  );

  if (notFound || !campaign) return (
    <div style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ ...MONO, fontSize: 13, color: '#00ff41', opacity: 0.5 }}>Campaign not found</div>
      <button
        onClick={() => router.push('/dashboard/campaigns')}
        style={{ ...MONO, fontSize: 11, color: '#00ff41', background: 'none', border: '1px solid rgba(0,255,65,0.25)', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}
      >
        ← Back to campaigns
      </button>
    </div>
  );

  const s = STATUS_STYLE[campaign.status] ?? STATUS_STYLE.draft;
  const stats = campaign.stats ?? {};
  const targets = stats.total_targets ?? 0;
  const opened  = stats.opened   ?? 0;
  const clicked = stats.clicked  ?? 0;
  const reported = stats.reported ?? 0;
  const openRate   = targets > 0 ? `${Math.round((opened  / targets) * 100)}%` : '—';
  const clickRate  = targets > 0 ? `${Math.round((clicked / targets) * 100)}%` : '—';
  const reportRate = targets > 0 ? `${Math.round((reported / targets) * 100)}%` : '—';

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, padding: '0 20px', position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(5,5,5,0.94)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,255,65,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => router.push('/dashboard/campaigns')}
            style={{ background: 'none', border: 'none', color: '#00ff41', opacity: 0.5, cursor: 'pointer', padding: 4, display: 'flex', minHeight: 'unset', minWidth: 'unset' }}
          >
            <ArrowLeft size={15} />
          </button>
          <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.25 }}>~/campaigns$ </span>
          <span style={{ ...MONO, fontSize: 13, fontWeight: 700, color: '#00ff41', textTransform: 'uppercase' }}>
            {campaign.name}
          </span>
          <span style={{
            ...MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 3, padding: '2px 7px',
          }}>
            {campaign.status}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleStatusCycle}
            title="Advance status"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              ...MONO, fontSize: 10, color: '#00ff41', fontWeight: 600,
              background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.25)',
              borderRadius: 4, padding: '6px 12px', cursor: 'pointer', minHeight: 'unset',
            }}
          >
            <Play size={11} /> Run
          </button>
          <button
            onClick={() => router.push('/dashboard/campaigns/new')}
            title="New campaign"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.6,
              background: 'none', border: '1px solid rgba(0,255,65,0.15)',
              borderRadius: 4, padding: '6px 12px', cursor: 'pointer', minHeight: 'unset',
            }}
          >
            <RefreshCw size={11} /> New
          </button>
          <button
            onClick={handleDelete}
            title="Delete campaign"
            style={{
              display: 'flex', alignItems: 'center',
              background: 'none', border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 4, padding: '6px 8px', cursor: 'pointer',
              color: '#f87171', opacity: 0.6, minHeight: 'unset', minWidth: 'unset',
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          <Stat icon={Target}          label="Targets"    value={targets.toLocaleString()} />
          <Stat icon={Eye}             label="Open rate"  value={openRate}  color="#60a5fa" />
          <Stat icon={MousePointerClick} label="Click rate" value={clickRate}  color={clicked > 0 ? '#f87171' : '#00ff41'} />
          <Stat icon={Flag}            label="Report rate" value={reportRate} color="#818cf8" />
        </div>

        {/* Config */}
        <div style={{
          background: 'rgba(0,255,65,0.025)', border: '1px solid rgba(0,255,65,0.12)',
          borderRadius: 6, padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <Zap size={11} style={{ color: '#00ff41', opacity: 0.6 }} />
            <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.45, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Configuration
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px 24px' }}>
            <Field label="Industry"        value={campaign.industry ?? '—'} />
            <Field label="Target Role"     value={campaign.target_role ?? '—'} />
            <Field label="Simulation Type" value={campaign.simulation_type ?? '—'} />
            <Field label="Difficulty"      value={campaign.difficulty ? DIFF_LABEL[campaign.difficulty] ?? `${campaign.difficulty}/5` : '—'} />
            <Field label="Campaign ID"     value={campaign.id} />
            <Field label="Created"         value={new Date(campaign.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} />
          </div>
        </div>

        {/* Generate / AI actions */}
        <div style={{
          background: 'rgba(0,255,65,0.015)', border: '1px dashed rgba(0,255,65,0.18)',
          borderRadius: 6, padding: '20px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ ...MONO, fontSize: 12, color: '#c8ffd4', marginBottom: 4 }}>Generate simulation content</div>
            <div style={{ fontSize: 11, color: '#00ff41', opacity: 0.4 }}>
              Use the AI generator to create phishing email content for this campaign
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/campaigns/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              ...MONO, fontSize: 11, fontWeight: 700,
              color: '#000', background: '#00ff41',
              border: 'none', borderRadius: 4, padding: '9px 18px', cursor: 'pointer',
              boxShadow: '0 0 14px rgba(0,255,65,0.4)', minHeight: 'unset',
            }}
          >
            <Mail size={12} /> Generate Email
          </button>
        </div>

        {/* Tracking info */}
        <div style={{
          background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.08)',
          borderRadius: 6, padding: '14px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <BarChart2 size={11} style={{ color: '#00ff41', opacity: 0.5 }} />
            <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Tracking Pixels &amp; Links
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Open Tracking', `https://t.phishforge.ai/o/${campaign.id}`],
              ['Click Tracking', `https://t.phishforge.ai/c/${campaign.id}`],
              ['Report Link',   `https://t.phishforge.ai/r/${campaign.id}`],
            ].map(([label, url]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, width: 100, flexShrink: 0 }}>{label}</span>
                <code style={{
                  ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.55,
                  background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.1)',
                  borderRadius: 3, padding: '2px 8px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {url}
                </code>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
