'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Mail, Github, Linkedin, Twitter, Send, CheckCircle } from 'lucide-react';

const inputBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(0,255,65,0.04)',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(0,255,65,0.2)',
  borderRadius: 2, padding: '11px 14px',
  fontFamily: 'var(--font-fira-code), monospace', fontSize: 13,
  color: '#c8ffd4', outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
};

type FormState = { name: string; email: string; company: string; message: string };

export default function ContactContent() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', company: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const focusStyle: React.CSSProperties = { borderColor: 'rgba(0,255,65,0.6)', boxShadow: '0 0 12px rgba(0,255,65,0.08)' };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Send failed');
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes neonPulse { 0%,100%{opacity:0.6;} 50%{opacity:1;} }
        @keyframes scanSlide { from { background-position: 0 0; } to { background-position: 0 4px; } }
        textarea { resize: vertical; min-height: 120px; }
      `}</style>

      <div style={{ paddingTop: 96, paddingBottom: 96, maxWidth: 1100, margin: '0 auto', padding: '96px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64, animation: 'fadeSlideUp 0.4s ease both' }}>
          <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.2em', marginBottom: 12 }}>// CONTACT</p>
          <h1 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, color: '#00ff41', textShadow: '0 0 24px rgba(0,255,65,0.3)', marginBottom: 14 }}>
            Get in touch
          </h1>
          <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 15, color: 'rgba(200,255,212,0.55)', maxWidth: 420, margin: '0 auto' }}>
            Questions about pricing, enterprise deployments, or just want to say hi?
          </p>
        </div>

        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 48, alignItems: 'start' }}>
          {/* ── LEFT: Erick Omari card ─────────────────────── */}
          <div style={{ animation: 'fadeSlideUp 0.4s 0.1s ease both', opacity: 0 }}>
            {/* Profile card */}
            <div style={{ border: '1px solid rgba(0,255,65,0.2)', borderRadius: 4, overflow: 'hidden', marginBottom: 24, background: 'rgba(0,255,65,0.02)' }}>
              {/* Avatar area */}
              <div style={{ position: 'relative', background: 'rgba(0,255,65,0.04)', borderBottom: '1px solid rgba(0,255,65,0.15)', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                {/* Scanline overlay */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(transparent, transparent 3px, rgba(0,255,65,0.015) 3px, rgba(0,255,65,0.015) 4px)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', width: 100, height: 100, borderRadius: 4, overflow: 'hidden', border: '2px solid rgba(0,255,65,0.4)', boxShadow: '0 0 24px rgba(0,255,65,0.15)' }}>
                  <Image src="/erick1.jpg" alt="Erick Omari" width={100} height={100} style={{ display: 'block', objectFit: 'cover', width: '100%', height: '100%' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 16, fontWeight: 700, color: '#00ff41', marginBottom: 4, textShadow: '0 0 10px rgba(0,255,65,0.4)' }}>
                    Erick Omari
                  </div>
                  <div style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.15em' }}>
                    // FOUNDER & CEO
                  </div>
                </div>
              </div>
              {/* Contact info */}
              <div style={{ padding: '20px 24px' }}>
                <a href="mailto:erickomari243@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid rgba(0,255,65,0.08)' }}>
                  <Mail size={14} style={{ color: '#00ff41', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 12, color: 'rgba(200,255,212,0.7)' }}>erickomari243@gmail.com</span>
                </a>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  {[
                    { icon: Github, href: 'https://github.com/pitchiluxe?tab=repositories', label: 'GitHub' },
                    { icon: Linkedin, href: 'https://www.linkedin.com/in/erickomari', label: 'LinkedIn' },
                    { icon: Twitter, href: 'https://x.com/eomari', label: 'Twitter' },
                  ].map(({ icon: Icon, href, label }) => (
                    <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: '1px solid rgba(0,255,65,0.2)', borderRadius: 3, background: 'rgba(0,255,65,0.04)', textDecoration: 'none', transition: 'border-color 150ms, box-shadow 150ms' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.5)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,65,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <Icon size={14} style={{ color: '#00ff41' }} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Response time indicator */}
            <div style={{ border: '1px solid rgba(0,255,65,0.12)', borderRadius: 3, padding: '16px 20px', background: 'rgba(0,255,65,0.02)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff41', boxShadow: '0 0 8px #00ff41', animation: 'neonPulse 2s ease-in-out infinite', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 12, color: '#00ff41', marginBottom: 2 }}>Typical response: &lt; 24h</div>
                <div style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 11, color: 'rgba(200,255,212,0.4)' }}>Enterprise inquiries get priority</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Contact form ────────────────────────── */}
          <div style={{ animation: 'fadeSlideUp 0.4s 0.2s ease both', opacity: 0 }}>
            {sent ? (
              <div style={{ border: '1px solid rgba(0,255,65,0.3)', borderRadius: 4, padding: '48px 36px', textAlign: 'center', background: 'rgba(0,255,65,0.03)' }}>
                <CheckCircle size={40} style={{ color: '#00ff41', margin: '0 auto 20px', display: 'block' }} />
                <h2 style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 18, fontWeight: 700, color: '#00ff41', marginBottom: 12 }}>Message sent</h2>
                <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 14, color: 'rgba(200,255,212,0.6)' }}>
                  Thanks {form.name.split(' ')[0]}! Erick will reply within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ border: '1px solid rgba(0,255,65,0.15)', borderRadius: 4, padding: '36px 32px', background: 'rgba(0,255,65,0.015)' }}>
                <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.4, letterSpacing: '0.15em', marginBottom: 24 }}>$ compose_message --to erickomari243@gmail.com</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: '#00ff41', opacity: 0.5, letterSpacing: '0.1em', marginBottom: 6 }}>NAME *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                      style={{ ...inputBase, ...(focused === 'name' ? focusStyle : {}) }} placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: '#00ff41', opacity: 0.5, letterSpacing: '0.1em', marginBottom: 6 }}>EMAIL *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                      style={{ ...inputBase, ...(focused === 'email' ? focusStyle : {}) }} placeholder="you@company.com" />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: '#00ff41', opacity: 0.5, letterSpacing: '0.1em', marginBottom: 6 }}>COMPANY</label>
                  <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    onFocus={() => setFocused('company')} onBlur={() => setFocused('')}
                    style={{ ...inputBase, ...(focused === 'company' ? focusStyle : {}) }} placeholder="Acme Corp" />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: '#00ff41', opacity: 0.5, letterSpacing: '0.1em', marginBottom: 6 }}>MESSAGE *</label>
                  <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                    style={{ ...inputBase, ...(focused === 'message' ? focusStyle : {}), fontFamily: 'var(--font-fira-code), monospace' }}
                    placeholder="Tell us about your security training needs..." rows={5} />
                </div>

                {error && (
                  <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 2, fontFamily: 'var(--font-fira-code), monospace', fontSize: 12, color: '#ff5050' }}>
                    ✗ {error}
                  </div>
                )}

                <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 24px', background: submitting ? 'rgba(0,255,65,0.4)' : '#00ff41', color: '#000', border: 'none', borderRadius: 2, fontFamily: 'var(--font-fira-code), monospace', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', cursor: submitting ? 'wait' : 'pointer', boxShadow: '0 0 20px rgba(0,255,65,0.3)', transition: 'box-shadow 200ms' }}
                  onMouseEnter={e => !submitting && (e.currentTarget.style.boxShadow = '0 0 32px rgba(0,255,65,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,65,0.3)')}>
                  <Send size={14} />
                  {submitting ? '> sending...' : '> execute(send)'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
