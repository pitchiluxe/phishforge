import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'PhishForge AI Privacy Policy — how we collect, use, and protect your data. GDPR compliant.',
  alternates: { canonical: '/privacy' },
};

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `Account data: name, email address, organization name, and password (hashed).

Campaign data: simulation parameters (industry, role, difficulty), generated email metadata, and anonymized click/open analytics. We never store the content of emails sent to simulation targets.

Usage data: API call logs with hashed identifiers, request timestamps, and response codes. No raw personal data from simulation recipients is retained.

Billing data: processed by Stripe. We store only the Stripe customer ID — no card numbers.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to:
• Provide and improve the PhishForge platform
• Process payments and manage subscriptions
• Send transactional emails (account creation, invoices, security alerts)
• Generate aggregate analytics about platform usage
• Comply with legal obligations

We do not sell your personal data to third parties.`,
  },
  {
    title: '3. Data Storage & Security',
    body: `Data is stored in Supabase (PostgreSQL) with row-level security enforcing strict tenant isolation. All data is encrypted at rest (AES-256) and in transit (TLS 1.3).

AI vector embeddings are stored in Pinecone under a per-organization namespace. Embeddings are deleted when you delete your organization or request data removal.`,
  },
  {
    title: '4. Your Rights (GDPR)',
    body: `If you are located in the EU/EEA, you have the following rights:
• Access: request a copy of all data we hold about you
• Rectification: correct inaccurate personal data
• Erasure: request deletion of your data ("right to be forgotten")
• Portability: receive your data in a machine-readable format
• Objection: opt out of processing for legitimate interest purposes

To exercise these rights, email: erickomari243@gmail.com. We respond within 30 days.`,
  },
  {
    title: '5. Data Retention',
    body: `Account data: retained until you delete your account.
Campaign analytics: retained for 365 days by default (configurable in org settings).
Audit logs: retained for 365 days then automatically purged.
Billing records: retained for 7 years per financial regulations.`,
  },
  {
    title: '6. Third-Party Services',
    body: `We use the following sub-processors:
• Supabase (database) — US, GDPR DPA in place
• Pinecone (vector store) — US, GDPR DPA in place
• Stripe (payments) — SOC 2 Type II certified
• OpenRouter / Ollama (AI) — requests do not include personal data

A full list of sub-processors is available on request.`,
  },
  {
    title: '7. Cookies',
    body: `We use only essential cookies required for authentication (session token stored as an HTTP-only, Secure, SameSite=Strict cookie). We do not use tracking or advertising cookies.`,
  },
  {
    title: '8. Contact',
    body: `Data controller: Erick Omari, PhishForge AI
Email: erickomari243@gmail.com

For DPA (Data Processing Agreement) requests, please use the same email with subject line "DPA Request".`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <style>{`@keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }`}</style>
      <div style={{ paddingTop: 96, paddingBottom: 96, maxWidth: 760, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ marginBottom: 56, animation: 'fadeSlideUp 0.4s ease both' }}>
          <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.2em', marginBottom: 12 }}>// LEGAL</p>
          <h1 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#00ff41', textShadow: '0 0 20px rgba(0,255,65,0.25)', marginBottom: 12 }}>
            Privacy Policy
          </h1>
          <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.4 }}>Last updated: June 14, 2026</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {SECTIONS.map(({ title, body }) => (
            <div key={title} style={{ borderLeft: '2px solid rgba(0,255,65,0.2)', paddingLeft: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 14, fontWeight: 700, color: '#00ff41', marginBottom: 12 }}>{title}</h2>
              {body.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 14, color: 'rgba(200,255,212,0.65)', lineHeight: 1.8, marginBottom: 10, whiteSpace: 'pre-line' }}>{para}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
