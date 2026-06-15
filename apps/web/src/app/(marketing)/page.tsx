import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Zap, Brain, BarChart3, BookOpen, Lock, ChevronRight, Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PhishForge — AI Phishing Simulation Platform',
  description: 'PhishForge AI generates hyper-realistic phishing simulations for authorized security awareness training. Cut click rates by 73%. Start free.',
  alternates: { canonical: '/' },
  openGraph: { url: '/', title: 'PhishForge — AI Phishing Simulation Platform' },
};

const FEATURES = [
  { icon: Brain, label: 'AI Generation', desc: 'GPT-4-class models craft hyper-realistic phishing emails tailored to your industry, role, and internal context.' },
  { icon: BookOpen, label: 'RAG Knowledge Base', desc: 'Upload company docs, policies, and org charts — the AI weaves internal context into every simulation.' },
  { icon: BarChart3, label: 'Real-Time Analytics', desc: 'Track click rates, open rates, and department risk scores as they happen. Identify your highest-risk teams.' },
  { icon: Shield, label: 'Safety Scoring', desc: 'Every generated email is scored 0–100 before delivery. Anything below the threshold is blocked automatically.' },
  { icon: Zap, label: 'Multi-Provider AI', desc: 'Switch between OpenRouter and local Ollama models at runtime. Your data never leaves your infrastructure.' },
  { icon: Lock, label: 'Enterprise-Grade Security', desc: 'Row-level security, audit logs, MFA, RBAC with 5 permission levels, and GDPR-compliant data handling.' },
];

const STATS = [
  { value: '2.4M+', label: 'simulations_run' },
  { value: '73%', label: 'click_rate_reduction' },
  { value: '500+', label: 'enterprise_customers' },
  { value: '< 2s', label: 'avg_generation_time' },
];

const TERMINAL_LINES = [
  { delay: 0,   text: '$ phishforge generate --industry finance --role accountant', type: 'cmd' },
  { delay: 0.8, text: '> Fetching knowledge base vectors...', type: 'info' },
  { delay: 1.6, text: '> Querying threat intelligence feed...', type: 'info' },
  { delay: 2.4, text: '> Generating with deepseek/deepseek-chat-v3-0324...', type: 'info' },
  { delay: 3.2, text: '', type: 'blank' },
  { delay: 3.4, text: '✓ Subject: "Urgent: Q4 Expense Report Requires Immediate Action"', type: 'success' },
  { delay: 4.0, text: '✓ Safety score: 94/100', type: 'success' },
  { delay: 4.6, text: '✓ Delivered to 847 targets', type: 'success' },
  { delay: 5.2, text: '✓ Webhook confirmed: { status: "sent", timestamp: "2026-06-14T..." }', type: 'success' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PhishForge AI',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Web',
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free Plan' },
    { '@type': 'Offer', price: '49', priceCurrency: 'USD', name: 'Pro Plan', billingPeriod: 'P1M' },
  ],
  description: 'AI-powered phishing simulation platform for authorized enterprise security awareness training.',
  author: { '@type': 'Person', name: 'Erick Omari' },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '312' },
};

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes termLine { from { opacity:0; } to { opacity:1; } }
        @keyframes cursorBlink { 0%,100%{opacity:1;} 50%{opacity:0;} }
        @keyframes heroPulse { 0%,100%{opacity:0.04;} 50%{opacity:0.08;} }
        .term-line { animation: termLine 0.2s ease both; }
        .hero-glow { animation: heroPulse 3s ease-in-out infinite; }
        .feature-card { transition: border-color 200ms, box-shadow 200ms; cursor: default; }
        .feature-card:hover { border-color: rgba(0,255,65,0.4) !important; box-shadow: 0 0 24px rgba(0,255,65,0.06) !important; }
        .cta-primary:hover { box-shadow: 0 0 36px rgba(0,255,65,0.6) !important; }
        .cta-outline:hover { background: rgba(0,255,65,0.08) !important; }
        .how-step { transition: background 200ms; }
        .how-step:hover { background: rgba(0,255,65,0.03); }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ paddingTop: 120, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,65,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,65,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px', opacity: 0.025 }} />
        <div className="hero-glow" style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(0,255,65,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(0,255,65,0.3)', borderRadius: 2, padding: '5px 14px', marginBottom: 32, background: 'rgba(0,255,65,0.05)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff41', boxShadow: '0 0 6px #00ff41', display: 'inline-block', animation: 'cursorBlink 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', letterSpacing: '0.15em' }}>v1.0 — NOW LIVE</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 700, lineHeight: 1.1, color: '#00ff41', textShadow: '0 0 40px rgba(0,255,65,0.3)', marginBottom: 24, letterSpacing: '-0.02em', animation: 'fadeSlideUp 0.5s ease both' }}>
            Simulate Attacks.<br />Build Resilience.
          </h1>
          <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(200,255,212,0.7)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7, animation: 'fadeSlideUp 0.5s 0.1s ease both', opacity: 0 }}>
            PhishForge AI generates hyper-realistic phishing simulations in seconds. Train your team to recognize attacks before real adversaries strike.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeSlideUp 0.5s 0.2s ease both', opacity: 0 }}>
            <Link href="/register" className="cta-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-fira-code), monospace', fontSize: 14, fontWeight: 700, color: '#000', background: '#00ff41', textDecoration: 'none', padding: '13px 28px', borderRadius: 2, boxShadow: '0 0 24px rgba(0,255,65,0.4)', letterSpacing: '0.05em', transition: 'box-shadow 200ms' }}>
              <Terminal size={15} /> Start Free — No Card
            </Link>
            <Link href="/pricing" className="cta-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-fira-code), monospace', fontSize: 14, color: '#00ff41', textDecoration: 'none', padding: '13px 28px', borderRadius: 2, border: '1px solid rgba(0,255,65,0.35)', background: 'rgba(0,255,65,0.05)', letterSpacing: '0.05em', transition: 'background 200ms' }}>
              View Pricing <ChevronRight size={14} />
            </Link>
          </div>

          {/* Terminal demo */}
          <div style={{ maxWidth: 700, margin: '60px auto 0', border: '1px solid rgba(0,255,65,0.25)', borderRadius: 4, overflow: 'hidden', boxShadow: '0 0 60px rgba(0,255,65,0.07)', animation: 'fadeSlideUp 0.5s 0.3s ease both', opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(0,255,65,0.07)', borderBottom: '1px solid rgba(0,255,65,0.15)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff41', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.45, marginLeft: 8 }}>phishforge — live demo</span>
            </div>
            <div style={{ background: '#080808', padding: '20px 24px', textAlign: 'left', minHeight: 180 }}>
              {TERMINAL_LINES.map((line, i) => (
                <div key={i} className="term-line" style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 12, lineHeight: 1.9, animationDelay: `${line.delay}s`, color: line.type === 'success' ? '#00ff41' : line.type === 'info' ? 'rgba(0,255,65,0.55)' : 'rgba(200,255,212,0.8)' }}>
                  {line.text || ' '}
                </div>
              ))}
              <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 12, color: '#00ff41', animation: 'cursorBlink 1s step-end infinite' }}>█</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(0,255,65,0.1)', borderBottom: '1px solid rgba(0,255,65,0.1)', padding: '48px 24px', background: 'rgba(0,255,65,0.02)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: '#00ff41', textShadow: '0 0 20px rgba(0,255,65,0.4)', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.45, letterSpacing: '0.1em', marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.2em', marginBottom: 12 }}>// CAPABILITIES</p>
            <h2 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#00ff41', textShadow: '0 0 20px rgba(0,255,65,0.3)' }}>Everything you need to harden your team</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="feature-card" style={{ border: '1px solid rgba(0,255,65,0.15)', borderRadius: 3, padding: '28px 24px', background: 'rgba(0,255,65,0.025)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 4, background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={18} style={{ color: '#00ff41' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, fontWeight: 700, color: '#00ff41', marginBottom: 10, letterSpacing: '0.05em' }}>{label}</h3>
                <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 13, color: 'rgba(200,255,212,0.6)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'rgba(0,255,65,0.02)', borderTop: '1px solid rgba(0,255,65,0.08)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.2em', marginBottom: 12 }}>// HOW_IT_WORKS</p>
            <h2 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#00ff41' }}>From setup to simulation in 3 steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {[
              { n: '01', title: 'Connect Knowledge', body: 'Upload your company docs, org charts, and internal communications. PhishForge indexes everything into a vector store for RAG.' },
              { n: '02', title: 'Generate Campaigns', body: 'Select your target industry, role, and difficulty. The AI crafts phishing emails that look exactly like the real threats your team will face.' },
              { n: '03', title: 'Track & Improve', body: 'Watch real-time analytics show which employees clicked, opened, or reported. Auto-enroll high-risk users in micro-training.' },
            ].map(step => (
              <div key={step.n} className="how-step" style={{ textAlign: 'center', padding: '24px 20px', borderRadius: 3 }}>
                <div style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 40, fontWeight: 700, color: 'rgba(0,255,65,0.15)', lineHeight: 1, marginBottom: 16 }}>{step.n}</div>
                <h3 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 14, fontWeight: 700, color: '#00ff41', marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 13, color: 'rgba(200,255,212,0.55)', lineHeight: 1.7 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#00ff41', textShadow: '0 0 20px rgba(0,255,65,0.3)', marginBottom: 16 }}>
            Start training your team today
          </h2>
          <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 15, color: 'rgba(200,255,212,0.6)', marginBottom: 36, lineHeight: 1.7 }}>
            Free plan includes 100 simulations/month. No credit card required.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="cta-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-fira-code), monospace', fontSize: 14, fontWeight: 700, color: '#000', background: '#00ff41', textDecoration: 'none', padding: '13px 32px', borderRadius: 2, boxShadow: '0 0 28px rgba(0,255,65,0.4)', letterSpacing: '0.05em', transition: 'box-shadow 200ms' }}>
              <Terminal size={15} /> Start Free
            </Link>
            <Link href="/contact" className="cta-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-fira-code), monospace', fontSize: 14, color: '#00ff41', textDecoration: 'none', padding: '13px 32px', borderRadius: 2, border: '1px solid rgba(0,255,65,0.35)', background: 'rgba(0,255,65,0.05)', letterSpacing: '0.05em', transition: 'background 200ms' }}>
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
