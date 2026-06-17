'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield, LayoutDashboard, Mail, FileText, BookOpen, BarChart3,
  Settings, Users, Brain, AlertTriangle, CreditCard, LogOut, ChevronLeft, X,
  GraduationCap, Target, Trophy, Cpu, BrainCircuit, Newspaper, Youtube, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from './dashboard-context';

const NAV_ITEMS = [
  { href: '/dashboard',               label: 'Overview',      icon: LayoutDashboard, exact: true },
  { href: '/dashboard/campaigns',     label: 'Campaigns',     icon: Mail },
  { href: '/dashboard/templates',     label: 'Templates',     icon: FileText },
  { href: '/dashboard/classroom',     label: 'Classroom',     icon: GraduationCap,  badge: 'NEW' as const },
  { href: '/dashboard/training',      label: 'AI Training',   icon: Target,          badge: 'HOT' as const },
  { href: '/dashboard/leaderboard',   label: 'Leaderboard',  icon: Trophy },
  { href: '/dashboard/cyberlm',       label: 'CyberLM',       icon: Cpu,             badge: 'HOT' as const },
  { href: '/dashboard/knowledge',     label: 'Knowledge Base',icon: BookOpen },
  { href: '/dashboard/threat-intel',  label: 'Threat Intel',  icon: AlertTriangle },
  { href: '/dashboard/analytics',     label: 'Analytics',     icon: BarChart3 },
  { href: '/dashboard/cybernews',     label: 'CyberNews',     icon: Newspaper,       badge: 'NEW' as const },
];

const BOTTOM_ITEMS = [
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/settings/ai', label: 'AI Models', icon: Brain },
  { href: '/dashboard/settings/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const ALL_ROUTES = [
  ...NAV_ITEMS.map(i => i.href),
  ...BOTTOM_ITEMS.map(i => i.href),
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { closeMobile, brainOpen, toggleBrain } = useDashboard();

  // Eagerly prefetch all dashboard routes on mount so first-click navigation
  // is instant. In dev mode this also triggers Turbopack/webpack compilation
  // in the background before the user clicks anything.
  useEffect(() => {
    const timer = setTimeout(() => {
      ALL_ROUTES.forEach(href => router.prefetch(href));
    }, 300); // slight delay so the current page renders first
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore — may fail in demo mode or if Supabase is not configured
    }
    // Clear demo cookie so middleware lets the login page load
    document.cookie = 'pf_demo=; path=/; max-age=0';
    router.push('/login');
  }

  return (
    <>
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: collapsed ? 56 : 224,
        minWidth: collapsed ? 56 : 224,
        background: '#030303',
        borderRight: '1px solid rgba(0,255,65,0.1)',
        boxShadow: '4px 0 20px rgba(0,255,65,0.04)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'width 280ms ease, min-width 280ms ease',
        flexShrink: 0,
      }}
    >
      {/* Vertical neon line accent */}
      <div className="absolute right-0 top-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,255,65,0.3) 30%, rgba(0,255,65,0.15) 70%, transparent)' }} />

      {/* Mobile close button — only on mobile */}
      <button
        onClick={closeMobile}
        className="md:hidden flex items-center"
        style={{
          position: 'absolute', top: 10, right: 10, zIndex: 10,
          background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)',
          color: '#00ff41', borderRadius: 4, padding: '4px 6px',
          cursor: 'pointer',
        }}
        aria-label="Close navigation"
      >
        <X size={14} />
      </button>

      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
        height: 52, padding: '0 10px',
        borderBottom: '1px solid rgba(0,255,65,0.1)',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Shield size={18} style={{ color: '#00ff41', filter: 'drop-shadow(0 0 6px rgba(0,255,65,0.7))', flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-fira-code), monospace',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.15em',
              color: '#00ff41', textShadow: '0 0 8px rgba(0,255,65,0.5)',
              textTransform: 'uppercase',
            }}>
              PhishForge
            </span>
          </Link>
        )}
        {collapsed && (
          <Shield size={18} style={{ color: '#00ff41', filter: 'drop-shadow(0 0 6px rgba(0,255,65,0.7))' }} />
        )}
        <button
          onClick={onToggle}
          className="md:flex hidden"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 4, borderRadius: 3, color: '#00ff41', opacity: 0.4,
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Section label */}
      {!collapsed && (
        <div style={{ padding: '14px 12px 6px' }}>
          <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00ff41', opacity: 0.35 }}>
            // Navigation
          </span>
        </div>
      )}

      {/* Primary nav */}
      <nav style={{ flex: 1, padding: '4px 8px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(item.href, 'exact' in item ? item.exact : undefined)} collapsed={collapsed} />
        ))}

        {/* CyberBrain — special button styled like a nav item */}
        <button
          onClick={toggleBrain}
          title="CyberBrain"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: collapsed ? '8px 0' : '7px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 4, width: '100%',
            background: brainOpen ? '#00ff41' : 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer', fontFamily: 'var(--font-fira-code), monospace',
            fontSize: 12, fontWeight: brainOpen ? 600 : 400,
            color: brainOpen ? '#000' : '#00ff41',
            opacity: 1,
            boxShadow: brainOpen ? '0 0 12px rgba(0,255,65,0.4)' : 'none',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            if (!brainOpen) {
              e.currentTarget.style.background = 'rgba(0,255,65,0.07)';
              e.currentTarget.style.color = '#00ff41';
            }
          }}
          onMouseLeave={e => {
            if (!brainOpen) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <BrainCircuit size={collapsed ? 16 : 14} style={{ flexShrink: 0, opacity: brainOpen ? 0.85 : 0.7 }} />
          {!collapsed && <span>CyberBrain</span>}
          {!collapsed && brainOpen && (
            <span style={{ marginLeft: 'auto', fontSize: 9, background: 'rgba(0,0,0,0.3)', color: '#000', borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>
              OPEN
            </span>
          )}
        </button>

        {/* Tube — cybersecurity YouTube, positioned after CyberBrain */}
        <NavItem
          item={{ href: '/dashboard/tube', label: 'Tube', icon: Youtube, badge: 'NEW' as const }}
          active={isActive('/dashboard/tube')}
          collapsed={collapsed}
        />

        {/* Mentorship — curated cybersecurity courses by skill level */}
        <NavItem
          item={{ href: '/dashboard/mentorship', label: 'Mentorship', icon: Sparkles, badge: 'NEW' as const }}
          active={isActive('/dashboard/mentorship')}
          collapsed={collapsed}
        />
      </nav>

      {/* Bottom nav */}
      <div style={{ padding: '0 8px 8px', borderTop: '1px solid rgba(0,255,65,0.1)', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {!collapsed && (
          <div style={{ padding: '12px 4px 6px' }}>
            <span style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00ff41', opacity: 0.35 }}>
              // System
            </span>
          </div>
        )}
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
        ))}
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-fira-code), monospace', fontSize: 12,
            color: '#00ff41', opacity: 0.4, borderRadius: 4,
            transition: 'opacity 150ms, color 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#ff6b6b'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.color = '#00ff41'; }}
        >
          <LogOut size={13} style={{ flexShrink: 0 }} />
          {!collapsed && <span>logout()</span>}
        </button>
      </div>
    </aside>
    </>
  );
}

function NavItem({
  item,
  active,
  collapsed,
}: {
  item: { href: string; label: string; icon: React.ElementType; badge?: 'NEW' | 'HOT' };
  active: boolean;
  collapsed?: boolean;
}) {
  const Icon = item.icon;
  const router = useRouter();
  const { closeMobile } = useDashboard();

  return (
    <Link
      href={item.href}
      prefetch={true}
      onClick={closeMobile}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: collapsed ? '8px 0' : '7px 10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 4,
        textDecoration: 'none',
        fontFamily: 'var(--font-fira-code), monospace',
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        color: active ? '#000' : '#00ff41',
        background: active ? '#00ff41' : 'transparent',
        boxShadow: active ? '0 0 12px rgba(0,255,65,0.4)' : 'none',
        transition: 'background 120ms, color 120ms, box-shadow 120ms',
        position: 'relative',
      }}
      onMouseEnter={e => {
        router.prefetch(item.href);
        if (!active) {
          e.currentTarget.style.background = 'rgba(0,255,65,0.07)';
          e.currentTarget.style.color = '#00ff41';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <Icon size={collapsed ? 16 : 14} style={{ flexShrink: 0, opacity: active ? 0.85 : 0.7 }} />
      {!collapsed && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {item.label}
          {item.badge === 'NEW' && (
            <span style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '0.05em',
              background: 'rgba(52,211,153,0.15)', color: '#34d399',
              border: '1px solid rgba(52,211,153,0.3)',
              padding: '1px 5px', borderRadius: 3,
            }}>
              NEW
            </span>
          )}
          {item.badge === 'HOT' && (
            <span style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '0.05em',
              color: '#f87171', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
              textShadow: '0 0 8px rgba(248,113,113,0.8)',
            }}>
              HOT
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
