'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const MONO = 'var(--font-fira-code), monospace';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  // The reset email link lands here with a recovery token. The Supabase client
  // exchanges it for a session automatically; confirm we have one before allowing
  // a password change.
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder');
    if (isDemo) { setReady(true); return; }

    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setTimeout(() => setReady((r) => { if (!r) setInvalid(true); return r; }), 2500);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder');
    if (isDemo) {
      setTimeout(() => { setDone(true); setLoading(false); }, 500);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success('PASSWORD_UPDATED');
      setTimeout(() => router.push('/login'), 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password';
      toast.error(`RESET_ERROR: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 40px 10px 14px', background: 'rgba(0,255,65,0.05)',
    borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(0,255,65,0.25)', borderRadius: '2px',
    color: '#c8ffd4', fontFamily: MONO, fontSize: '13px', outline: 'none', caretColor: '#00ff41',
    transition: 'border-color 150ms, box-shadow 150ms',
  };
  const inputFocus: React.CSSProperties = {
    borderColor: 'rgba(0,255,65,0.7)', boxShadow: '0 0 0 1px rgba(0,255,65,0.25), 0 0 16px rgba(0,255,65,0.08)',
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
          {done ? (
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <CheckCircle2 size={40} style={{ color: '#00ff41', filter: 'drop-shadow(0 0 10px rgba(0,255,65,0.6))', margin: '0 auto 14px' }} />
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: '#00ff41', textShadow: '0 0 8px rgba(0,255,65,0.5)', marginBottom: 8 }}>
                PASSWORD_UPDATED
              </div>
              <p style={{ fontFamily: MONO, fontSize: 12, color: '#00ff41', opacity: 0.55, lineHeight: 1.7 }}>
                # Redirecting you to login…
              </p>
            </div>
          ) : invalid ? (
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <AlertTriangle size={38} style={{ color: '#febc2e', filter: 'drop-shadow(0 0 10px rgba(254,188,46,0.5))', margin: '0 auto 14px' }} />
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: '#febc2e', marginBottom: 8 }}>
                LINK_EXPIRED
              </div>
              <p style={{ fontFamily: MONO, fontSize: 12, color: '#00ff41', opacity: 0.55, lineHeight: 1.7 }}>
                # This reset link is invalid or has expired.<br />Request a new one below.
              </p>
              <p style={{ textAlign: 'center', marginTop: 18, fontFamily: MONO, fontSize: 12 }}>
                <Link href="/forgot-password" style={{ color: '#00ff41', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  request_new_link()
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#00ff41', opacity: 0.5 }}>$</span>
                  <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00ff41', textShadow: '0 0 8px rgba(0,255,65,0.5)' }}>
                    set_new_password
                  </span>
                </div>
                <p style={{ fontFamily: MONO, fontSize: 11, color: '#00ff41', opacity: 0.4, marginLeft: 16, marginTop: 4 }}>
                  # Choose a new password (min 8 characters)
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* New password */}
                <div>
                  <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 11, color: '#00ff41', opacity: 0.65, marginBottom: 6 }}>
                    <Lock size={12} /> --new-password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password" type={showPassword ? 'text' : 'password'} value={password} required
                      autoComplete="new-password"
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused('p')} onBlur={() => setFocused(null)}
                      placeholder="••••••••••••"
                      style={{ ...inputBase, ...(focused === 'p' ? inputFocus : {}) }}
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide' : 'Show'}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#00ff41', opacity: 0.4, background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 11, color: '#00ff41', opacity: 0.65, marginBottom: 6 }}>
                    <Lock size={12} /> --confirm-password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm" type={showPassword ? 'text' : 'password'} value={confirm} required
                      autoComplete="new-password"
                      onChange={(e) => setConfirm(e.target.value)}
                      onFocus={() => setFocused('c')} onBlur={() => setFocused(null)}
                      placeholder="••••••••••••"
                      style={{ ...inputBase, ...(focused === 'c' ? inputFocus : {}) }}
                    />
                    <Lock size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#00ff41', opacity: 0.3, pointerEvents: 'none' }} />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading || !ready}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '11px 16px', background: (loading || !ready) ? 'rgba(0,255,65,0.12)' : '#00ff41', color: '#000',
                    fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    border: 'none', borderRadius: 2, cursor: (loading || !ready) ? 'not-allowed' : 'pointer',
                    boxShadow: (loading || !ready) ? 'none' : '0 0 20px rgba(0,255,65,0.3)', opacity: (loading || !ready) ? 0.6 : 1, transition: 'all 150ms',
                  }}
                >
                  {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> updating...</>
                    : !ready ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> verifying link...</>
                    : '> update(password)'}
                </button>
              </form>
            </>
          )}

          {!done && !invalid && (
            <p style={{ textAlign: 'center', marginTop: 20, fontFamily: MONO, fontSize: 12, color: '#00ff41', opacity: 0.45 }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#00ff41', opacity: 1, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                <ArrowLeft size={12} /> back_to_login()
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
