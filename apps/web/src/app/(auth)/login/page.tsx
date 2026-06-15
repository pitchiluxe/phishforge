'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (isDemo) {
      await fetch('/api/demo-login', { method: 'POST' });
      toast.success('DEMO_MODE: Entering dashboard preview');
      window.location.href = '/dashboard';
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(`AUTH_ERROR: ${error.message}`);
      setLoading(false);
      return;
    }
    toast.success('ACCESS_GRANTED');
    router.push('/dashboard');
    router.refresh();
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
    fontFamily: 'var(--font-fira-code), monospace',
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
    /* CSS entry animation — no framer-motion so opacity starts at 1 */
    <div style={{ animation: 'fadeSlideUp 0.25s ease-out both' }}>

      {/* Terminal window chrome */}
      <div style={{
        border: '1px solid rgba(0,255,65,0.3)',
        borderRadius: '3px',
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(0,255,65,0.08), 0 0 80px rgba(0,255,65,0.04)',
      }}>

        {/* Title bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'rgba(0,255,65,0.08)',
          borderBottom: '1px solid rgba(0,255,65,0.2)',
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff41', display: 'inline-block' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.1em' }}>
            phishforge — auth.sh
          </span>
          <div style={{ width: 48 }} />
        </div>

        {/* Terminal body */}
        <div style={{ padding: '24px', background: '#080808' }}>

          {/* Prompt header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5 }}>$</span>
              <span style={{
                fontFamily: 'var(--font-fira-code), monospace',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#00ff41',
                textShadow: '0 0 8px rgba(0,255,65,0.5)',
              }}>
                authenticate_user
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.4, marginLeft: 16, marginTop: 4 }}>
              # Enter credentials to access PhishForge
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-fira-code), monospace', fontSize: 11,
                color: '#00ff41', opacity: 0.65, marginBottom: 6,
              }}>
                <Mail size={12} /> --email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email" type="email" value={email} required
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="operator@company.com"
                  style={{ ...inputBase, ...(emailFocused ? inputFocus : {}) }}
                />
                <Mail size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#00ff41', opacity: 0.3, pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label htmlFor="password" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-fira-code), monospace', fontSize: 11,
                  color: '#00ff41', opacity: 0.65,
                }}>
                  <Lock size={12} /> --password
                </label>
                <Link href="/forgot-password" style={{
                  fontFamily: 'var(--font-fira-code), monospace', fontSize: 11,
                  color: '#00ff41', opacity: 0.45, textDecoration: 'underline',
                }}>
                  --reset
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password" type={showPassword ? 'text' : 'password'}
                  value={password} required autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  placeholder="••••••••••••"
                  style={{ ...inputBase, ...(passFocused ? inputFocus : {}) }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide' : 'Show'}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#00ff41', opacity: 0.4, background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 16px',
                background: loading ? 'rgba(0,255,65,0.12)' : '#00ff41',
                color: '#000',
                fontFamily: 'var(--font-fira-code), monospace',
                fontSize: 13, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                border: 'none', borderRadius: 2, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 20px rgba(0,255,65,0.3)',
                opacity: loading ? 0.6 : 1,
                transition: 'all 150ms',
              }}
            >
              {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> authenticating...</> : '> execute(login)'}
            </button>
          </form>

          {/* Register link */}
          <p style={{
            textAlign: 'center', marginTop: 20,
            fontFamily: 'var(--font-fira-code), monospace', fontSize: 12,
            color: '#00ff41', opacity: 0.45,
          }}>
            {'# '}
            <Link href="/register" style={{ color: '#00ff41', opacity: 1, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              register_new_operator()
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
