'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Loader2, Check, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;
const G = '#00ff41';

const ROLES = [
  { value: 'analyst',  label: 'Analyst',  desc: 'Run simulations, view reports' },
  { value: 'manager',  label: 'Manager',  desc: 'Manage campaigns and users' },
  { value: 'admin',    label: 'Admin',    desc: 'Full access except billing' },
  { value: 'viewer',   label: 'Viewer',   desc: 'Read-only access' },
];

export function InviteUserModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('analyst');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInvite = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setSent(true);
      toast.success(`Invite sent to ${email}`, {
        style: { background: '#0a0a0a', color: G, border: '1px solid rgba(0,255,65,0.2)', fontFamily: 'var(--font-fira-code), monospace', fontSize: 12 },
      });
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setEmail('');
        setRole('analyst');
      }, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invite failed';
      toast.error(msg, { style: { background: '#0a0a0a', color: '#f87171' } });
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    if (loading) return;
    setOpen(false);
    setSent(false);
    setEmail('');
    setRole('analyst');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          ...MONO, fontSize: 11, fontWeight: 600, color: '#000', background: G,
          padding: '6px 14px', borderRadius: 3, border: 'none', cursor: 'pointer',
          boxShadow: '0 0 12px rgba(0,255,65,0.4)',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <UserPlus size={12} /> invite_user
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={close}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(3px)', zIndex: 100,
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 101, width: 420,
                background: '#080808',
                border: '1px solid rgba(0,255,65,0.2)',
                borderRadius: 10,
                boxShadow: '0 0 60px rgba(0,255,65,0.08), 0 24px 48px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px',
                borderBottom: '1px solid rgba(0,255,65,0.1)',
                background: 'rgba(0,255,65,0.03)',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7,
                  background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <UserPlus size={14} style={{ color: G }} />
                </div>
                <div>
                  <div style={{ ...MONO, fontSize: 13, fontWeight: 700, color: G }}>Invite Team Member</div>
                  <div style={{ ...MONO, fontSize: 10, color: '#475569' }}>Send an invite link via email</div>
                </div>
                <button
                  onClick={close}
                  style={{
                    marginLeft: 'auto', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5,
                    color: '#475569', padding: 6, cursor: 'pointer', display: 'flex',
                  }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: 24 }}>
                {/* Email */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ ...MONO, fontSize: 10, color: '#64748b', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Email address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleInvite()}
                      placeholder="colleague@company.com"
                      autoFocus
                      style={{
                        width: '100%', padding: '9px 10px 9px 30px',
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${valid ? 'rgba(0,255,65,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 6, color: '#e2e8f0',
                        ...MONO, fontSize: 12, outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.15s',
                      }}
                    />
                  </div>
                </div>

                {/* Role */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ ...MONO, fontSize: 10, color: '#64748b', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        style={{
                          padding: '9px 12px', borderRadius: 6, cursor: 'pointer',
                          textAlign: 'left', background: role === r.value ? 'rgba(0,255,65,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${role === r.value ? 'rgba(0,255,65,0.3)' : 'rgba(255,255,255,0.07)'}`,
                          transition: 'all 0.12s',
                        }}
                      >
                        <div style={{ ...MONO, fontSize: 11, fontWeight: 700, color: role === r.value ? G : '#94a3b8', marginBottom: 2 }}>
                          {r.label}
                        </div>
                        <div style={{ ...MONO, fontSize: 9, color: '#475569', lineHeight: 1.4 }}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={close}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 6, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#475569', ...MONO, fontSize: 12,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={!valid || loading || sent}
                    style={{
                      flex: 2, padding: '10px 0', borderRadius: 6,
                      cursor: !valid || loading || sent ? 'not-allowed' : 'pointer',
                      background: sent ? 'rgba(0,255,65,0.15)' : !valid ? 'rgba(0,255,65,0.06)' : G,
                      border: `1px solid ${!valid ? 'rgba(0,255,65,0.2)' : G}`,
                      color: sent ? G : !valid ? 'rgba(0,255,65,0.35)' : '#000',
                      ...MONO, fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      transition: 'all 0.15s',
                    }}
                  >
                    {sent
                      ? <><Check size={13} /> Invite Sent</>
                      : loading
                        ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                        : <><UserPlus size={13} /> Send Invite</>
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
