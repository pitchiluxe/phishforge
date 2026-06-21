import type { Metadata } from 'next';
import { Shield, Lock, Eye, Server, Key, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security',
  description: 'PhishForge AI security practices — encryption, access controls, GDPR compliance, vulnerability disclosure, and infrastructure hardening.',
  alternates: { canonical: '/security' },
};

const PRACTICES = [
  {
    icon: Lock,
    title: 'Encryption',
    items: [
      'TLS 1.3 for all data in transit',
      'AES-256 encryption at rest via Supabase',
      'Pinecone vectors encrypted at rest',
      'Passwords hashed with bcrypt (12 rounds)',
      'HTTP-only, Secure, SameSite=Strict cookies',
    ],
  },
  {
    icon: Key,
    title: 'Access Control',
    items: [
      'Row-Level Security (RLS) enforced at database layer',
      'JWT-based API authentication with short expiry',
      'RBAC with 5 permission levels (owner → viewer)',
      'MFA available on all accounts',
      'API keys are hashed before storage — never stored in plaintext',
    ],
  },
  {
    icon: Server,
    title: 'Infrastructure',
    items: [
      'Hosted on SOC 2 Type II certified infrastructure',
      'Supabase (PostgreSQL) with automatic backups every 6h',
      'No persistent attachment storage — content in memory only',
      'Rate limiting at the API gateway (30 req/min default)',
      'Webhook delivery with HMAC-SHA256 signature verification',
    ],
  },
  {
    icon: Eye,
    title: 'Audit & Monitoring',
    items: [
      'Every /generate call logs a hashed emailId + timestamp',
      'Zero raw personal data in audit logs',
      'Logs automatically purged after retention period (365d default)',
      'Anomaly detection alerts for unusual API usage patterns',
      'Admin audit trail for all privileged actions',
    ],
  },
  {
    icon: Shield,
    title: 'Compliance',
    items: [
      'GDPR-compliant data handling and deletion workflows',
      'Right-to-be-forgotten endpoint removes all org data',
      'Data Processing Agreements available on request',
      'Tenant isolation — no cross-org data access possible',
      'Audit reports available for Enterprise customers',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Vulnerability Disclosure',
    items: [
      'Responsible disclosure: use the contact form at /contact',
      'PGP key available on request',
      'We acknowledge reports within 48 hours',
      'We commit to fixing critical issues within 7 days',
      'Public CVE disclosure after patch is released',
    ],
  },
];

export default function SecurityPage() {
  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        .sec-card { transition: border-color 200ms, box-shadow 200ms; }
        .sec-card:hover { border-color: rgba(0,255,65,0.35) !important; box-shadow: 0 0 20px rgba(0,255,65,0.05) !important; }
      `}</style>
      <div style={{ paddingTop: 96, paddingBottom: 96, maxWidth: 1100, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64, animation: 'fadeSlideUp 0.4s ease both' }}>
          <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.2em', marginBottom: 12 }}>// SECURITY</p>
          <h1 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: '#00ff41', textShadow: '0 0 24px rgba(0,255,65,0.3)', marginBottom: 14 }}>
            Security at PhishForge
          </h1>
          <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 15, color: 'rgba(200,255,212,0.6)', maxWidth: 520, margin: '0 auto' }}>
            We hold ourselves to the same standards we help our customers achieve. Here&apos;s how we protect your data.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {PRACTICES.map(({ icon: Icon, title, items }) => (
            <div key={title} className="sec-card" style={{ border: '1px solid rgba(0,255,65,0.15)', borderRadius: 3, padding: '28px 24px', background: 'rgba(0,255,65,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 4, background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color: '#00ff41' }} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, fontWeight: 700, color: '#00ff41', letterSpacing: '0.05em' }}>{title}</h2>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: '#00ff41', fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 13, color: 'rgba(200,255,212,0.65)', lineHeight: 1.5 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclosure CTA */}
        <div style={{ marginTop: 64, border: '1px solid rgba(0,255,65,0.2)', borderRadius: 3, padding: '32px 28px', textAlign: 'center', background: 'rgba(0,255,65,0.02)' }}>
          <h3 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 16, fontWeight: 700, color: '#00ff41', marginBottom: 10 }}>Found a vulnerability?</h3>
          <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 14, color: 'rgba(200,255,212,0.6)', marginBottom: 20 }}>
            Please disclose responsibly. We take all security reports seriously and respond within 48 hours.
          </p>
          <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, fontWeight: 700, color: '#000', background: '#00ff41', textDecoration: 'none', padding: '11px 24px', borderRadius: 2, boxShadow: '0 0 16px rgba(0,255,65,0.3)', letterSpacing: '0.05em' }}>
            <AlertTriangle size={13} /> Report a Vulnerability
          </a>
        </div>
      </div>
    </>
  );
}
