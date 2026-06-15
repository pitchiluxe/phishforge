import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'PhishForge AI Terms of Service. Authorized use only — for security awareness training.',
  alternates: { canonical: '/terms' },
};

const SECTIONS = [
  {
    title: '1. Authorized Use Only',
    body: `PhishForge AI is a security awareness training platform. You may only use it to conduct phishing simulations on individuals or organizations for which you have explicit written authorization.

Unauthorized use of this platform to conduct phishing attacks against individuals, organizations, or systems without consent is strictly prohibited and may constitute criminal activity under applicable law.`,
  },
  {
    title: '2. Account Registration',
    body: `You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.

Each account is bound to one organization. Sharing credentials across organizations is not permitted.`,
  },
  {
    title: '3. Acceptable Use Policy',
    body: `You agree not to:
• Use the platform for any unlawful purpose or in violation of any regulations
• Simulate attacks against targets you do not have authorization to test
• Attempt to reverse-engineer, decompile, or extract AI models or proprietary algorithms
• Share API keys or access credentials with unauthorized parties
• Exceed rate limits or attempt to circumvent usage quotas`,
  },
  {
    title: '4. Data Processing',
    body: `PhishForge processes campaign data, email templates, and analytics on your behalf. We store only hashed identifiers — no raw personal data from simulation targets is persisted beyond the active campaign window.

You are the data controller for all target data you introduce into the platform. We act as the data processor.`,
  },
  {
    title: '5. Intellectual Property',
    body: `The PhishForge platform, including its AI models, UI, and documentation, is proprietary to PhishForge AI. Nothing in these Terms grants you ownership of our intellectual property.

Content you generate using the platform (simulation emails, reports) remains your property.`,
  },
  {
    title: '6. Limitation of Liability',
    body: `PhishForge AI is provided "as is." We do not warrant that the platform will be error-free or uninterrupted. In no event shall PhishForge AI be liable for indirect, incidental, or consequential damages arising from your use of the platform.

Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.`,
  },
  {
    title: '7. Termination',
    body: `We reserve the right to suspend or terminate your account immediately if you violate these Terms. Upon termination, your access to the platform will cease and your data will be purged within 30 days.`,
  },
  {
    title: '8. Changes to Terms',
    body: `We may update these Terms from time to time. We will notify you of material changes via email at least 14 days before they take effect. Continued use of the platform after changes take effect constitutes acceptance.`,
  },
  {
    title: '9. Contact',
    body: `For questions about these Terms, contact us at: erickomari243@gmail.com`,
  },
];

export default function TermsPage() {
  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
      `}</style>
      <div style={{ paddingTop: 96, paddingBottom: 96, maxWidth: 760, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ marginBottom: 56, animation: 'fadeSlideUp 0.4s ease both' }}>
          <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.2em', marginBottom: 12 }}>// LEGAL</p>
          <h1 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#00ff41', textShadow: '0 0 20px rgba(0,255,65,0.25)', marginBottom: 12 }}>
            Terms of Service
          </h1>
          <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.4 }}>
            Last updated: June 14, 2026
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {SECTIONS.map(({ title, body }) => (
            <div key={title} style={{ borderLeft: '2px solid rgba(0,255,65,0.2)', paddingLeft: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 14, fontWeight: 700, color: '#00ff41', marginBottom: 12, letterSpacing: '0.03em' }}>{title}</h2>
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
