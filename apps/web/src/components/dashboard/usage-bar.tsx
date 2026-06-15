import Link from 'next/link';

interface UsageBarProps {
  used: number;
  limit: number;
  plan: string;
}

const PLAN_BADGE: Record<string, { color: string; bg: string; border: string }> = {
  free:       { color: '#888', bg: 'rgba(136,136,136,0.1)', border: 'rgba(136,136,136,0.25)' },
  pro:        { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)' },
  enterprise: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
};

export function UsageBar({ used, limit, plan }: UsageBarProps) {
  const pct = Math.min(100, limit > 0 ? Math.round((used / limit) * 100) : 0);
  const isNearLimit = pct > 80;
  const isAtLimit = pct >= 100;

  const badge = PLAN_BADGE[plan] ?? PLAN_BADGE.free;

  const barColor = isAtLimit
    ? '#ff4444'
    : isNearLimit
    ? '#ffaa00'
    : '#00ff41';

  return (
    <div style={{
      background: 'rgba(0,255,65,0.03)',
      border: '1px solid rgba(0,255,65,0.18)',
      borderRadius: 6,
      padding: '14px 18px',
      boxShadow: '0 0 20px rgba(0,255,65,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'var(--font-fira-code), monospace',
            fontSize: 12,
            color: '#00ff41',
            opacity: 0.8,
          }}>
            Monthly simulations
          </span>
          <span style={{
            fontFamily: 'var(--font-fira-code), monospace',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: badge.color,
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            borderRadius: 3,
            padding: '1px 7px',
          }}>
            {plan}
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-fira-code), monospace',
          fontSize: 11,
          color: '#00ff41',
          opacity: 0.55,
        }}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>

      {/* Track */}
      <div style={{
        height: 4,
        borderRadius: 2,
        background: 'rgba(0,255,65,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          borderRadius: 2,
          width: `${pct}%`,
          background: barColor,
          boxShadow: `0 0 8px ${barColor}60`,
          transition: 'width 600ms ease, background 300ms ease',
        }} />
      </div>

      {isNearLimit && (
        <div style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: 'var(--font-fira-code), monospace',
            fontSize: 10,
            color: isAtLimit ? '#ff4444' : '#ffaa00',
          }}>
            {isAtLimit ? 'LIMIT_REACHED — upgrade to continue' : `${100 - pct}% remaining`}
          </span>
          <Link href="/dashboard/settings/billing" style={{
            fontFamily: 'var(--font-fira-code), monospace',
            fontSize: 10,
            color: '#00ff41',
            textDecoration: 'none',
            opacity: 0.75,
          }}>
            upgrade →
          </Link>
        </div>
      )}
    </div>
  );
}
