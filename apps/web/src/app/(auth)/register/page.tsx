'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Check, User, Building2, Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '10px 40px 10px 14px',
  background: 'rgba(0,255,65,0.05)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(0,255,65,0.25)',
  borderRadius: 2,
  color: '#c8ffd4',
  fontFamily: 'var(--font-fira-code), monospace',
  fontSize: 13,
  outline: 'none',
  caretColor: '#00ff41',
  transition: 'border-color 150ms, box-shadow 150ms',
};

const inputFocus: React.CSSProperties = {
  borderColor: 'rgba(0,255,65,0.7)',
  boxShadow: '0 0 0 1px rgba(0,255,65,0.25), 0 0 16px rgba(0,255,65,0.08)',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'var(--font-fira-code), monospace',
  fontSize: 11,
  color: '#00ff41',
  opacity: 0.65,
  marginBottom: 6,
};

function Field({
  id, label, icon: Icon, type = 'text', value, onChange, placeholder, required, minLength, children,
}: {
  id: string; label: string; icon: React.ElementType; type?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; minLength?: number;
  children?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        <Icon size={12} /> {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id} type={type} value={value} onChange={onChange}
          placeholder={placeholder} required={required} minLength={minLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...inputBase, ...(focused ? inputFocus : {}) }}
        />
        {children}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', email: '', organization_name: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const strength = form.password.length >= 12 ? 2 : form.password.length >= 8 ? 1 : 0;
  const strengthColor = ['#ff4444', '#febc2e', '#00ff41'][strength];
  const strengthLabel = ['weak', 'medium', 'strong'][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (isDemo) {
      await fetch('/api/demo-login', { method: 'POST' });
      toast.success('DEMO_MODE: Supabase not configured — entering dashboard preview');
      window.location.href = '/dashboard';
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, organization_name: form.organization_name } },
    });
    if (error) {
      toast.error(`REG_ERROR: ${error.message}`);
      setLoading(false);
      return;
    }
    toast.success('WORKSPACE_CREATED: Initializing...');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div style={{ animation: 'fadeSlideUp 0.25s ease-out both' }}>
      <div style={{
        border: '1px solid rgba(0,255,65,0.3)',
        borderRadius: 3,
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
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff41', display: 'inline-block' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5, letterSpacing: '0.1em' }}>
            phishforge — register.sh
          </span>
          <div style={{ width: 48 }} />
        </div>

        {/* Terminal body */}
        <div style={{ padding: 24, background: '#080808' }}>

          {/* Prompt header */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.5 }}>$</span>
              <span style={{
                fontFamily: 'var(--font-fira-code), monospace', fontSize: 14, fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#00ff41', textShadow: '0 0 8px rgba(0,255,65,0.5)',
              }}>
                init_workspace
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.4, marginLeft: 16, marginTop: 4 }}>
              # Provision a new PhishForge organization
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Name + Org — two columns */}
            <div className="auth-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field id="full_name" label="--name" icon={User}
                value={form.full_name} onChange={update('full_name')}
                placeholder="Jane Smith" required>
                <User size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#00ff41', opacity: 0.3, pointerEvents: 'none' }} />
              </Field>
              <Field id="org" label="--org" icon={Building2}
                value={form.organization_name} onChange={update('organization_name')}
                placeholder="Acme Corp" required>
                <Building2 size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#00ff41', opacity: 0.3, pointerEvents: 'none' }} />
              </Field>
            </div>

            <Field id="email" label="--email" icon={Mail} type="email"
              value={form.email} onChange={update('email')}
              placeholder="operator@company.com" required>
              <Mail size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#00ff41', opacity: 0.3, pointerEvents: 'none' }} />
            </Field>

            {/* Password with strength meter */}
            <div>
              <label htmlFor="password" style={labelStyle}>
                <Lock size={12} /> --password
              </label>
              <div style={{ position: 'relative' }}>
                <PasswordField
                  value={form.password}
                  onChange={update('password')}
                  show={showPassword}
                  onToggle={() => setShowPassword(s => !s)}
                />
              </div>
              {form.password && (
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 2, borderRadius: 1,
                        background: i <= strength ? strengthColor : 'rgba(0,255,65,0.1)',
                        boxShadow: i <= strength ? `0 0 4px ${strengthColor}` : 'none',
                        transition: 'background 200ms, box-shadow 200ms',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: strengthColor, opacity: 0.7 }}>
                    # strength: {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 16px', marginTop: 4,
                background: loading ? 'rgba(0,255,65,0.12)' : '#00ff41',
                color: '#000',
                fontFamily: 'var(--font-fira-code), monospace',
                fontSize: 13, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                border: 'none', borderRadius: 2,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 20px rgba(0,255,65,0.3)',
                opacity: loading ? 0.6 : 1,
                transition: 'all 150ms',
              }}
            >
              {loading
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> initializing...</>
                : <><Check size={14} /> &gt; execute(register)</>}
            </button>
          </form>

          {/* Terms */}
          <p style={{
            textAlign: 'center', marginTop: 16,
            fontFamily: 'var(--font-fira-code), monospace', fontSize: 11,
            color: '#00ff41', opacity: 0.35,
          }}>
            # By registering you agree to our{' '}
            <Link href="/terms" style={{ color: '#00ff41', opacity: 1, textDecoration: 'underline', textUnderlineOffset: 2 }}>Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: '#00ff41', opacity: 1, textDecoration: 'underline', textUnderlineOffset: 2 }}>Privacy Policy</Link>
          </p>

          {/* Login link */}
          <p style={{
            textAlign: 'center', marginTop: 12,
            fontFamily: 'var(--font-fira-code), monospace', fontSize: 12,
            color: '#00ff41', opacity: 0.45,
          }}>
            {'# '}
            <Link href="/login" style={{ color: '#00ff41', opacity: 1, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              already_have_account() → login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function PasswordField({ value, onChange, show, onToggle }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean; onToggle: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <>
      <input
        id="password"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="Min. 8 characters"
        required minLength={8}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputBase, ...(focused ? inputFocus : {}) }}
      />
      <button
        type="button" onClick={onToggle}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          color: '#00ff41', opacity: 0.4, background: 'none', border: 'none',
          cursor: 'pointer', padding: 2,
        }}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </>
  );
}
