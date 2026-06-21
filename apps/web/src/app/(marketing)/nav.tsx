'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { OnlineCounter } from '@/components/online-counter';

const NAV_LINKS = [
  { href: '/docs', label: 'Docs' },
  { href: '/contact', label: 'Contact' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,255,65,0.12)',
        boxShadow: '0 1px 0 rgba(0,255,65,0.05)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 60 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Shield size={22} style={{ color: '#00ff41', filter: 'drop-shadow(0 0 6px rgba(0,255,65,0.7))' }} />
            <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 15, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00ff41', textShadow: '0 0 10px rgba(0,255,65,0.5)' }}>
              PhishForge
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{
                fontFamily: 'var(--font-fira-code), monospace', fontSize: 13,
                color: pathname === href ? '#00ff41' : 'rgba(0,255,65,0.55)',
                textDecoration: 'none', padding: '6px 14px', borderRadius: 2,
                background: pathname === href ? 'rgba(0,255,65,0.08)' : 'transparent',
                border: pathname === href ? '1px solid rgba(0,255,65,0.2)' : '1px solid transparent',
                transition: 'all 150ms',
              }}
                onMouseEnter={e => { if (pathname !== href) { e.currentTarget.style.color = '#00ff41'; e.currentTarget.style.background = 'rgba(0,255,65,0.05)'; } }}
                onMouseLeave={e => { if (pathname !== href) { e.currentTarget.style.color = 'rgba(0,255,65,0.55)'; e.currentTarget.style.background = 'transparent'; } }}>
                {label}
              </Link>
            ))}
            <OnlineCounter />
            <div style={{ width: 1, height: 20, background: 'rgba(0,255,65,0.15)', margin: '0 8px' }} />
            <Link href="/login" style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, color: 'rgba(0,255,65,0.6)', textDecoration: 'none', padding: '6px 14px', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#00ff41'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,255,65,0.6)'}>
              Login
            </Link>
            <Link href="/register" style={{
              fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, fontWeight: 700,
              color: '#000', background: '#00ff41', textDecoration: 'none',
              padding: '7px 18px', borderRadius: 2, letterSpacing: '0.05em',
              boxShadow: '0 0 16px rgba(0,255,65,0.3)', transition: 'box-shadow 150ms',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(0,255,65,0.5)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(0,255,65,0.3)'}>
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(o => !o)} aria-label="Menu"
            style={{ display: 'none', background: 'none', border: 'none', color: '#00ff41', cursor: 'pointer', padding: 6 }}
            className="mobile-menu-btn">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99,
          background: '#050505', borderBottom: '1px solid rgba(0,255,65,0.15)',
          padding: '16px 24px',
        }} className="mobile-menu">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{ display: 'block', fontFamily: 'var(--font-fira-code), monospace', fontSize: 14, color: '#00ff41', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid rgba(0,255,65,0.08)' }}>
              {label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Link href="/login" onClick={() => setOpen(false)} style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, color: '#00ff41', textDecoration: 'none', border: '1px solid rgba(0,255,65,0.3)', padding: '8px 16px', borderRadius: 2, flex: 1, textAlign: 'center' }}>Login</Link>
            <Link href="/register" onClick={() => setOpen(false)} style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, fontWeight: 700, color: '#000', background: '#00ff41', textDecoration: 'none', padding: '8px 16px', borderRadius: 2, flex: 1, textAlign: 'center' }}>Get Started</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
