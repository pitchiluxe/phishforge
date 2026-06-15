import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Threat {
  id: string;
  title: string;
  severity: string;
  category: string;
  published_at?: string;
}

const SEV_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: '#ff4444', bg: 'rgba(255,68,68,0.08)',   border: 'rgba(255,68,68,0.3)' },
  high:     { color: '#ff8c00', bg: 'rgba(255,140,0,0.08)',   border: 'rgba(255,140,0,0.3)' },
  medium:   { color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.3)' },
  low:      { color: '#00ff41', bg: 'rgba(0,255,65,0.07)',    border: 'rgba(0,255,65,0.25)' },
  info:     { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)' },
};

const CARD = {
  background: 'rgba(0,255,65,0.03)',
  border: '1px solid rgba(0,255,65,0.18)',
  borderRadius: 6,
  boxShadow: '0 0 20px rgba(0,255,65,0.04)',
  overflow: 'hidden' as const,
};

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

const EMPTY_THREATS: Threat[] = [
  { id: 'eg1', title: 'Business Email Compromise targeting Finance teams', severity: 'critical', category: 'phishing' },
  { id: 'eg2', title: 'QR code phishing surge in Q2 2026', severity: 'high', category: 'smishing' },
  { id: 'eg3', title: 'Credential harvesting via fake SSO portals', severity: 'medium', category: 'credential-theft' },
  { id: 'eg4', title: 'AI-generated spear phishing on the rise', severity: 'high', category: 'ai-threat' },
];

export function ThreatFeed({ threats }: { threats: Threat[] }) {
  const items = threats.length > 0 ? threats : EMPTY_THREATS;

  return (
    <div style={CARD}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid rgba(0,255,65,0.1)',
      }}>
        <span style={{ ...MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#00ff41', textTransform: 'uppercase' }}>
          // Threat Intel
        </span>
        <Link href="/dashboard/threat-intel" style={{
          ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.55,
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          view_all <ArrowRight size={10} />
        </Link>
      </div>

      <div>
        {items.map((threat, i) => {
          const s = SEV_STYLE[threat.severity] ?? SEV_STYLE.info;
          return (
            <div key={threat.id} style={{
              padding: '12px 18px',
              borderBottom: i < items.length - 1 ? '1px solid rgba(0,255,65,0.07)' : 'none',
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={12} style={{ color: s.color, flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ ...MONO, fontSize: 11, color: '#c8ffd4', lineHeight: 1.5, marginBottom: 6 }}>
                    {threat.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      ...MONO, fontSize: 9, fontWeight: 600,
                      color: s.color, background: s.bg,
                      border: `1px solid ${s.border}`,
                      borderRadius: 3, padding: '1px 6px',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      {threat.severity}
                    </span>
                    <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.35 }}>
                      {threat.category}
                    </span>
                    {threat.published_at && (
                      <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.25, marginLeft: 'auto' }}>
                        {formatDate(threat.published_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {threats.length === 0 && (
        <div style={{
          padding: '8px 18px 12px',
          borderTop: '1px solid rgba(0,255,65,0.07)',
        }}>
          <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.3 }}>
            // showing sample threat intel — connect your feed in settings
          </span>
        </div>
      )}
    </div>
  );
}
