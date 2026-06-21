'use client';

import { useState } from 'react';
import { Check, X, Loader2, Zap, Building2, Shield, ArrowRight, Cpu, BrainCircuit, BookOpen, GraduationCap, Target, BarChart3, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAIUsage } from '@/hooks/use-ai-usage';
import { getPlanLimits, formatTokens } from '@/lib/plan';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

interface FeatureGroup {
  label: string;
  items: { text: string; included: boolean }[];
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  icon: React.ElementType;
  tagline: string;
  limit: number;
  groups: FeatureGroup[];
  cta: string;
  priceId: string | null | undefined;
  highlight: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    icon: Zap,
    tagline: 'Get started with AI phishing simulations',
    limit: 100,
    groups: [
      {
        label: 'Simulations & Campaigns',
        items: [
          { text: '100 simulations / month', included: true },
          { text: '1 active campaign', included: true },
          { text: 'Public email template library', included: true },
          { text: 'Safety scoring on all emails', included: true },
          { text: 'Unlimited active campaigns', included: false },
          { text: 'Custom email templates', included: false },
          { text: 'Webhook delivery callbacks', included: false },
        ],
      },
      {
        label: 'AI Features',
        items: [
          { text: 'CyberLM incident analyzer (5 req/day)', included: true },
          { text: 'CyberBrain AI assistant (limited)', included: true },
          { text: 'CyberLM full access (unlimited)', included: false },
          { text: 'CyberBrain with knowledge import', included: false },
          { text: 'Knowledge Base RAG (10 GB)', included: false },
          { text: 'Custom AI model selection', included: false },
        ],
      },
      {
        label: 'Training & Awareness',
        items: [
          { text: 'Classroom security training (3 modules)', included: true },
          { text: 'AI Training simulations (5/month)', included: true },
          { text: 'Leaderboard & gamification', included: true },
          { text: 'All classroom modules (unlimited)', included: false },
          { text: 'Unlimited AI training simulations', included: false },
          { text: 'Custom training scenarios', included: false },
        ],
      },
      {
        label: 'Analytics & Intel',
        items: [
          { text: 'Basic analytics dashboard', included: true },
          { text: 'Threat Intel feed (preview)', included: true },
          { text: 'Advanced analytics + CSV export', included: false },
          { text: 'Full Threat Intel feed + MITRE mapping', included: false },
        ],
      },
      {
        label: 'Team & Support',
        items: [
          { text: '1 user seat', included: true },
          { text: 'Community support', included: true },
          { text: 'Multi-user access (up to 5 seats)', included: false },
          { text: 'REST API + Node/Python/Go SDKs', included: false },
          { text: 'Priority email support', included: false },
        ],
      },
    ],
    cta: 'Current plan',
    priceId: null,
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: '/month',
    icon: Shield,
    tagline: 'For growing security teams',
    limit: 5000,
    groups: [
      {
        label: 'Simulations & Campaigns',
        items: [
          { text: '5,000 simulations / month', included: true },
          { text: 'Unlimited active campaigns', included: true },
          { text: 'Custom email templates (unlimited)', included: true },
          { text: 'Safety scoring on all emails', included: true },
          { text: 'Webhook delivery callbacks', included: true },
          { text: 'Attachment simulation support', included: true },
        ],
      },
      {
        label: 'AI Features',
        items: [
          { text: 'CyberLM incident analyzer (unlimited)', included: true },
          { text: 'CyberBrain AI assistant (unlimited)', included: true },
          { text: 'Knowledge Base RAG (10 GB storage)', included: true },
          { text: 'Custom AI model selection (OpenRouter)', included: true },
          { text: 'Pinecone vector search per tenant', included: true },
          { text: 'Custom AI fine-tuning', included: false },
        ],
      },
      {
        label: 'Training & Awareness',
        items: [
          { text: 'All classroom security modules', included: true },
          { text: 'Unlimited AI training simulations', included: true },
          { text: 'Leaderboard & gamification', included: true },
          { text: 'Custom training scenarios', included: true },
          { text: 'Per-employee performance tracking', included: true },
          { text: 'Training completion certificates', included: true },
        ],
      },
      {
        label: 'Analytics & Intel',
        items: [
          { text: 'Advanced analytics dashboard', included: true },
          { text: 'CSV / JSON data exports', included: true },
          { text: 'Full Threat Intel feed + MITRE mapping', included: true },
          { text: 'Campaign click & open tracking', included: true },
          { text: 'White-label reporting', included: false },
        ],
      },
      {
        label: 'Team & Support',
        items: [
          { text: 'Up to 5 user seats', included: true },
          { text: 'Full REST API access', included: true },
          { text: 'Node.js, Python & Go SDKs', included: true },
          { text: 'Priority email support (24h SLA)', included: true },
          { text: 'Unlimited seats + RBAC', included: false },
          { text: 'SSO (SAML 2.0 / OIDC)', included: false },
        ],
      },
    ],
    cta: 'Upgrade to Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'usage-based',
    icon: Building2,
    tagline: 'For organizations that need it all',
    limit: Infinity,
    groups: [
      {
        label: 'Simulations & Campaigns',
        items: [
          { text: 'Unlimited simulations / month', included: true },
          { text: 'Unlimited active campaigns', included: true },
          { text: 'Custom templates + white-label branding', included: true },
          { text: 'Full attachment simulation suite', included: true },
          { text: 'Webhook + SIEM integrations', included: true },
        ],
      },
      {
        label: 'AI Features',
        items: [
          { text: 'CyberLM + CyberBrain (unlimited)', included: true },
          { text: 'Unlimited RAG Knowledge Base storage', included: true },
          { text: 'Custom AI model fine-tuning', included: true },
          { text: 'Bring-your-own LLM (self-hosted)', included: true },
          { text: 'Dedicated Pinecone index per tenant', included: true },
        ],
      },
      {
        label: 'Training & Awareness',
        items: [
          { text: 'All classroom & AI training modules', included: true },
          { text: 'Custom training scenario builder', included: true },
          { text: 'Per-department leaderboards', included: true },
          { text: 'Compliance training tracks (HIPAA, PCI, GDPR)', included: true },
          { text: 'Training completion certificates + LMS export', included: true },
        ],
      },
      {
        label: 'Analytics & Intel',
        items: [
          { text: 'Full analytics + white-label reports', included: true },
          { text: 'Executive dashboard + board-ready PDF', included: true },
          { text: 'Real-time Threat Intel feed', included: true },
          { text: 'MITRE ATT&CK heatmaps', included: true },
          { text: 'SIEM/SOAR data push (Splunk, Sentinel)', included: true },
        ],
      },
      {
        label: 'Infrastructure & Compliance',
        items: [
          { text: 'Private deployment (on-prem / VPC)', included: true },
          { text: 'SSO (SAML 2.0 / OIDC)', included: true },
          { text: 'Unlimited seats + full RBAC', included: true },
          { text: '99.9% uptime SLA', included: true },
          { text: 'GDPR / SOC 2 / ISO 27001 compliance docs', included: true },
          { text: 'Dedicated support engineer + Slack channel', included: true },
          { text: 'Custom contract & invoicing', included: true },
        ],
      },
    ],
    cta: 'Contact Sales',
    priceId: null,
    highlight: false,
  },
];

interface BillingPanelProps {
  plan: string;
  used: number;
  limit: number;
  expiresAt?: string;
  hasSubscription: boolean;
}

const PLAN_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  free:       { color: '#888',    bg: 'rgba(136,136,136,0.08)', border: 'rgba(136,136,136,0.2)' },
  pro:        { color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.25)' },
  enterprise: { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' },
};

function UsageBar({ label, used, max, color = '#00ff41', icon: Icon }: {
  label: string; used: number; max: number; color?: string; icon?: React.ElementType;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((used / max) * 100));
  const barC = pct > 80 ? '#ff4444' : color;
  const isUnlimited = max <= 0;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={11} style={{ color, opacity: 0.7 }} />}
          <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.55 }}>{label}</span>
        </div>
        <span style={{ ...MONO, fontSize: 11, fontWeight: 600, color: '#c8ffd4' }}>
          {formatTokens(used)} / {isUnlimited ? '∞' : formatTokens(max)}
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(0,255,65,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2, width: isUnlimited ? '0%' : `${pct}%`,
          background: barC, boxShadow: `0 0 6px ${barC}60`, transition: 'width 600ms ease',
        }} />
      </div>
    </div>
  );
}

export function BillingPanel({ plan, used, limit, expiresAt, hasSubscription }: BillingPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { usage } = useAIUsage();
  const currentPlan = PLANS.find(p => p.id === plan) ?? PLANS[0];
  const planLimits = getPlanLimits(plan);
  const planColor = PLAN_COLORS[plan] ?? PLAN_COLORS.free;

  const simPct = limit <= 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const tokenMax = planLimits.aiTokensPerMonth;
  const tokenPct = tokenMax <= 0 ? 0 : Math.min(100, Math.round((usage.totalTokens / tokenMax) * 100));

  async function handleUpgrade(priceId: string | null | undefined, planId: string) {
    if (!priceId) {
      if (planId === 'enterprise') window.location.href = '/contact';
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: priceId, success_url: `${window.location.origin}/dashboard/settings/billing?success=1`, cancel_url: `${window.location.origin}/dashboard/settings/billing` }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error('Failed to start checkout');
      setLoading(null);
    }
  }

  async function handleManage() {
    setLoading('portal');
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ return_url: window.location.href }) });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error('Failed to open billing portal');
      setLoading(null);
    }
  }

  return (
    <div style={{ maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Active plan badge + manage */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        background: `${planColor.bg}`, border: `1px solid ${planColor.border}`,
        borderRadius: 8, padding: '16px 20px',
      }}>
        <div>
          <div style={{ ...MONO, fontSize: 10, color: planColor.color, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
            Active Plan
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ ...MONO, fontSize: 22, fontWeight: 700, color: planColor.color }}>
              {currentPlan.name}
            </span>
            <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color: planColor.color,
              background: planColor.bg, border: `1px solid ${planColor.border}`,
              borderRadius: 4, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {currentPlan.price}{plan !== 'enterprise' ? currentPlan.period : ''}
            </span>
            {plan !== 'free' && (
              <span style={{ ...MONO, fontSize: 9, color: '#00ff41', background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.25)', borderRadius: 3, padding: '2px 8px', fontWeight: 700 }}>
                ALL FEATURES ACTIVE
              </span>
            )}
          </div>
          <p style={{ ...MONO, fontSize: 11, color: planColor.color, opacity: 0.5, marginTop: 4 }}>{currentPlan.tagline}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          {hasSubscription && (
            <button onClick={handleManage} disabled={loading === 'portal'} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              ...MONO, fontSize: 11, color: planColor.color,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${planColor.border}`,
              borderRadius: 5, cursor: 'pointer', padding: '6px 12px',
            }}>
              {loading === 'portal' ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} />}
              Manage in Stripe
            </button>
          )}
          {expiresAt && (
            <span style={{ ...MONO, fontSize: 10, color: '#facc15', opacity: 0.7 }}>
              Expires: {new Date(expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Usage meters */}
      <div style={{ background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 8, padding: '18px 20px' }}>
        <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.45, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          // Usage this month — {usage.month}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px' }}>
          <UsageBar label="Simulations" used={used} max={planLimits.simulationsPerMonth} icon={Mail} />
          <UsageBar label="AI Tokens (total)" used={usage.totalTokens} max={planLimits.aiTokensPerMonth} color="#818cf8" />
          <UsageBar label="CyberLM" used={usage.breakdown.cyberlm} max={planLimits.aiTokensPerMonth > 0 ? Math.round(planLimits.aiTokensPerMonth * 0.4) : 0} icon={Cpu} color="#60a5fa" />
          <UsageBar label="CyberBrain" used={usage.breakdown.brain} max={planLimits.aiTokensPerMonth > 0 ? Math.round(planLimits.aiTokensPerMonth * 0.3) : 0} icon={BrainCircuit} color="#a78bfa" />
          <UsageBar label="AI Training" used={usage.breakdown.training} max={planLimits.aiTokensPerMonth > 0 ? Math.round(planLimits.aiTokensPerMonth * 0.15) : 0} icon={Target} color="#fb923c" />
          <UsageBar label="Classroom" used={usage.breakdown.classroom} max={planLimits.aiTokensPerMonth > 0 ? Math.round(planLimits.aiTokensPerMonth * 0.15) : 0} icon={GraduationCap} color="#facc15" />
        </div>
        {tokenPct > 80 && planLimits.aiTokensPerMonth > 0 && (
          <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 5 }}>
            <span style={{ ...MONO, fontSize: 10, color: '#f87171' }}>
              ⚠ You have used {tokenPct}% of your monthly AI token budget. {plan === 'free' ? 'Upgrade to Pro for 5M tokens/month.' : 'Consider upgrading to Enterprise for unlimited tokens.'}
            </span>
          </div>
        )}
      </div>

      {/* Active features for current plan */}
      <div style={{ background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 8, padding: '18px 20px' }}>
        <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.45, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
          // Features included in {currentPlan.name} plan
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {currentPlan.groups.map(g => (
            <div key={g.label}>
              <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, borderBottom: '1px solid rgba(0,255,65,0.06)', paddingBottom: 5 }}>
                {g.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {g.items.map(f => (
                  <div key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, opacity: f.included ? 1 : 0.3 }}>
                    {f.included
                      ? <Check size={11} style={{ color: '#00ff41', flexShrink: 0, marginTop: 2 }} />
                      : <X size={11} style={{ color: '#475569', flexShrink: 0, marginTop: 2 }} />
                    }
                    <span style={{ fontSize: 11, color: f.included ? '#94a3b8' : '#475569', lineHeight: 1.5 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
