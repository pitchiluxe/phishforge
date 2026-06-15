import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export const metadata: Metadata = { title: 'Authentication' };

/* Deterministic character sets per column — no Math.random() to avoid hydration mismatch */
const COLUMNS = [
  { chars: '01アカサタナ', delay: 0,    dur: 3.2 },
  { chars: 'イキシチニハ', delay: 0.6,  dur: 4.1 },
  { chars: '10ウクスツヌ', delay: 1.2,  dur: 3.7 },
  { chars: 'エケセテネヒ', delay: 0.3,  dur: 2.9 },
  { chars: '01オコソトノ', delay: 1.8,  dur: 4.5 },
  { chars: 'アイウエオカ', delay: 0.9,  dur: 3.4 },
  { chars: '10キクケコサ', delay: 2.1,  dur: 2.8 },
  { chars: 'シスセソタチ', delay: 0.5,  dur: 3.9 },
  { chars: '01ツテトナニ', delay: 1.5,  dur: 4.2 },
  { chars: 'ヌネノハヒフ', delay: 2.7,  dur: 3.1 },
  { chars: '10ヘホマミム', delay: 0.8,  dur: 4.6 },
  { chars: 'メモヤユヨラ', delay: 1.9,  dur: 3.3 },
  { chars: '01リルレロワ', delay: 0.4,  dur: 2.7 },
  { chars: 'ヲンアイウエ', delay: 2.3,  dur: 4.0 },
  { chars: '10オカキクケ', delay: 1.1,  dur: 3.6 },
  { chars: 'コサシスセソ', delay: 0.2,  dur: 4.3 },
  { chars: '01タチツテト', delay: 1.7,  dur: 3.0 },
  { chars: 'ナニヌネノハ', delay: 2.5,  dur: 4.8 },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @keyframes matrixFall {
          0%   { opacity: 0; transform: translateY(-120%); }
          8%   { opacity: 1; }
          88%  { opacity: 0.7; }
          100% { opacity: 0; transform: translateY(110vh); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', background: '#050505' }}>

        {/* ── Left: Matrix panel (desktop only) ── */}
        <div style={{
          width: 460,
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          background: '#030303',
          borderRight: '1px solid rgba(0,255,65,0.12)',
          display: 'none',
        }}
          className="auth-left-panel"
        >
          {/* Bottom glow */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 280,
            background: 'radial-gradient(ellipse at 50% 100%, rgba(0,255,65,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0.22) 4px)',
          }} />

          {/* Matrix rain columns */}
          {COLUMNS.map((col, i) => (
            <div key={i} style={{
              position: 'absolute', top: 0,
              left: `${(i / COLUMNS.length) * 100}%`,
              width: 20,
              fontFamily: 'var(--font-fira-code), monospace',
              fontSize: 12,
              lineHeight: '18px',
              color: '#00ff41',
              opacity: 0,
              animation: `matrixFall ${col.dur}s ${col.delay}s infinite linear`,
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              {col.chars.split('').map((c, j) => (
                <div key={j} style={{ opacity: 1 - j * 0.1 }}>{c}</div>
              ))}
            </div>
          ))}

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 10, padding: '36px 40px 0' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <Shield size={26} style={{ color: '#00ff41', filter: 'drop-shadow(0 0 8px rgba(0,255,65,0.8))' }} />
              <span style={{
                fontFamily: 'var(--font-fira-code), monospace',
                fontSize: 18, fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#00ff41', textShadow: '0 0 12px rgba(0,255,65,0.7)',
              }}>
                PhishForge
              </span>
            </Link>
          </div>

          {/* Quote + stats */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '0 40px 40px' }}>
            {/* Quote */}
            <div style={{
              borderLeft: '2px solid #00ff41',
              paddingLeft: 16, paddingTop: 8, paddingBottom: 8,
              marginBottom: 24,
            }}>
              <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: '#00ff41', opacity: 0.5, letterSpacing: '0.1em', marginBottom: 8 }}>
                // mission_statement.txt
              </p>
              <blockquote style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.7, color: '#c8ffd4', margin: 0 }}>
                "The only way to protect your organization from phishing is to teach employees what it looks like — before attackers do."
              </blockquote>
            </div>

            {/* Stats */}
            <div style={{
              border: '1px solid rgba(0,255,65,0.2)',
              borderRadius: 2,
              padding: '14px 16px',
              background: 'rgba(0,255,65,0.03)',
            }}>
              <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: '#00ff41', opacity: 0.45, marginBottom: 10 }}>
                $ stats --global
              </p>
              {[
                ['simulations_run', '2.4M+'],
                ['click_rate_reduction', '73%'],
                ['enterprise_customers', '500+'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: 'var(--font-fira-code), monospace', fontSize: 12 }}>
                  <span style={{ color: '#00ff41', opacity: 0.5 }}>{k}</span>
                  <span style={{ color: '#00ff41', fontWeight: 700, textShadow: '0 0 6px rgba(0,255,65,0.5)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Form panel ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px 24px',
          position: 'relative',
          background: '#050505',
        }}>
          {/* Grid background */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
            backgroundImage: 'linear-gradient(rgba(0,255,65,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          {/* Mobile logo */}
          <div className="auth-mobile-logo" style={{ marginBottom: 32 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <Shield size={22} style={{ color: '#00ff41', filter: 'drop-shadow(0 0 6px rgba(0,255,65,0.7))' }} />
              <span style={{
                fontFamily: 'var(--font-fira-code), monospace',
                fontSize: 16, fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#00ff41',
              }}>
                PhishForge
              </span>
            </Link>
          </div>

          <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}>
            {children}
          </div>
        </div>
      </div>

      {/* Responsive: show left panel on lg+ */}
      <style>{`
        @media (min-width: 1024px) {
          .auth-left-panel { display: block !important; }
          .auth-mobile-logo { display: none !important; }
        }
      `}</style>
    </>
  );
}
