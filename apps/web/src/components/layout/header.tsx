'use client';

import { Bell, Terminal, Menu, X, Shield, AlertTriangle, Trophy, Zap, BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDashboard } from './dashboard-context';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

interface Notification {
  id: string;
  type: 'threat' | 'campaign' | 'training' | 'system' | 'award';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'threat',
    title: 'New Threat Detected',
    body: 'QR phishing campaign targeting finance teams — 3 IOCs added to threat feed.',
    time: '2m ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'campaign',
    title: 'Campaign Complete',
    body: '"Q2 Finance Phish" delivered to 847 targets. Click rate: 12.4%.',
    time: '18m ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'award',
    title: 'Achievement Unlocked',
    body: 'Your team earned "Phish Resistant" — 0 clicks on last campaign.',
    time: '1h ago',
    read: false,
  },
  {
    id: 'n4',
    type: 'training',
    title: 'Training Milestone',
    body: '5 team members completed the "Ransomware Response" module.',
    time: '3h ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Knowledge Base Updated',
    body: 'AI generated 3 new cybersecurity articles. Visit Knowledge Base to read.',
    time: '5h ago',
    read: true,
  },
  {
    id: 'n6',
    type: 'threat',
    title: 'Threat Intel Alert',
    body: 'LockBit 4.0 variant active — updated detection signatures available.',
    time: '1d ago',
    read: true,
  },
];

const TYPE_CONFIG = {
  threat:   { icon: AlertTriangle, color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  campaign: { icon: Zap,           color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  training: { icon: BookOpen,      color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  system:   { icon: Shield,        color: '#00ff41', bg: 'rgba(0,255,65,0.1)' },
  award:    { icon: Trophy,        color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
};

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function Header({ title, subtitle, children }: HeaderProps) {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { openMobile } = useDashboard();

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    setMounted(true);
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 52, padding: '0 20px',
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(5,5,5,0.94)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,255,65,0.1)',
      flexShrink: 0,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <button
          onClick={openMobile}
          className="md:hidden"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)',
            color: '#00ff41', borderRadius: 4, padding: '4px 6px', cursor: 'pointer',
            flexShrink: 0,
          }}
          aria-label="Open navigation"
        >
          <Menu size={15} />
        </button>

        <Terminal size={14} style={{ color: '#00ff41', opacity: 0.35, flexShrink: 0 }} />

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.35 }}>
              ~/phishforge$
            </span>
            <h1 style={{
              ...MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#00ff41',
              textShadow: '0 0 8px rgba(0,255,65,0.4)',
              whiteSpace: 'nowrap',
            }}>
              {title}
            </h1>
          </div>
          {subtitle && (
            <p style={{ fontSize: 11, color: '#00ff41', opacity: 0.4, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {children}

        {mounted && (
          <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.35, letterSpacing: '0.05em' }}>
            {time}
          </span>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 8px', borderRadius: 3,
          border: '1px solid rgba(0,255,65,0.2)',
          background: 'rgba(0,255,65,0.04)',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#00ff41', boxShadow: '0 0 6px #00ff41',
            display: 'inline-block', animation: 'blink-dot 2s ease-in-out infinite',
          }} />
          <span style={{ ...MONO, fontSize: 9, color: '#00ff41', letterSpacing: '0.15em' }}>LIVE</span>
        </div>

        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button
            ref={bellRef}
            onClick={() => setNotifOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', padding: 6, borderRadius: 4,
              background: notifOpen ? 'rgba(0,255,65,0.1)' : 'transparent',
              border: notifOpen ? '1px solid rgba(0,255,65,0.25)' : '1px solid transparent',
              cursor: 'pointer',
              color: '#00ff41', opacity: notifOpen ? 1 : 0.6,
              transition: 'opacity 150ms, background 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; if (!notifOpen) e.currentTarget.style.background = 'rgba(0,255,65,0.07)'; }}
            onMouseLeave={e => { if (!notifOpen) { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'transparent'; } }}
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                minWidth: 14, height: 14, borderRadius: 7,
                background: '#f87171', color: '#fff',
                fontSize: 8, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px',
                fontFamily: 'var(--font-fira-code), monospace',
                boxShadow: '0 0 6px rgba(248,113,113,0.6)',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {notifOpen && (
            <div
              ref={panelRef}
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 360, maxHeight: 480,
                background: '#080808',
                border: '1px solid rgba(0,255,65,0.2)',
                borderRadius: 8,
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,65,0.06)',
                zIndex: 100,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Panel header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(0,255,65,0.1)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#00ff41' }}>NOTIFICATIONS</span>
                  {unread > 0 && (
                    <span style={{ ...MONO, fontSize: 9, color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 3, padding: '1px 5px' }}>
                      {unread} new
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotifOpen(false)}
                    style={{ display: 'flex', background: 'none', border: 'none', color: '#00ff41', opacity: 0.4, cursor: 'pointer', padding: 2 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.map((n, i) => {
                  const cfg = TYPE_CONFIG[n.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      style={{
                        display: 'flex', gap: 12, padding: '12px 16px',
                        borderBottom: i < notifications.length - 1 ? '1px solid rgba(0,255,65,0.06)' : 'none',
                        background: n.read ? 'transparent' : 'rgba(0,255,65,0.025)',
                        cursor: 'pointer',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,255,65,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(0,255,65,0.025)')}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 6, background: cfg.bg, border: `1px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Icon size={13} style={{ color: cfg.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                          <span style={{ ...MONO, fontSize: 10, fontWeight: 700, color: n.read ? 'rgba(200,255,212,0.6)' : '#c8ffd4' }}>
                            {n.title}
                          </span>
                          <span style={{ ...MONO, fontSize: 9, color: '#475569', flexShrink: 0 }}>{n.time}</span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-fira-sans), sans-serif', fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                          {n.body}
                        </p>
                      </div>
                      {!n.read && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 4px #f87171', flexShrink: 0, marginTop: 5 }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(0,255,65,0.08)', flexShrink: 0 }}>
                <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.3 }}>
                  {notifications.length} total · click to mark read
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
