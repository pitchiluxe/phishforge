import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Zap, Shield, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing. Start free with 100 simulations/month. Scale to Pro at $49/month or Enterprise with unlimited simulations, SLA, and private deployment.',
  alternates: { canonical: '/pricing' },
  openGraph: { url: '/pricing', title: 'Pricing | PhishForge' },
};

const PLANS = [
  {
    icon: Zap,
    name: 'Free',
    price: '$0',
    period: '/month',
    tagline: 'Get started with AI phishing simulations',
    features: [
      '100 simulations / month',
      '50,000 AI tokens / month',
      '1 seat',
      '1 active campaign',
      'CyberLM incident analyzer (5 req/day)',
      'Classroom training (3 modules)',
      'AI Training sessions (5 / month)',
      'Basic analytics dashboard',
      'Email template library',
      'Safety scoring on all emails',
      'Community support',
    ],
    cta: 'Start Free',
    href: '/register',
    highlight: false,
    badge: null,
  },
  {
    icon: Shield,
    name: 'Pro',
    price: '$49',
    period: '/month',
    tagline: 'For growing security teams',
    features: [
      '5,000 simulations / month',
      '5,000,000 AI tokens / month',
      '5 seats',
      'Unlimited active campaigns',
      'CyberLM incident analyzer (unlimited)',
      'All classroom modules (unlimited)',
      'Unlimited AI training sessions',
      'Threat intelligence (full access)',
      'Knowledge base — RAG (10 GB)',
      'Webhook delivery callbacks',
      'REST API + Node / Python / Go SDKs',
      'Custom email templates',
      'Advanced analytics + exports',
      'Priority email support',
    ],
    cta: 'Start Pro Trial',
    href: '/register?plan=pro',
    highlight: true,
    badge: 'MOST POPULAR',
  },
  {
    icon: Building2,
    name: 'Enterprise',
    price: 'Custom',
    period: 'usage-based',
    tagline: 'For organizations that need it all',
    features: [
      'Unlimited simulations + AI tokens',
      'Unlimited seats + RBAC',
      'All Pro features included',
      'Private deployment (on-prem / VPC)',
      'Custom AI model fine-tuning',
      'Unlimited knowledge base storage',
      'SIEM / SOAR integration',
      'SSO (SAML 2.0 / OIDC)',
      'SLA — 99.9% uptime guarantee',
      'GDPR / SOC 2 compliance docs',
      'Dedicated support engineer',
      'Custom contract & invoicing',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlight: false,
    badge: 'SLA INCLUDED',
  },
];

const FAQ = [
  { q: 'What counts as a simulation?', a: 'One simulation = one AI-generated phishing email sent to one recipient. Batch campaigns count per-target.' },
  { q: 'Can I upgrade or downgrade at any time?', a: 'Yes. Plan changes take effect immediately. Unused credits on downgrade are prorated.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes — 14 days free, no credit card required. Cancels automatically.' },
  { q: 'Where is my data stored?', a: 'Cloud plans use Supabase (AWS us-east-1). Enterprise can deploy to any region or your own infrastructure.' },
  { q: 'Do you support on-premises deployment?', a: 'Yes, on the Enterprise plan. We provide a Docker image and deployment guide for air-gapped environments.' },
];

export default function PricingPage() {
  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .plan-card { transition: border-color 250ms, box-shadow 250ms; }
        .plan-card:hover { border-color: rgba(0,255,65,0.4) !important; box-shadow: 0 0 32px rgba(0,255,65,0.06) !important; }
      `}</style>

      <div style={{ paddingTop: 100, paddingBottom: 96, maxWidth: 1200, margin: '0 auto', padding: '100px 24px 96px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64, animation: 'fadeSlideUp 0.4s ease both' }}>
          <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.2em', marginBottom: 12 }}>// PRICING</p>
          <h1 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: '#00ff41', textShadow: '0 0 30px rgba(0,255,65,0.3)', marginBottom: 16 }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 16, color: 'rgba(200,255,212,0.6)', maxWidth: 480, margin: '0 auto' }}>
            Start free. Scale as your team grows. No hidden fees.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 80 }}>
          {PLANS.map(({ icon: Icon, name, price, period, tagline, features, cta, href, highlight, badge }) => (
            <div key={name} className="plan-card" style={{
              border: `1px solid ${highlight ? 'rgba(0,255,65,0.4)' : 'rgba(0,255,65,0.15)'}`,
              borderRadius: 4,
              padding: '32px 28px',
              background: highlight ? 'rgba(0,255,65,0.04)' : 'rgba(0,255,65,0.015)',
              position: 'relative',
              boxShadow: highlight ? '0 0 40px rgba(0,255,65,0.07)' : 'none',
            }}>
              {badge && (
                <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#00ff41', color: '#000', fontFamily: 'var(--font-fira-code), monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', padding: '3px 12px', borderRadius: '0 0 4px 4px' }}>
                  {badge}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 4, background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color: '#00ff41' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 14, fontWeight: 700, color: '#00ff41', letterSpacing: '0.05em' }}>{name}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 36, fontWeight: 700, color: '#00ff41', textShadow: '0 0 16px rgba(0,255,65,0.3)' }}>{price}</span>
                <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 12, color: '#00ff41', opacity: 0.45, marginLeft: 6 }}>{period}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 12, color: 'rgba(200,255,212,0.5)', marginBottom: 24, lineHeight: 1.5 }}>{tagline}</p>
              <div style={{ borderTop: '1px solid rgba(0,255,65,0.1)', paddingTop: 20, marginBottom: 28 }}>
                {features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <Check size={13} style={{ color: '#00ff41', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 13, color: 'rgba(200,255,212,0.7)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href={href} style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
                padding: '12px 24px', borderRadius: 2,
                color: highlight ? '#000' : '#00ff41',
                background: highlight ? '#00ff41' : 'transparent',
                border: `1px solid ${highlight ? '#00ff41' : 'rgba(0,255,65,0.35)'}`,
                boxShadow: highlight ? '0 0 20px rgba(0,255,65,0.3)' : 'none',
                transition: 'box-shadow 200ms',
              }}>
                {cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.2em', marginBottom: 12, textAlign: 'center' }}>// FAQ</p>
          <h2 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 22, fontWeight: 700, color: '#00ff41', textAlign: 'center', marginBottom: 40 }}>Common questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FAQ.map(({ q, a }) => (
              <div key={q} style={{ border: '1px solid rgba(0,255,65,0.12)', borderRadius: 3, padding: '20px 24px', background: 'rgba(0,255,65,0.02)' }}>
                <h3 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, fontWeight: 600, color: '#00ff41', marginBottom: 8 }}>{q}</h3>
                <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 13, color: 'rgba(200,255,212,0.6)', lineHeight: 1.65 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise banner */}
        <div style={{ marginTop: 64, border: '1px solid rgba(0,255,65,0.2)', borderRadius: 4, padding: '40px 36px', background: 'rgba(0,255,65,0.03)', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 20, fontWeight: 700, color: '#00ff41', marginBottom: 12 }}>Need a custom quote?</h3>
          <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 14, color: 'rgba(200,255,212,0.6)', marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>
            Our team will work with you on a custom contract, dedicated infrastructure, and tailored SLA.
          </p>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, fontWeight: 700, color: '#000', background: '#00ff41', textDecoration: 'none', padding: '12px 28px', borderRadius: 2, boxShadow: '0 0 20px rgba(0,255,65,0.35)', letterSpacing: '0.05em' }}>
            Contact Sales
          </Link>
        </div>
      </div>
    </>
  );
}
