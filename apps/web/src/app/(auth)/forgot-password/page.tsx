'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const MONO = 'var(--font-fira-code), monospace';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (isDemo) {
      // No real auth backend in demo mode — acknowledge without leaking whether
      // the address exists.
      setTimeout(() => {
        setSent(true);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset email';
      toast.error(`RESET_ERROR: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '10px 40px 10px 14px',
    background: 'rgba(0,255,65,0.05)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(0,255,65,0.25)',
    borderRadius: '2px',
    color: '#c8ffd4',
    fontFamily: MONO,
    fontSize: '13px',
    outline: 'none',
    caretColor: '#00ff41',
    transition: 'border-color 150ms, box-shadow 150ms',
  };
  const inputFocus: React.CSSProperties = {
    borderColor: 'rgba(0,255,65,0.7)',
    boxShadow: '0 0 0 1px rgba(0,255,65,0.25), 0 0 16px rgba(0,255,65,0.08)',
  };

  return (
    <div style={{ animation: 'fadeSlideUp 0.25s ease-out both' }}>
      <div style={{
        border: '1px solid rgba(0,255,65,0.3)', borderRadius: '3px', overflow: 'hidden',
        boxShadow: '0 0 40px rgba(0,255,65,0.08), 0 0 80px rgba(0,255,65,0.04)',
      }}>
        {/* Title bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', background: 'rgba(0,255,65,0.08)', borderBottom: '1px solid rgba(0,255,65,0.2)',
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff41', display: 'inline-block' }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.1em' }}>
            phishforge — reset.sh
          </span>
          <div style={{ width: 48 }} />
        </div>

        {/* Body */}
        <div style={{ padding: '24px', background: '#080808' }}>
          {!sent ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#00ff41', opacity: 0.5 }}>$</span>
                  <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00ff41', textShadow: '0 0 8px rgba(0,255,65,0.5)' }}>
                    reset_password
                  </span>
                </div>
                <p style={{ fontFamily: MONO, fontSize: 11, color: '#00ff41', opacity: 0.4, marginLeft: 16, marginTop: 4 }}>
                  # Enter your email to receive a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 11, color: '#00ff41', opacity: 0.65, marginBottom: 6 }}>
                    <Mail size={12} /> --email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="email" type="email" value={email} required autoComplete="email"
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      placeholder="operator@company.com"
                      style={{ ...inputBase, ...(emailFocused ? inputFocus : {}) }}
                    />
                    <Mail size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#00ff41', opacity: 0.3, pointerEvents: 'none' }} />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '11px 16px', background: loading ? 'rgba(0,255,65,0.12)' : '#00ff41', color: '#000',
                    fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    border: 'none', borderRadius: 2, cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 0 20px rgba(0,255,65,0.3)', opacity: loading ? 0.6 : 1, transition: 'all 150ms',
                  }}
                >
                  {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> sending...</> : '> send(reset_link)'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <CheckCircle2 size={40} style={{ color: '#00ff41', filter: 'drop-shadow(0 0 10px rgba(0,255,65,0.6))', margin: '0 auto 14px' }} />
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: '#00ff41', textShadow: '0 0 8px rgba(0,255,65,0.5)', marginBottom: 8 }}>
                LINK_SENT
              </div>
              <p style={{ fontFamily: MONO, fontSize: 12, color: '#00ff41', opacity: 0.55, lineHeight: 1.7 }}>
                # If an account exists for<br />
                <span style={{ color: '#c8ffd4', opacity: 0.9 }}>{email || 'that address'}</span>,<br />
                a password reset link is on its way. Check your inbox and spam folder.
              </p>
            </div>
          )}

          {/* Back to login */}
          <p style={{ textAlign: 'center', marginTop: 20, fontFamily: MONO, fontSize: 12, color: '#00ff41', opacity: 0.45 }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#00ff41', opacity: 1, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              <ArrowLeft size={12} /> back_to_login()
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
