const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

function Shimmer({ width = '100%', height = 14, radius = 3, opacity = 1 }: {
  width?: string | number;
  height?: number;
  radius?: number;
  opacity?: number;
}) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'rgba(0,255,65,0.06)',
      position: 'relative', overflow: 'hidden', opacity,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.08) 50%, transparent 100%)',
        animation: 'shimmer 1.4s ease-in-out infinite',
      }} />
    </div>
  );
}

function SkeletonCard({ rows = 3, height = 80 }: { rows?: number; height?: number }) {
  return (
    <div style={{
      background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.1)',
      borderRadius: 6, padding: '16px 18px', height,
      display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center',
    }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} width={i === 0 ? '60%' : i === 1 ? '85%' : '40%'} height={10} opacity={1 - i * 0.2} />
      ))}
    </div>
  );
}

export function PageSkeleton({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div>
      {/* Fake header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, padding: '0 20px',
        background: 'rgba(5,5,5,0.94)', borderBottom: '1px solid rgba(0,255,65,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 14, height: 14, borderRadius: 2, background: 'rgba(0,255,65,0.1)' }} />
          <div>
            <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.25 }}>~/phishforge$ </span>
            <span style={{ ...MONO, fontSize: 13, fontWeight: 700, color: '#00ff41', opacity: 0.5, textTransform: 'uppercase' }}>
              {title ?? '...'}
            </span>
            {subtitle && (
              <div style={{ fontSize: 11, color: '#00ff41', opacity: 0.2, marginTop: 1 }}>{subtitle}</div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shimmer width={60} height={10} />
          <div style={{ width: 52, height: 22, borderRadius: 3, background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.12)' }} />
          <div style={{ width: 26, height: 26, borderRadius: 4, background: 'rgba(0,255,65,0.04)' }} />
        </div>
      </div>

      {/* Fake content */}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SkeletonCard rows={2} height={60} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} rows={2} height={90} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 16 }}>
          <SkeletonCard rows={4} height={220} />
          <SkeletonCard rows={4} height={220} />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ title, subtitle, rows = 5 }: { title?: string; subtitle?: string; rows?: number }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, padding: '0 20px',
        background: 'rgba(5,5,5,0.94)', borderBottom: '1px solid rgba(0,255,65,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 14, height: 14, borderRadius: 2, background: 'rgba(0,255,65,0.1)' }} />
          <span style={{ ...MONO, fontSize: 13, fontWeight: 700, color: '#00ff41', opacity: 0.5, textTransform: 'uppercase' }}>
            {title ?? '...'}
          </span>
        </div>
        <Shimmer width={100} height={28} radius={3} />
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ height: 38, borderBottom: '1px solid rgba(0,255,65,0.08)', padding: '0 14px', display: 'flex', alignItems: 'center', gap: 48, background: 'rgba(0,255,65,0.02)' }}>
            {[120, 80, 60, 60, 60, 80].map((w, i) => <Shimmer key={i} width={w} height={8} />)}
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ height: 52, borderBottom: i < rows - 1 ? '1px solid rgba(0,255,65,0.06)' : 'none', padding: '0 14px', display: 'flex', alignItems: 'center', gap: 48 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Shimmer width="70%" height={9} />
                <Shimmer width="40%" height={7} opacity={0.5} />
              </div>
              {[60, 50, 40, 40].map((w, j) => <Shimmer key={j} width={w} height={8} opacity={0.6} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ title, subtitle, cols = 3, cards = 6 }: { title?: string; subtitle?: string; cols?: number; cards?: number }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', height: 52, padding: '0 20px',
        background: 'rgba(5,5,5,0.94)', borderBottom: '1px solid rgba(0,255,65,0.1)',
      }}>
        <span style={{ ...MONO, fontSize: 13, fontWeight: 700, color: '#00ff41', opacity: 0.5, textTransform: 'uppercase' }}>
          {title ?? '...'}
        </span>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Shimmer width={300} height={36} radius={4} />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
          {Array.from({ length: cards }).map((_, i) => <SkeletonCard key={i} rows={3} height={120} />)}
        </div>
      </div>
    </div>
  );
}
