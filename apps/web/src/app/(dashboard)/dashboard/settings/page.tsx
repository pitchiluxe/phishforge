import { getSafeClient } from '@/lib/supabase/safe';
import { Header } from '@/components/layout/header';
import Link from 'next/link';
import { Brain, CreditCard, Users, Building2, ArrowRight } from 'lucide-react';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

const SETTING_SECTIONS = [
  { href: '/dashboard/settings/ai', icon: Brain, label: 'AI Provider & Models', description: 'Configure OpenRouter and Ollama, switch providers, manage local models' },
  { href: '/dashboard/settings/billing', icon: CreditCard, label: 'Billing & Plan', description: 'Manage subscription, view usage, upgrade or downgrade plan' },
  { href: '/dashboard/users', icon: Users, label: 'Team Members', description: 'Invite users, assign roles, manage access control' },
];

export default async function SettingsPage() {
  const supabase = await getSafeClient();
  const org = supabase
    ? (await supabase.from('organizations').select('name,slug,plan,ai_provider,openrouter_model').single()).data
    : null;

  return (
    <div className="animate-in">
      <Header title="Settings" subtitle="Platform configuration and preferences" />
      <div style={{ padding: 24, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Org info */}
        <div style={{
          background: 'rgba(0,255,65,0.025)', border: '1px solid rgba(0,255,65,0.15)',
          borderRadius: 6, padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Building2 size={13} style={{ color: '#00ff41', opacity: 0.6 }} />
            <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              // Organization
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            {[
              ['name', org?.name ?? '—'],
              ['plan', org?.plan ?? 'free'],
              ['ai_provider', org?.ai_provider ?? '—'],
              ['model', org?.openrouter_model ?? '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.4 }}>{k}: </span>
                <span style={{ ...MONO, fontSize: 11, color: '#c8ffd4', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings links */}
        {SETTING_SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="settings-link" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(0,255,65,0.025)', border: '1px solid rgba(0,255,65,0.15)',
              borderRadius: 6, padding: '14px 18px', textDecoration: 'none',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 4, background: 'rgba(0,255,65,0.07)', border: '1px solid rgba(0,255,65,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color: '#00ff41', opacity: 0.8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...MONO, fontSize: 12, fontWeight: 600, color: '#c8ffd4', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#00ff41', opacity: 0.45 }}>{s.description}</div>
              </div>
              <ArrowRight size={13} style={{ color: '#00ff41', opacity: 0.3, flexShrink: 0 }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
