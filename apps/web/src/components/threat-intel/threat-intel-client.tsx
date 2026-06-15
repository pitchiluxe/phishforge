'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Cpu, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export interface ThreatItem {
  id: string;
  title: string;
  severity: string;
  category: string;
  description?: string;
  industries?: string[];
  published_at?: string;
  mitre?: string;
  source_url?: string;
  isAI?: boolean;
}

const SEV: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  critical: { color: '#ff4444', bg: 'rgba(255,68,68,0.1)',   border: 'rgba(255,68,68,0.35)', glow: 'rgba(255,68,68,0.15)' },
  high:     { color: '#ff8c00', bg: 'rgba(255,140,0,0.1)',   border: 'rgba(255,140,0,0.35)', glow: 'rgba(255,140,0,0.12)' },
  medium:   { color: '#facc15', bg: 'rgba(250,204,21,0.1)',  border: 'rgba(250,204,21,0.35)', glow: 'rgba(250,204,21,0.10)' },
  low:      { color: '#00ff41', bg: 'rgba(0,255,65,0.08)',   border: 'rgba(0,255,65,0.3)',  glow: 'rgba(0,255,65,0.08)' },
  info:     { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.3)', glow: 'rgba(96,165,250,0.08)' },
};

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

function SkeletonCard() {
  return (
    <div style={{
      aspectRatio: '1',
      background: 'rgba(0,255,65,0.02)',
      border: '1px solid rgba(0,255,65,0.08)',
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ width: 60, height: 18, background: 'rgba(0,255,65,0.07)', borderRadius: 3 }} />
        <div style={{ width: 80, height: 18, background: 'rgba(139,92,246,0.08)', borderRadius: 3 }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ width: '90%', height: 14, background: 'rgba(0,255,65,0.06)', borderRadius: 3 }} />
        <div style={{ width: '75%', height: 14, background: 'rgba(0,255,65,0.05)', borderRadius: 3 }} />
        <div style={{ width: '85%', height: 11, background: 'rgba(0,255,65,0.04)', borderRadius: 3, marginTop: 6 }} />
        <div style={{ width: '80%', height: 11, background: 'rgba(0,255,65,0.04)', borderRadius: 3 }} />
        <div style={{ width: '70%', height: 11, background: 'rgba(0,255,65,0.03)', borderRadius: 3 }} />
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <div style={{ width: 55, height: 16, background: 'rgba(0,255,65,0.05)', borderRadius: 3 }} />
        <div style={{ width: 80, height: 16, background: 'rgba(96,165,250,0.05)', borderRadius: 3 }} />
      </div>
    </div>
  );
}

function ThreatCard({ threat }: { threat: ThreatItem }) {
  const [hovered, setHovered] = useState(false);
  const s = SEV[threat.severity] ?? SEV.info;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: '1',
        background: hovered ? `rgba(0,255,65,0.04)` : 'rgba(0,255,65,0.018)',
        border: `1px solid ${hovered ? s.border : 'rgba(0,255,65,0.12)'}`,
        borderTop: `2px solid ${s.color}`,
        borderRadius: 8,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        boxShadow: hovered ? `0 0 24px ${s.glow}, 0 0 1px rgba(0,255,65,0.1)` : '0 0 12px rgba(0,255,65,0.02)',
        cursor: 'default',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top row: severity + AI badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
        <span style={{
          ...MONO, fontSize: 9, fontWeight: 700,
          color: s.color, background: s.bg, border: `1px solid ${s.border}`,
          borderRadius: 3, padding: '2px 7px',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          {threat.severity}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {threat.isAI && (
            <span style={{
              ...MONO, fontSize: 8, fontWeight: 700,
              color: '#a78bfa', background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: 3, padding: '1px 5px',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <Sparkles size={8} />AI
            </span>
          )}
          {threat.source_url && (
            <a href={threat.source_url} target="_blank" rel="noopener noreferrer"
              style={{ color: '#00ff41', opacity: 0.35, display: 'flex' }}>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 style={{
        ...MONO, fontSize: 11, fontWeight: 700, color: '#c8ffd4',
        lineHeight: 1.55, marginBottom: 8, flexShrink: 0,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {threat.title}
      </h3>

      {/* Description */}
      {threat.description && (
        <p style={{
          fontSize: 10, color: '#00ff41', opacity: 0.5,
          lineHeight: 1.65, marginBottom: 10, flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {threat.description}
        </p>
      )}

      {/* Bottom metadata */}
      <div style={{ marginTop: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          <span style={{
            ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.45,
            border: '1px solid rgba(0,255,65,0.18)', borderRadius: 3, padding: '1px 5px',
          }}>
            {threat.category}
          </span>
          {threat.mitre && (
            <span style={{
              ...MONO, fontSize: 8, color: '#60a5fa',
              background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)',
              borderRadius: 3, padding: '1px 5px',
            }}>
              {threat.mitre.split(',')[0].trim()}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(threat.industries ?? []).slice(0, 2).map((ind) => (
              <span key={ind} style={{ ...MONO, fontSize: 8, color: '#00ff41', opacity: 0.28 }}>
                #{ind}
              </span>
            ))}
          </div>
          {threat.published_at && (
            <span style={{ ...MONO, fontSize: 8, color: '#00ff41', opacity: 0.25 }}>
              {formatDate(threat.published_at)}
            </span>
          )}
        </div>

        {/* Analyze button on hover */}
        <Link
          href="/dashboard/cyberlm"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            ...MONO, fontSize: 9, fontWeight: 700,
            color: '#00ff41', background: hovered ? 'rgba(0,255,65,0.1)' : 'transparent',
            border: `1px solid ${hovered ? 'rgba(0,255,65,0.35)' : 'rgba(0,255,65,0.1)'}`,
            borderRadius: 4, padding: '5px 8px',
            textDecoration: 'none', transition: 'all 0.2s ease',
            opacity: hovered ? 1 : 0.4,
          }}
        >
          <Cpu size={9} />
          Analyze in CyberLM
        </Link>
      </div>
    </div>
  );
}

const FILTER_OPTIONS = ['All', 'critical', 'high', 'medium', 'low', 'AI Generated'] as const;

export function ThreatIntelClient({ initialThreats }: { initialThreats: ThreatItem[] }) {
  const [aiThreats, setAiThreats] = useState<ThreatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<typeof FILTER_OPTIONS[number]>('All');

  const loadAI = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/threat-intel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 35 }),
      });
      const data = await res.json();
      if (data.threats) setAiThreats(data.threats);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAI(); }, [loadAI]);

  // Interleave AI and static threats for visual variety
  const allThreats: ThreatItem[] = [];
  const maxLen = Math.max(aiThreats.length, initialThreats.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < aiThreats.length) allThreats.push(aiThreats[i]);
    if (i < initialThreats.length) allThreats.push(initialThreats[i]);
  }

  const filtered = filter === 'All'
    ? allThreats
    : filter === 'AI Generated'
    ? allThreats.filter(t => t.isAI)
    : allThreats.filter(t => t.severity === filter);

  const counts = {
    total: allThreats.length,
    ai: aiThreats.length,
    critical: allThreats.filter(t => t.severity === 'critical').length,
    high: allThreats.filter(t => t.severity === 'high').length,
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Stats bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        padding: '10px 16px',
        background: 'rgba(0,255,65,0.02)',
        border: '1px solid rgba(0,255,65,0.1)',
        borderRadius: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5 }}>
            {loading ? '// Generating AI threat feed...' : `// ${counts.total} threats loaded`}
          </span>
          {!loading && (
            <>
              <span style={{ ...MONO, fontSize: 9, color: '#ff4444', opacity: 0.7 }}>{counts.critical} critical</span>
              <span style={{ ...MONO, fontSize: 9, color: '#ff8c00', opacity: 0.7 }}>{counts.high} high</span>
              <span style={{ ...MONO, fontSize: 9, color: '#a78bfa', opacity: 0.7 }}>
                <Sparkles size={9} style={{ display: 'inline', marginRight: 3 }} />{counts.ai} AI-generated
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => loadAI(true)}
          disabled={refreshing || loading}
          style={{
            ...MONO, fontSize: 9, color: '#00ff41',
            background: 'rgba(0,255,65,0.07)', border: '1px solid rgba(0,255,65,0.2)',
            borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            opacity: refreshing || loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={9} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh feed
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FILTER_OPTIONS.map(f => {
          const sev = SEV[f] ?? null;
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...MONO, fontSize: 9, fontWeight: 600,
                color: active ? (sev ? sev.color : f === 'AI Generated' ? '#a78bfa' : '#030303') : '#00ff41',
                background: active ? (sev ? sev.bg : f === 'AI Generated' ? 'rgba(139,92,246,0.15)' : 'rgba(0,255,65,0.15)') : 'transparent',
                border: `1px solid ${active ? (sev ? sev.border : f === 'AI Generated' ? 'rgba(139,92,246,0.4)' : 'rgba(0,255,65,0.4)') : 'rgba(0,255,65,0.15)'}`,
                borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
                textTransform: f !== 'All' && f !== 'AI Generated' ? 'uppercase' : 'none',
                letterSpacing: f !== 'All' && f !== 'AI Generated' ? '0.08em' : 'normal',
                transition: 'all 0.15s ease',
              }}
            >
              {f === 'AI Generated' ? <><Sparkles size={8} style={{ display: 'inline', marginRight: 3 }} />{f}</> : f}
            </button>
          );
        })}
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 14,
      }}>
        {loading
          ? Array.from({ length: 35 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map(threat => <ThreatCard key={threat.id} threat={threat} />)
        }
      </div>

      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: 48,
          ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.3,
        }}>
          // No threats match the current filter
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
