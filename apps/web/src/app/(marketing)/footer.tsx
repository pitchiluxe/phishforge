'use client';
import Link from 'next/link';
import { Shield } from 'lucide-react';

const FOOTER_SECTIONS = [
  { label: 'Product', links: [['Pricing', '/pricing'], ['Docs', '/docs'], ['Contact', '/contact']] },
  { label: 'Legal', links: [['Terms', '/terms'], ['Privacy', '/privacy'], ['Security', '/security']] },
  { label: 'Account', links: [['Login', '/login'], ['Register', '/register']] },
] as const;

export function MarketingFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(0,255,65,0.1)', padding: '40px 24px', marginTop: 80, background: '#030303' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Shield size={20} style={{ color: '#00ff41', filter: 'drop-shadow(0 0 6px rgba(0,255,65,0.7))' }} />
            <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 15, fontWeight: 700, letterSpacing: '0.15em', color: '#00ff41' }}>PhishForge</span>
          </div>
          <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.4, maxWidth: 260, lineHeight: 1.7 }}>
            # AI-powered phishing simulation<br />for authorized security training.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          {FOOTER_SECTIONS.map(section => (
            <div key={section.label}>
              <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: '#00ff41', opacity: 0.5, letterSpacing: '0.15em', marginBottom: 12 }}>
                // {section.label.toUpperCase()}
              </p>
              {section.links.map(([label, href]) => (
                <Link key={href} href={href} style={{ display: 'block', fontFamily: 'var(--font-fira-code), monospace', fontSize: 12, color: '#00ff41', opacity: 0.55, textDecoration: 'none', marginBottom: 8, transition: 'opacity 150ms' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '32px auto 0', borderTop: '1px solid rgba(0,255,65,0.08)', paddingTop: 20, fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: '#00ff41', opacity: 0.3 }}>
        © {new Date().getFullYear()} PhishForge AI — For authorized security training only.
      </div>
    </footer>
  );
}
