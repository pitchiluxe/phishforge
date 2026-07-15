'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import {
  Newspaper, RefreshCw, X, BrainCircuit, AlertTriangle, Shield,
  Clock, Tag, Loader2, ChevronRight, Zap, Sparkles,
} from 'lucide-react';

// Small badge marking AI-generated content so it's clear the AI produced it.
function AIBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontFamily: 'var(--font-fira-code), monospace', fontSize: 8, fontWeight: 700,
      letterSpacing: '0.08em', color: '#a78bfa',
      background: 'rgba(167,139,250,0.14)', border: '1px solid rgba(167,139,250,0.35)',
      borderRadius: 3, padding: '1px 5px',
    }}>
      <Sparkles size={7} /> AI
    </span>
  );
}
import { useDashboard } from '@/components/layout/dashboard-context';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

const SEVERITY_CFG: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)' },
  high:     { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.35)' },
  medium:   { color: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.35)' },
  low:      { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)' },
};

const CAT_COLORS: Record<string, string> = {
  'Ransomware':         '#f87171',
  'Zero-Day':           '#fb923c',
  'APT':                '#a78bfa',
  'Phishing':           '#60a5fa',
  'Data Breach':        '#f472b6',
  'Cloud Security':     '#34d399',
  'Vulnerability':      '#facc15',
  'Nation-State':       '#c084fc',
  'Malware':            '#f87171',
  'AI Security':        '#38bdf8',
  'Supply Chain':       '#fb923c',
  'Incident Response':  '#00ff41',
};

const CATS = ['All', 'Ransomware', 'Zero-Day', 'APT', 'Phishing', 'Data Breach', 'Cloud Security', 'Vulnerability', 'Nation-State', 'Malware', 'AI Security'];

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  severity: string;
  date: string;
  content: string;
  tags: string[];
  source: string;
  tldr: string;
}

function SeverityBadge({ s }: { s: string }) {
  const cfg = SEVERITY_CFG[s] ?? SEVERITY_CFG.medium;
  return (
    <span style={{ ...MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 3, padding: '2px 7px' }}>
      {s}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

export default function CyberNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<NewsItem | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [model, setModel] = useState('');
  const [fromAI, setFromAI] = useState(false);
  const { toggleBrain } = useDashboard();

  const generate = useCallback(async (cat?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/cybernews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 9, category: cat && cat !== 'All' ? cat : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNews(data.news ?? []);
      setModel(data.model ?? '');
      // Genuinely AI-generated (not the curated fallback served on provider failure).
      setFromAI(!data.fallback && !!data.model && data.model !== 'curated-fallback');
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { generate(); }, [generate]);

  function handleFilterChange(cat: string) {
    setActiveFilter(cat);
    generate(cat !== 'All' ? cat : undefined);
  }

  function addToBrain(item: NewsItem) {
    // Store in localStorage for CyberBrain to pick up
    try {
      const existing = JSON.parse(localStorage.getItem('pf_brain_news') ?? '[]') as NewsItem[];
      const deduped = existing.filter(e => e.id !== item.id);
      localStorage.setItem('pf_brain_news', JSON.stringify([item, ...deduped].slice(0, 50)));
    } catch {}
    setAddedIds(prev => new Set(prev).add(item.id));
  }

  const filtered = activeFilter === 'All' ? news : news.filter(n => n.category === activeFilter);
  const catColor = (cat: string) => CAT_COLORS[cat] ?? '#00ff41';

  return (
    <div className="animate-in" style={{ minHeight: '100vh' }}>
      <Header
        title="CyberNews"
        subtitle="AI-generated cybersecurity intelligence — refreshed on demand"
      />

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Newspaper size={16} style={{ color: '#00ff41', opacity: 0.6 }} />
            <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.55 }}>
              {news.length} stories{model ? ` · ${model.split('/').pop()}` : ''}
            </span>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, ...MONO, fontSize: 10, color: '#facc15' }}>
                <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                Generating…
              </div>
            )}
          </div>

          <button
            onClick={() => generate(activeFilter !== 'All' ? activeFilter : undefined)}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 16px', borderRadius: 6,
              background: loading ? 'rgba(0,255,65,0.05)' : 'rgba(0,255,65,0.1)',
              border: '1px solid rgba(0,255,65,0.25)',
              color: '#00ff41', ...MONO, fontSize: 11, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(0,255,65,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = loading ? 'rgba(0,255,65,0.05)' : 'rgba(0,255,65,0.1)'; }}
          >
            <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh Feed
          </button>
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATS.map(cat => {
            const active = cat === activeFilter;
            const cc = catColor(cat);
            return (
              <button
                key={cat}
                onClick={() => handleFilterChange(cat)}
                style={{
                  ...MONO, fontSize: 10, fontWeight: active ? 700 : 400, letterSpacing: '0.06em',
                  padding: '4px 12px', borderRadius: 20,
                  background: active ? (cat === 'All' ? 'rgba(0,255,65,0.15)' : `${cc}20`) : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? (cat === 'All' ? 'rgba(0,255,65,0.4)' : `${cc}60`) : 'rgba(255,255,255,0.08)'}`,
                  color: active ? (cat === 'All' ? '#00ff41' : cc) : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer', transition: 'all 150ms',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Empty / loading state */}
        {loading && news.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={24} style={{ color: '#00ff41', animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ ...MONO, fontSize: 12, color: '#00ff41', opacity: 0.5 }}>
              AI is generating your news feed…
            </div>
          </div>
        )}

        {/* News grid — square cards */}
        {!loading || news.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {(loading ? news : filtered).map((item, i) => {
              const cc = catColor(item.category);
              const sev = SEVERITY_CFG[item.severity] ?? SEVERITY_CFG.medium;
              return (
                <button
                  key={`${item.id ?? 'news'}-${i}`}
                  onClick={() => setActiveCard(item)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 0,
                    padding: 0, overflow: 'hidden',
                    background: 'rgba(0,255,65,0.02)',
                    border: `1px solid rgba(0,255,65,0.12)`,
                    borderTop: `2px solid ${cc}`,
                    borderRadius: 10, cursor: 'pointer',
                    textAlign: 'left', transition: 'all 180ms',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,255,65,0.05)';
                    e.currentTarget.style.borderColor = `${cc}50`;
                    e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${cc}30`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0,255,65,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(0,255,65,0.12)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Card body */}
                  <div style={{ padding: '12px 14px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {/* Category + AI + severity row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <span style={{ ...MONO, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: cc, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.category}
                        </span>
                        {fromAI && <AIBadge />}
                      </div>
                      <SeverityBadge s={item.severity} />
                    </div>

                    {/* Title */}
                    <div style={{ ...MONO, fontSize: 12.5, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {item.title}
                    </div>

                    {/* TL;DR */}
                    <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.55, lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {item.tldr}
                    </div>
                  </div>

                  {/* Card footer */}
                  <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(0,255,65,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={9} style={{ color: '#475569' }} />
                      <span style={{ ...MONO, fontSize: 9, color: '#475569' }}>{formatDate(item.date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ ...MONO, fontSize: 9, color: '#475569' }}>{item.source}</span>
                      <ChevronRight size={10} style={{ color: cc, opacity: 0.7 }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Modal backdrop + card */}
      {activeCard && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setActiveCard(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              animation: 'fadeIn 150ms ease',
            }}
          />

          {/* Modal */}
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 51,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '100%', maxWidth: 680, maxHeight: '88vh',
                background: '#080808',
                border: `1px solid ${catColor(activeCard.category)}40`,
                borderTop: `3px solid ${catColor(activeCard.category)}`,
                borderRadius: 12,
                boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,255,65,0.06)`,
                display: 'flex', flexDirection: 'column',
                pointerEvents: 'all',
                animation: 'slideUp 200ms ease',
                overflow: 'hidden',
              }}
            >
              {/* Modal header */}
              <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid rgba(0,255,65,0.08)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ ...MONO, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: catColor(activeCard.category) }}>
                        {activeCard.category}
                      </span>
                      {fromAI && <AIBadge />}
                      <SeverityBadge s={activeCard.severity} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={9} style={{ color: '#475569' }} />
                        <span style={{ ...MONO, fontSize: 9, color: '#475569' }}>{formatDate(activeCard.date)}</span>
                      </div>
                      <span style={{ ...MONO, fontSize: 9, color: '#475569' }}>· {activeCard.source}</span>
                    </div>
                    <h2 style={{ ...MONO, fontSize: 16, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.4 }}>
                      {activeCard.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveCard(null)}
                    style={{ padding: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#94a3b8', cursor: 'pointer', flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* TL;DR */}
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Zap size={10} style={{ color: '#facc15' }} />
                    <span style={{ ...MONO, fontSize: 9, fontWeight: 700, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TL;DR</span>
                  </div>
                  <p style={{ ...MONO, fontSize: 11, color: '#c8ffd4', lineHeight: 1.6 }}>{activeCard.tldr}</p>
                </div>
              </div>

              {/* Article content — scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
                {/* Summary */}
                {activeCard.summary && (
                  <p style={{ fontFamily: 'var(--font-fira-sans, sans-serif)', fontSize: 13, color: '#94a3b8', lineHeight: 1.75, marginBottom: 16, fontWeight: 500 }}>
                    {activeCard.summary}
                  </p>
                )}

                {/* Full content */}
                {(activeCard.content ?? activeCard.summary ?? '').split('\n\n').map((para, i) => (
                  <p key={i} style={{ fontFamily: 'var(--font-fira-sans, sans-serif)', fontSize: 13, color: '#64748b', lineHeight: 1.8, marginBottom: 14 }}>
                    {para}
                  </p>
                ))}

                {/* Tags */}
                {activeCard.tags?.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
                    <Tag size={10} style={{ color: '#475569' }} />
                    {activeCard.tags.map(tag => (
                      <span key={tag} style={{ ...MONO, fontSize: 9, color: '#475569', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, padding: '2px 7px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal footer — action buttons */}
              <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(0,255,65,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexShrink: 0, background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertTriangle size={11} style={{ color: '#475569' }} />
                  <span style={{ ...MONO, fontSize: 9, color: '#475569' }}>AI-generated content for awareness purposes</span>
                </div>
                <button
                  onClick={() => { addToBrain(activeCard); toggleBrain(); }}
                  disabled={addedIds.has(activeCard.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 16px', borderRadius: 6,
                    background: addedIds.has(activeCard.id) ? 'rgba(0,255,65,0.08)' : '#00ff41',
                    color: addedIds.has(activeCard.id) ? '#00ff41' : '#000',
                    border: `1px solid ${addedIds.has(activeCard.id) ? 'rgba(0,255,65,0.25)' : '#00ff41'}`,
                    ...MONO, fontSize: 11, fontWeight: 700,
                    cursor: addedIds.has(activeCard.id) ? 'default' : 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  <BrainCircuit size={13} />
                  {addedIds.has(activeCard.id) ? 'Added to CyberBrain' : 'Add to CyberBrain'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
