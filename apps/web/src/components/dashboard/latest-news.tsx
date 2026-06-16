'use client';

import { useEffect, useState, useCallback } from 'react';
import { Newspaper, RefreshCw, ExternalLink, Loader2, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

const SEV_COLOR: Record<string, string> = {
  critical: '#f87171', high: '#fb923c', medium: '#facc15', low: '#4ade80',
};

const CAT_COLOR: Record<string, string> = {
  'Ransomware': '#f87171', 'Zero-Day': '#fb923c', 'APT': '#a78bfa',
  'Phishing': '#60a5fa', 'Data Breach': '#f472b6', 'Cloud Security': '#34d399',
  'Vulnerability': '#facc15', 'Nation-State': '#c084fc', 'Malware': '#f87171',
  'AI Security': '#38bdf8', 'Supply Chain': '#fb923c', 'Incident Response': '#00ff41',
};

interface NewsItem {
  id: string;
  title: string;
  tldr: string;
  category: string;
  severity: string;
  date: string;
  source: string;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

export function LatestNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch3 = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cybernews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 3 }),
      });
      const data = await res.json();
      if (res.ok && data.news) setNews(data.news.slice(0, 3));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch3(); }, [fetch3]);

  return (
    <div style={{
      background: 'rgba(0,255,65,0.02)',
      border: '1px solid rgba(0,255,65,0.15)',
      borderRadius: 8, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(0,255,65,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Newspaper size={13} style={{ color: '#00ff41', opacity: 0.7 }} />
          <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#00ff41', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Latest Cyber News
          </span>
          <span style={{ ...MONO, fontSize: 9, color: '#00ff41', background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 3, padding: '1px 5px', fontWeight: 600 }}>
            AI
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={fetch3}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 4, background: 'transparent', border: '1px solid rgba(0,255,65,0.15)', color: '#00ff41', opacity: loading ? 0.4 : 0.7, cursor: loading ? 'not-allowed' : 'pointer', ...MONO, fontSize: 9 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.4' : '0.7'; }}
          >
            <RefreshCw size={9} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <Link href="/dashboard/cybernews" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 4, background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', color: '#00ff41', textDecoration: 'none', ...MONO, fontSize: 9, fontWeight: 600 }}>
            <ExternalLink size={9} />
            View All
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading && news.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '28px 18px' }}>
          <Loader2 size={14} style={{ color: '#00ff41', animation: 'spin 1s linear infinite' }} />
          <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.5 }}>Generating latest news…</span>
        </div>
      ) : (
        <div>
          {news.map((item, i) => {
            const cc = CAT_COLOR[item.category] ?? '#00ff41';
            const sc = SEV_COLOR[item.severity] ?? '#facc15';
            return (
              <Link
                key={item.id}
                href="/dashboard/cybernews"
                style={{
                  display: 'flex', gap: 14, padding: '14px 18px',
                  borderBottom: i < news.length - 1 ? '1px solid rgba(0,255,65,0.06)' : 'none',
                  textDecoration: 'none', transition: 'background 150ms',
                  background: 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,65,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Severity indicator bar */}
                <div style={{ width: 3, borderRadius: 2, background: sc, flexShrink: 0, alignSelf: 'stretch', minHeight: 44 }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{ ...MONO, fontSize: 9, fontWeight: 700, color: cc, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {item.category}
                    </span>
                    <span style={{ ...MONO, fontSize: 8, color: sc, background: `${sc}15`, border: `1px solid ${sc}30`, borderRadius: 2, padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                      {item.severity}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
                      <Clock size={8} style={{ color: '#475569' }} />
                      <span style={{ ...MONO, fontSize: 8, color: '#475569' }}>{formatDate(item.date)}</span>
                    </div>
                  </div>
                  <div style={{ ...MONO, fontSize: 12, fontWeight: 600, color: '#c8ffd4', marginBottom: 4, lineHeight: 1.4 }}>
                    {item.title}
                  </div>
                  <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5, lineHeight: 1.6, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {item.tldr}
                  </div>
                </div>

                {/* Severity dot */}
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc, boxShadow: `0 0 6px ${sc}`, flexShrink: 0, alignSelf: 'center' }} />
              </Link>
            );
          })}
          {news.length === 0 && !loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '20px 18px' }}>
              <AlertTriangle size={13} style={{ color: '#475569' }} />
              <span style={{ ...MONO, fontSize: 11, color: '#475569' }}>No news loaded — click Refresh</span>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
