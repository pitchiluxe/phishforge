'use client';
import { useState } from 'react';
import {
  ChevronRight, Shield, Mail, Cpu, BrainCircuit, BookOpen, GraduationCap,
  Target, Trophy, AlertTriangle, CreditCard, Users, Zap, Building2,
  Activity, Lock, FileText, Search, ArrowRight, Check, BarChart3, Webhook,
} from 'lucide-react';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;
const SANS = { fontFamily: 'var(--font-fira-sans, system-ui), sans-serif' } as const;
const G = '#00ff41';

// ─── Re-usable visual components ──────────────────────────────

function Callout({ variant = 'info', children }: { variant?: 'info' | 'warn' | 'tip'; children: React.ReactNode }) {
  const map = {
    info: { color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.25)', label: 'INFO' },
    warn: { color: '#facc15', bg: 'rgba(250,204,21,0.07)', border: 'rgba(250,204,21,0.25)', label: 'NOTE' },
    tip:  { color: G,        bg: 'rgba(0,255,65,0.06)',   border: 'rgba(0,255,65,0.22)',    label: 'TIP' },
  };
  const c = map[variant];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.color}`, borderRadius: '0 6px 6px 0', padding: '12px 16px', marginBottom: 16 }}>
      <span style={{ ...MONO, fontSize: 9, fontWeight: 700, color: c.color, letterSpacing: '0.12em', marginRight: 8 }}>{c.label}</span>
      <span style={{ ...SANS, fontSize: 13, color: c.color, opacity: 0.85 }}>{children}</span>
    </div>
  );
}

function Code({ label = '$ terminal', children }: { label?: string; children: string }) {
  return (
    <div style={{ marginBottom: 20, border: '1px solid rgba(0,255,65,0.18)', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ background: 'rgba(0,255,65,0.06)', padding: '7px 16px', borderBottom: '1px solid rgba(0,255,65,0.1)', ...MONO, fontSize: 10, color: G, opacity: 0.55, letterSpacing: '0.1em' }}>
        {label}
      </div>
      <pre style={{ margin: 0, padding: '18px 22px', background: '#060606', overflowX: 'auto', ...MONO, fontSize: 12, lineHeight: 1.85, color: 'rgba(200,255,212,0.85)' }}>
        {children}
      </pre>
    </div>
  );
}

function FeatureGrid({ items }: { items: { icon: React.ElementType; title: string; desc: string; color?: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
      {items.map(({ icon: Icon, title, desc, color = G }) => (
        <div key={title} style={{ background: 'rgba(0,255,65,0.025)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 8, padding: '14px 14px 12px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Icon size={13} style={{ color }} />
          </div>
          <div style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#c8ffd4', marginBottom: 4 }}>{title}</div>
          <div style={{ ...SANS, fontSize: 12, color: 'rgba(200,255,212,0.55)', lineHeight: 1.5 }}>{desc}</div>
        </div>
      ))}
    </div>
  );
}

function Steps({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,255,65,0.12)', border: '1px solid rgba(0,255,65,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...MONO, fontSize: 11, fontWeight: 700, color: G, flexShrink: 0, zIndex: 1 }}>{i + 1}</div>
            {i < items.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(0,255,65,0.12)', minHeight: 20, marginTop: 2 }} />}
          </div>
          <div style={{ paddingBottom: 18 }}>
            <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: '#c8ffd4', marginBottom: 3, marginTop: 4 }}>{s.title}</div>
            <div style={{ ...SANS, fontSize: 13, color: 'rgba(200,255,212,0.6)', lineHeight: 1.6 }}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Diagram({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div style={{ marginBottom: 20, border: '1px solid rgba(0,255,65,0.15)', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ background: 'rgba(0,255,65,0.05)', padding: '7px 16px', borderBottom: '1px solid rgba(0,255,65,0.1)', ...MONO, fontSize: 10, color: G, opacity: 0.5 }}>
        // {title}
      </div>
      <pre style={{ margin: 0, padding: '16px 20px', background: '#050505', ...MONO, fontSize: 11, lineHeight: 1.9, color: 'rgba(200,255,212,0.7)', overflowX: 'auto' }}>
        {rows.join('\n')}
      </pre>
    </div>
  );
}

function IncidentFlow() {
  const steps = [
    { label: 'Select Incident Type', sub: '17 types · Ransomware → APT → BEC…', color: '#f87171' },
    { label: 'Set Severity', sub: 'P1 Critical → P4 Low', color: '#fb923c' },
    { label: 'Describe Incident', sub: 'Add IOCs + affected systems', color: '#facc15' },
    { label: 'Analyze', sub: 'AI generates 8-section IR plan', color: G },
    { label: 'Act + Follow-up', sub: 'Ask follow-up questions', color: '#60a5fa' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20, overflowX: 'auto', padding: '4px 0' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ textAlign: 'center', width: 120 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}15`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', ...MONO, fontSize: 13, fontWeight: 700, color: s.color }}>{i + 1}</div>
            <div style={{ ...MONO, fontSize: 10, fontWeight: 700, color: s.color, marginBottom: 2, lineHeight: 1.3 }}>{s.label}</div>
            <div style={{ ...SANS, fontSize: 10, color: 'rgba(200,255,212,0.45)', lineHeight: 1.3 }}>{s.sub}</div>
          </div>
          {i < steps.length - 1 && <ArrowRight size={14} style={{ color: 'rgba(0,255,65,0.25)', flexShrink: 0, margin: '0 2px', marginBottom: 24 }} />}
        </div>
      ))}
    </div>
  );
}

function PlanCompare() {
  const plans = [
    { name: 'Free', price: '$0', color: '#888', features: ['100 sims/month', '1 campaign', 'CyberLM (5/day)', 'Classroom (3 modules)', 'AI Training (5/month)', '50K tokens/month', '1 seat'] },
    { name: 'Pro', price: '$49', color: '#818cf8', features: ['5,000 sims/month', 'Unlimited campaigns', 'CyberLM (unlimited)', 'All classroom modules', 'Unlimited AI training', '5M tokens/month', '5 seats', 'REST API + SDKs', 'Knowledge Base (10GB)', 'Webhooks', 'Threat Intel (full)'] },
    { name: 'Enterprise', price: 'Custom', color: '#a78bfa', features: ['Unlimited everything', 'On-prem / VPC deploy', 'Custom AI fine-tuning', 'SSO (SAML 2.0 / OIDC)', 'Unlimited seats + RBAC', 'SIEM/SOAR integration', '99.9% SLA', 'GDPR / SOC 2 docs', 'Dedicated support engineer'] },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
      {plans.map(p => (
        <div key={p.name} style={{ background: 'rgba(0,255,65,0.02)', border: `1px solid ${p.color}30`, borderRadius: 8, padding: '14px 14px 12px' }}>
          <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: p.color, marginBottom: 2 }}>{p.name}</div>
          <div style={{ ...MONO, fontSize: 18, fontWeight: 700, color: p.color, marginBottom: 10 }}>{p.price}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {p.features.map(f => (
              <div key={f} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <Check size={10} style={{ color: p.color, flexShrink: 0, marginTop: 2 }} />
                <span style={{ ...SANS, fontSize: 11, color: 'rgba(200,255,212,0.65)', lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TokenMeter() {
  const features = [
    { label: 'CyberLM', color: '#60a5fa', pct: 38 },
    { label: 'CyberBrain', color: '#a78bfa', pct: 22 },
    { label: 'AI Training', color: '#fb923c', pct: 18 },
    { label: 'Classroom', color: '#facc15', pct: 12 },
    { label: 'Campaigns', color: G, pct: 10 },
  ];
  return (
    <div style={{ background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
      <div style={{ ...MONO, fontSize: 10, color: G, opacity: 0.45, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>// AI Token Usage — This Month</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map(f => (
          <div key={f.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ ...MONO, fontSize: 11, color: f.color }}>{f.label}</span>
              <span style={{ ...MONO, fontSize: 11, color: '#c8ffd4' }}>{f.pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${f.pct}%`, background: f.color, borderRadius: 2, boxShadow: `0 0 6px ${f.color}60`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section definitions ────────────────────────────────────

interface DocSection {
  id: string;
  label: string;
  group: string;
  render: () => React.ReactNode;
}

const SECTIONS: DocSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    group: 'Getting Started',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          <strong style={{ color: G }}>PhishForge</strong> is an AI-powered cybersecurity platform for authorized security awareness training. It combines AI email simulation, incident response assistance, interactive training, threat intelligence, and a full knowledge base — all in one terminal-aesthetic dashboard.
        </p>
        <FeatureGrid items={[
          { icon: Mail,          title: 'Campaigns',     desc: 'AI-generated phishing simulations tailored to industry and role', color: G },
          { icon: Cpu,           title: 'CyberLM',       desc: 'Incident response copilot with 17 incident types', color: '#60a5fa' },
          { icon: BrainCircuit,  title: 'CyberBrain',    desc: 'Docked AI assistant panel with knowledge import', color: '#a78bfa' },
          { icon: BookOpen,      title: 'Knowledge Base',desc: '14 built-in articles + RAG vector search (Pinecone)', color: '#34d399' },
          { icon: GraduationCap, title: 'Classroom',     desc: 'Security awareness modules with scoring', color: '#fb923c' },
          { icon: Target,        title: 'AI Training',   desc: 'Live phishing scenario simulations with AI feedback', color: '#f472b6' },
          { icon: Trophy,        title: 'Leaderboard',   desc: 'Gamified security awareness with per-team rankings', color: '#facc15' },
          { icon: AlertTriangle, title: 'Threat Intel',  desc: '15 live threats with MITRE ATT&CK mappings', color: '#f87171' },
          { icon: CreditCard,    title: 'Billing',       desc: 'Token-tracked usage, 3-tier plans, Stripe integration', color: '#818cf8' },
          { icon: Users,         title: 'Team Management',desc: 'Invite users, role-based access (Owner → Viewer)', color: '#38bdf8' },
        ]} />
        <Diagram title="platform architecture" rows={[
          '  ┌──────────────────────────────────────────────────────┐',
          '  │                   Next.js 15 Dashboard               │',
          '  │  Campaigns │ CyberLM │ CyberBrain │ Classroom │ ...  │',
          '  └──────────────────────┬───────────────────────────────┘',
          '                         │  Next.js API Routes',
          '          ┌──────────────┼──────────────┐',
          '          ▼              ▼              ▼',
          '   ┌─────────────┐ ┌──────────┐ ┌──────────────┐',
          '   │  OpenRouter │ │ Supabase │ │   Pinecone   │',
          '   │  (AI Layer) │ │ Postgres │ │  Vector DB   │',
          '   │  9 free     │ │   RLS    │ │  RAG / KB    │',
          '   │  fallbacks  │ │ per-org  │ │  per-tenant  │',
          '   └─────────────┘ └──────────┘ └──────────────┘',
        ]} />
      </>
    ),
  },
  {
    id: 'quickstart',
    label: 'Quickstart',
    group: 'Getting Started',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          Get PhishForge running locally in under 5 minutes.
        </p>
        <Steps items={[
          { title: 'Clone the repository', desc: 'git clone https://github.com/your-org/phishforge && cd phishforge' },
          { title: 'Copy environment template', desc: 'cp apps/web/.env.example apps/web/.env.local — then fill in your API keys' },
          { title: 'Add your OpenRouter key', desc: 'OPENROUTER_API_KEY=sk-or-v1-... — free tier works, all AI routes use free model fallbacks' },
          { title: 'Install dependencies', desc: 'npm install at the monorepo root — installs all workspace packages' },
          { title: 'Start the dev server', desc: 'npm run dev → http://localhost:3000 — login with demo credentials or connect Supabase' },
        ]} />
        <Code label="$ bash">
{`# Clone and enter the repo
git clone https://github.com/your-org/phishforge && cd phishforge

# Environment setup
cp apps/web/.env.example apps/web/.env.local

# Add minimum required keys to .env.local:
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_DEFAULT_MODEL=deepseek/deepseek-r1:free

# Install and run
npm install
npm run dev --workspace=apps/web
# → http://localhost:3000`}
        </Code>
        <Callout variant="tip">No Supabase required for demo mode. The app works with placeholder credentials — just add an OpenRouter key to try AI features immediately.</Callout>
      </>
    ),
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    group: 'Core Features',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          Campaigns are the core of PhishForge. Create a campaign, select your industry and target role, set difficulty, then let the AI generate a realistic phishing email complete with subject line, sender spoofing, HTML body, and safety score.
        </p>
        <FeatureGrid items={[
          { icon: Mail,    title: '5 Simulation Types',  desc: 'Credential harvest, malware, vishing, smishing, BEC', color: G },
          { icon: Shield,  title: 'Safety Scoring',      desc: 'AI scores 0–100 before delivery. Below 70 is blocked', color: '#60a5fa' },
          { icon: Webhook, title: 'Webhook Callbacks',   desc: 'POST delivery events to your endpoint (Pro+)', color: '#fb923c' },
          { icon: Zap,     title: 'Difficulty 1–5',      desc: 'Controls sophistication — from obvious to APT-grade', color: '#facc15' },
        ]} />
        <Code label="POST /api/campaigns/:id/generate">
{`// Request
{
  "industry": "finance",
  "target_role": "accountant",
  "simulation_type": "credential_harvest",
  "difficulty": 4,
  "context": "Q4 expense report deadline, using Concur"
}

// Response 200
{
  "template": {
    "id": "tpl-1718000000000",
    "subject": "Urgent: Q4 Expense Report — Action Required",
    "sender_name": "Sarah Chen (Finance)",
    "sender_email": "finance-noreply@concur-portal.co",
    "body_html": "<p>Dear {{employee_name}},...</p>",
    "safety_score": 88,
    "ai_generated": true
  }
}`}
        </Code>
        <Callout variant="warn">Safety score below 70 blocks the template from being sent. Adjust difficulty or context and regenerate.</Callout>
      </>
    ),
  },
  {
    id: 'cyberlm',
    label: 'CyberLM',
    group: 'AI Tools',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          <strong style={{ color: '#60a5fa' }}>CyberLM</strong> is an AI incident response copilot. Describe an active security incident and receive a structured 8-section analysis covering containment, forensics, MITRE ATT&CK mappings, escalation paths, and documentation templates — in seconds.
        </p>
        <IncidentFlow />
        <FeatureGrid items={[
          { icon: AlertTriangle, title: '17 Incident Types',  desc: 'Ransomware, BEC, APT, Data Breach, Supply Chain, Insider Threat, and more', color: '#f87171' },
          { icon: Shield,        title: '4 Severity Levels',  desc: 'P1 Critical → P4 Low with color-coded priority indicators', color: '#fb923c' },
          { icon: Zap,           title: '10 Quick Scenarios', desc: 'Click-to-fill preset scenarios: LockBit, Okta breach, CFO fraud, Agent Tesla…', color: '#facc15' },
          { icon: Activity,      title: 'MITRE ATT&CK',      desc: 'Every analysis maps to specific technique IDs (T1566.001, T1486, etc.)', color: '#60a5fa' },
          { icon: FileText,      title: '8-Section Report',  desc: 'Threat Assessment → Containment → Evidence → Escalation → IOC Checklist', color: G },
          { icon: Search,        title: 'Follow-up Q&A',     desc: 'Ask follow-up questions in context without re-entering the incident', color: '#a78bfa' },
        ]} />
        <Code label="POST /api/cyberlm">
{`// Request
{
  "incidentType": "Ransomware Attack",
  "severity": "P1",
  "description": "LockBit 3.0 detected on 80 Windows endpoints.
    File shares encrypted with .lockbit extension.
    Lateral movement started ~6 hours ago.",
  "affectedSystems": "80 workstations, 2 domain controllers",
  "iocs": "C2: 185.220.101.45, mutex: {BE4B0FAE-...}"
}

// Response 200
{
  "message": "## Threat Assessment\n...\n## Immediate Actions\n...",
  "tokensUsed": 1847,
  "model": "deepseek/deepseek-r1:free"
}`}
        </Code>
        <Callout variant="tip">Use the Quick Scenarios panel above the form to auto-fill real-world incident templates — LockBit, Okta SSO breach, CFO wire fraud, AWS S3 exposure, and 6 more.</Callout>
      </>
    ),
  },
  {
    id: 'cyberbrain',
    label: 'CyberBrain',
    group: 'AI Tools',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          <strong style={{ color: '#a78bfa' }}>CyberBrain</strong> is a persistent AI assistant panel docked to the right side of every dashboard page. Click the <em>CyberBrain</em> button in the sidebar nav to open it. It remembers your conversation context and can be detached as a floating window or minimized to a pill.
        </p>
        <Diagram title="panel modes" rows={[
          '  SIDEBAR BUTTON                                         ',
          '  [BrainCircuit] CyberBrain  ──onClick──►  ┌──────────┐',
          '                                            │  DOCKED  │',
          '                                            │  420px   │',
          '                                            │  right   │',
          '  ┌─── Drag header ──────────────────────┐  │  panel   │',
          '  │   DETACHED (floating window)         │  └──────────┘',
          '  │   Drag anywhere · resize · minimize  │             ',
          '  └──────────────────────────────────────┘             ',
          '                                    [●] Minimized pill  ',
        ]} />
        <FeatureGrid items={[
          { icon: BrainCircuit, title: 'Docked Panel',      desc: 'Fixed 420px right panel with spring slide-in animation', color: '#a78bfa' },
          { icon: Target,       title: 'Detachable',        desc: 'Drag header to float anywhere on screen as a window', color: '#818cf8' },
          { icon: BookOpen,     title: 'Knowledge Import',  desc: 'Import KB articles as context sources — cited in responses', color: '#34d399' },
          { icon: Activity,     title: 'Cybersecurity AI',  desc: 'Tuned for MITRE ATT&CK, CVEs, NIST, zero-day analysis', color: '#60a5fa' },
        ]} />
        <Code label="POST /api/brain">
{`// Request
{
  "messages": [
    { "role": "user", "content": "What is Pass-the-Hash and how do I detect it?" }
  ],
  "sources": [
    {
      "id": "mitre-attack",
      "title": "MITRE ATT&CK Framework",
      "summary": "Adversary tactics and techniques...",
      "keyTopics": ["lateral movement", "credential access"]
    }
  ]
}

// Response 200
{
  "message": "Pass-the-Hash (T1550.002) allows attackers...",
  "tokensUsed": 634,
  "model": "deepseek/deepseek-r1:free"
}`}
        </Code>
      </>
    ),
  },
  {
    id: 'knowledge',
    label: 'Knowledge Base',
    group: 'AI Tools',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          The Knowledge Base combines a built-in library of 14 curated cybersecurity articles with a Pinecone-backed RAG pipeline. Upload your own company documents (PDFs, DOCX, TXT) and the AI will reference them across CyberBrain, CyberLM, and campaign generation.
        </p>
        <Diagram title="rag pipeline" rows={[
          '  Upload Document (PDF / DOCX / TXT)',
          '         │',
          '         ▼',
          '  ┌─────────────────┐    embed     ┌──────────────┐',
          '  │  Text Chunking  │ ──────────► │   Pinecone   │',
          '  │  (overlapping   │   vectors    │  per-tenant  │',
          '  │   500-token     │              │  namespace   │',
          '  │   windows)      │              └──────┬───────┘',
          '  └─────────────────┘                     │',
          '                                          │  similarity search',
          '  User Query ──────────────────────────►  │',
          '                                          ▼',
          '                               Top-5 chunks → LLM context',
        ]} />
        <FeatureGrid items={[
          { icon: BookOpen,  title: '14 Built-in Articles', desc: 'Phishing, Ransomware, MITRE ATT&CK, OWASP, Zero Trust, IR, Cloud, SDLC', color: '#34d399' },
          { icon: Search,    title: 'Vector Search',        desc: 'Semantic search across all indexed documents via Pinecone', color: '#60a5fa' },
          { icon: FileText,  title: 'Upload Your Docs',     desc: 'PDF, DOCX, TXT — chunked, embedded, and indexed per tenant', color: '#fb923c' },
          { icon: Shield,    title: '12 Categories',        desc: 'Phishing, Malware, Cloud, Network, Compliance, SOC, and more', color: G },
        ]} />
        <Code label="POST /api/knowledge/upload">
{`// Multipart form upload
POST /api/knowledge/upload
Content-Type: multipart/form-data

form fields:
  file  = company-security-policy.pdf
  title = "InfoSec Policy 2026"
  type  = "policy"   // policy | procedure | training | other

// Response 200
{
  "documentId": "kb_1718000000000",
  "title": "InfoSec Policy 2026",
  "chunkCount": 22,
  "status": "indexed"
}`}
        </Code>
        <Callout variant="tip">Imported KB articles can be pinned as sources in CyberBrain. The AI will cite them specifically: "As covered in the NIST SP 800-61 guide…"</Callout>
      </>
    ),
  },
  {
    id: 'classroom',
    label: 'Classroom',
    group: 'Training',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          The <strong style={{ color: '#fb923c' }}>Classroom</strong> delivers structured security awareness modules to your team. Each module covers a threat category with theory, a live AI simulation, and a scored debrief. Free tier includes 3 modules; Pro unlocks all.
        </p>
        <FeatureGrid items={[
          { icon: GraduationCap, title: 'Phishing 101',      desc: 'Spot spoofed senders, urgency tactics, and malicious links', color: '#fb923c' },
          { icon: Mail,          title: 'BEC Detection',     desc: 'Identify CEO fraud, wire transfer scams, and impersonation', color: '#f87171' },
          { icon: Shield,        title: 'Password Security', desc: 'MFA, credential hygiene, and password manager usage', color: '#60a5fa' },
          { icon: Lock,          title: 'Ransomware Defense',desc: 'Safe browsing, backup verification, and IR basics', color: '#facc15' },
          { icon: AlertTriangle, title: 'Social Engineering',desc: 'Pretexting, vishing, and physical security attacks', color: '#a78bfa' },
          { icon: Activity,      title: 'Incident Reporting',desc: 'When and how to report suspicious activity correctly', color: G },
        ]} />
        <Diagram title="classroom flow" rows={[
          '  ┌──────────────┐   start   ┌──────────────────────┐',
          '  │   Module     │ ────────► │  Theory Section      │',
          '  │   Library   │           │  (slides + concepts) │',
          '  └──────────────┘           └──────────┬───────────┘',
          '                                         │  Next',
          '                             ┌───────────▼───────────┐',
          '                             │  Live AI Simulation   │',
          '                             │  (CyberForge-AI plays │',
          '                             │   the attacker role)  │',
          '                             └───────────┬───────────┘',
          '                                         │  Submit',
          '                             ┌───────────▼───────────┐',
          '                             │  Scored Debrief       │',
          '                             │  Detection / Response │',
          '                             │  Escalation / Docs    │',
          '                             └───────────────────────┘',
        ]} />
        <Code label="POST /api/classroom/simulation">
{`// Request — SIMULATE mode
{
  "mode": "simulate",
  "scenarioContext": "Phishing email pretending to be IT helpdesk",
  "messages": []
}

// Request — SCORE mode
{
  "mode": "score",
  "scenarioContext": "...",
  "messages": [ /* full conversation */ ]
}

// Score response
{
  "score": {
    "detection": 22,
    "response": 20,
    "escalation": 18,
    "documentation": 16,
    "total": 76,
    "feedback": "Good detection of spoofed sender..."
  }
}`}
        </Code>
      </>
    ),
  },
  {
    id: 'training',
    label: 'AI Training',
    group: 'Training',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          <strong style={{ color: '#f472b6' }}>AI Training</strong> puts employees in interactive phishing scenarios — the AI plays the attacker while the trainee responds. Each session is scored across 4 dimensions and feeds into the Leaderboard.
        </p>
        <FeatureGrid items={[
          { icon: Target,       title: 'CEO Fraud',       desc: 'Urgent wire transfer request from "CEO" burner account', color: '#f87171' },
          { icon: Mail,         title: 'IT Helpdesk Scam',desc: 'Fake MFA reset request via phone or email', color: '#fb923c' },
          { icon: Lock,         title: 'Credential Phish',desc: 'Cloned SSO login page with real-time credential relay', color: '#facc15' },
          { icon: AlertTriangle,'title': 'Vendor Invoice',  'desc': 'Modified bank details on legitimate-looking invoice PDF', color: '#f472b6' },
          { icon: BrainCircuit, title: 'AI Vishing',      desc: 'Voice phishing scenario with AI-played caller script', color: '#a78bfa' },
          { icon: Shield,       title: 'USB Drop',        desc: 'Social engineering via physical media found in parking lot', color: G },
        ]} />
        <Steps items={[
          { title: 'Select scenario', desc: 'Choose from 15+ attack scenarios organized by difficulty and type' },
          { title: 'AI starts the attack', desc: 'CyberForge-AI plays the attacker — realistic, adaptive, no hand-holding' },
          { title: 'Respond as you would in real life', desc: 'Type your response. The AI adapts based on your actions (good or bad)' },
          { title: 'Get scored', desc: 'Session scored on Detection (25), Response (25), Escalation (25), Awareness (25)' },
          { title: 'Leaderboard update', desc: 'Score is added to your profile and department leaderboard automatically' },
        ]} />
        <Callout variant="info">Free tier: 5 AI training sessions per month. Pro/Enterprise: unlimited sessions with custom scenario builder.</Callout>
      </>
    ),
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    group: 'Training',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          The <strong style={{ color: '#facc15' }}>Leaderboard</strong> gamifies security awareness across your organization. Employees earn points from classroom completions, AI training scores, and correctly reporting phishing simulations. Rankings update in real time.
        </p>
        <Diagram title="scoring system" rows={[
          '  ┌───────────────────────────────────────────────────┐',
          '  │  POINTS SYSTEM                                    │',
          '  │                                                   │',
          '  │  ✓ Classroom module completed     +50 pts        │',
          '  │  ✓ AI Training session (pass)     +100 pts       │',
          '  │  ✓ Phishing sim reported correctly +75 pts       │',
          '  │  ✓ Perfect detection score        +25 bonus      │',
          '  │  ✗ Phishing sim clicked            -25 pts       │',
          '  │  ✗ Credentials entered in sim     -50 pts       │',
          '  │                                                   │',
          '  │  Ranks: Novice → Defender → Analyst → Expert    │',
          '  └───────────────────────────────────────────────────┘',
        ]} />
        <FeatureGrid items={[
          { icon: Trophy,   title: 'Org-wide Rankings', desc: 'Global leaderboard across all employees and departments', color: '#facc15' },
          { icon: BarChart3, title: 'Department View',  desc: 'See which team has the highest/lowest security awareness', color: '#fb923c' },
          { icon: Shield,   title: 'Rank Badges',       desc: 'Novice / Defender / Analyst / Expert / Elite badges', color: '#60a5fa' },
          { icon: Target,   title: 'Monthly Resets',    desc: 'Monthly rankings reset — past achievements preserved', color: G },
        ]} />
      </>
    ),
  },
  {
    id: 'threat-intel',
    label: 'Threat Intel',
    group: 'Intelligence',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          The <strong style={{ color: '#f87171' }}>Threat Intel</strong> feed surfaces 15 curated, real-world threat campaigns with severity ratings, MITRE ATT&CK technique mappings, affected industries, and a one-click <em>Analyze in CyberLM</em> button that opens the incident analyzer with context pre-loaded.
        </p>
        <FeatureGrid items={[
          { icon: AlertTriangle, title: '15 Live Threats',   desc: 'LockBit, APT29, Volt Typhoon, Scattered Spider, and more', color: '#f87171' },
          { icon: Activity,     title: 'MITRE Mapping',     desc: 'Each threat maps to specific ATT&CK technique IDs', color: '#60a5fa' },
          { icon: Shield,       title: '5 Severity Tiers',  desc: 'Critical / High / Medium / Low / Info with color coding', color: '#fb923c' },
          { icon: Cpu,          title: 'CyberLM Link',      desc: '"Analyze in CyberLM" button opens IR copilot for each threat', color: '#a78bfa' },
        ]} />
        <Diagram title="sample threat entry" rows={[
          '  ┌─ CRITICAL ─────────────────────────────────────────┐',
          '  │ ⚠ LockBit 3.0 ransomware surge targeting          │',
          '  │   healthcare and finance sectors                   │',
          '  │                                                    │',
          '  │  LockBit operators exploiting Citrix Bleed        │',
          '  │  (CVE-2023-4966). Avg dwell time: 4 days before   │',
          '  │  encryption. Double extortion: exfil + encrypt.   │',
          '  │                                                    │',
          '  │  [CRITICAL] ransomware  MITRE: T1486, T1490, T1041│',
          '  │  #healthcare #finance          1 day ago           │',
          '  │                      [⚡ Analyze in CyberLM]      │',
          '  └────────────────────────────────────────────────────┘',
        ]} />
        <Callout variant="tip">Clicking "Analyze in CyberLM" navigates to the CyberLM tab. Select the matching Quick Scenario or fill in the incident form manually to generate a full IR plan for that threat.</Callout>
      </>
    ),
  },
  {
    id: 'billing',
    label: 'Billing & Plans',
    group: 'Administration',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          PhishForge offers three plans. All AI usage — across CyberLM, CyberBrain, AI Training, Classroom, and Campaign generation — is tracked as tokens and accumulated in the billing dashboard per feature per month.
        </p>
        <PlanCompare />
        <TokenMeter />
        <Diagram title="token tracking flow" rows={[
          '  User calls CyberLM / CyberBrain / Training / Campaign',
          '         │',
          '         ▼',
          '  AI Route (OpenRouter) ──► success with usage.total_tokens',
          '         │',
          '         ├── Returns { message, tokensUsed, model } to client',
          '         │',
          '         └── Fire-and-forget POST /api/usage/log',
          '                  │',
          '                  ├── Demo mode: no-op (client uses localStorage)',
          '                  └── Real Supabase: INSERT ai_token_usage',
          '                                     + increment_token_usage RPC',
          '',
          '  Client: addTokenUsage(feature, tokens) → localStorage',
          '          Billing panel reads via useAIUsage() hook',
        ]} />
        <Callout variant="info">Token budgets: Free = 50K/month. Pro = 5M/month. Enterprise = unlimited. Token counts are per-organization, not per-user.</Callout>
        <Code label="plan limits reference">
{`// Free  — $0/month
simulationsPerMonth:    100
aiTokensPerMonth:     50_000
seats:                     1
cyberLMPerDay:             5   // requests
aiTrainingPerMonth:        5
classroomModules:          3

// Pro   — $49/month
simulationsPerMonth:   5_000
aiTokensPerMonth:  5_000_000
seats:                     5
cyberLMPerDay:            -1   // unlimited
aiTrainingPerMonth:       -1
classroomModules:         -1
kbStorageGB:              10

// Enterprise — custom
simulationsPerMonth:      -1   // unlimited
aiTokensPerMonth:         -1
seats:                    -1
kbStorageGB:              -1`}
        </Code>
      </>
    ),
  },
  {
    id: 'users',
    label: 'Team Management',
    group: 'Administration',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          Invite team members via the Users page. Each invitation sends a magic link via Supabase Auth. Roles control what each user can see and do within the platform.
        </p>
        <Diagram title="role permissions" rows={[
          '  Role        Simulations  Campaigns  Users  Billing  Settings',
          '  ─────────────────────────────────────────────────────────────',
          '  Owner       ✓ full       ✓ full     ✓ full ✓ full   ✓ full',
          '  Admin       ✓ full       ✓ full     ✓      ✗        ✓',
          '  Manager     ✓ full       ✓ full     ✗      ✗        ✗',
          '  Analyst     ✓ run        ✓ view     ✗      ✗        ✗',
          '  Viewer      ✗ view-only  ✓ view     ✗      ✗        ✗',
        ]} />
        <Code label="POST /api/users/invite">
{`// Request
{
  "email": "colleague@company.com",
  "role": "analyst"   // owner | admin | manager | analyst | viewer
}

// Response 200 (demo mode)
{
  "ok": true,
  "demo": true,
  "message": "Demo: invite would be sent to colleague@company.com"
}

// Response 200 (real Supabase)
{
  "ok": true,
  "userId": "user_abc123"
  // Supabase sends magic link email automatically
}`}
        </Code>
        <Callout variant="warn">In demo mode (placeholder Supabase) invites are simulated — no email is actually sent. Connect a real Supabase project to enable live invitations.</Callout>
      </>
    ),
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    group: 'API',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          Supply a <code style={{ ...MONO, background: 'rgba(0,255,65,0.08)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>webhookUrl</code> in your generate request and PhishForge will POST delivery events as they occur. Verify the HMAC-SHA256 signature to ensure authenticity.
        </p>
        <FeatureGrid items={[
          { icon: Zap,      title: 'queued',   desc: 'Simulation template created and queued for delivery', color: '#60a5fa' },
          { icon: Mail,     title: 'sent',     desc: 'Email dispatched to target mailbox', color: G },
          { icon: Activity, title: 'opened',   desc: 'Tracking pixel fired — email was opened', color: '#facc15' },
          { icon: Target,   title: 'clicked',  desc: 'Tracking link was clicked by target', color: '#fb923c' },
          { icon: Shield,   title: 'reported', desc: 'Target reported the email as phishing — positive outcome', color: '#34d399' },
        ]} />
        <Code label="incoming webhook payload">
{`POST https://yourapp.com/webhook
X-PhishForge-Signature: sha256=abc123def456...
Content-Type: application/json

{
  "emailId": "em_abc123",
  "event": "clicked",
  "timestamp": "2026-06-15T14:23:11Z",
  "campaignId": "camp_xyz",
  "targetHash": "sha256:4c7d9e2f..."   // hashed, no raw PII
}

// Verify signature (Node.js)
import crypto from 'crypto';
const sig = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(rawBody).digest('hex');
const valid = sig === req.headers['x-phishforge-signature'].slice(7);`}
        </Code>
        <Callout variant="info">Webhook delivery has a {`WEBHOOK_TIMEOUT_MS`} timeout (default 5000ms). Failed deliveries are retried 3× with exponential backoff.</Callout>
      </>
    ),
  },
  {
    id: 'sdks',
    label: 'REST API & SDKs',
    group: 'API',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          PhishForge exposes a versioned REST API at <code style={{ ...MONO, background: 'rgba(0,255,65,0.08)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>/api/v1/</code> and provides official SDKs for Node.js, Python, and Go. All three expose the same logical interface.
        </p>
        <Diagram title="api endpoints" rows={[
          '  POST  /api/campaigns/:id/generate  — AI phishing simulation',
          '  POST  /api/cyberlm                 — incident analysis',
          '  POST  /api/brain                   — CyberBrain chat',
          '  POST  /api/knowledge/upload         — upload RAG document',
          '  GET   /api/knowledge/search         — vector similarity search',
          '  POST  /api/classroom/simulation     — training scenario',
          '  POST  /api/training                 — AI training session',
          '  POST  /api/users/invite             — invite team member',
          '  POST  /api/usage/log                — token usage logging',
          '  POST  /api/billing/checkout         — Stripe checkout session',
          '  POST  /api/billing/portal           — Stripe customer portal',
        ]} />
        <Code label="// Node.js SDK">
{`import { PhishForgeClient } from '@phishforge/sdk';

const pf = new PhishForgeClient({ apiKey: process.env.PHISHFORGE_API_KEY });

// Generate simulation
const sim = await pf.generate({
  industry: 'finance',
  targetRole: 'accountant',
  simulationType: 'credential_harvest',
  difficulty: 4,
});
console.log(sim.template.subject, sim.template.safetyScore);

// Analyze incident
const ir = await pf.analyzeIncident({
  incidentType: 'Ransomware Attack',
  severity: 'P1',
  description: 'LockBit detected on 80 endpoints...',
});`}
        </Code>
        <Code label="# Python SDK">
{`from phishforge import PhishForgeClient

pf = PhishForgeClient(api_key=os.environ["PHISHFORGE_API_KEY"])

# Generate simulation
sim = pf.generate(
    industry="finance",
    target_role="accountant",
    simulation_type="credential_harvest",
    difficulty=4,
)
print(sim.template.subject, sim.template.safety_score)`}
        </Code>
      </>
    ),
  },
  {
    id: 'gdpr',
    label: 'GDPR & Compliance',
    group: 'Security',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          PhishForge is designed to be privacy-first. No raw personal data is stored in audit logs. All tenant data is isolated via Supabase Row-Level Security. Enterprise plan includes SOC 2, ISO 27001, and GDPR documentation.
        </p>
        <FeatureGrid items={[
          { icon: Lock,     title: 'Hashed IDs Only',    desc: 'Audit logs store SHA-256 hashed emailIds — never raw addresses', color: G },
          { icon: Shield,   title: 'RLS Enforcement',    desc: 'Supabase Row-Level Security prevents any cross-tenant data access', color: '#60a5fa' },
          { icon: FileText, title: 'GDPR Deletion',      desc: 'Admin endpoint purges all Supabase rows + Pinecone vectors for an org', color: '#fb923c' },
          { icon: Activity, title: 'Auto-Purge Logs',    desc: 'Audit logs auto-deleted after GDPR_RETENTION_DAYS (default: 365)', color: '#a78bfa' },
          { icon: Building2,'title': 'On-prem Deploy',   desc: 'Enterprise: Docker image for air-gapped or VPC deployment', color: '#facc15' },
          { icon: Users,    title: 'SOC 2 / ISO 27001', desc: 'Enterprise compliance documentation and evidence packages', color: '#34d399' },
        ]} />
        <Code label="admin endpoints">
{`// GDPR data purge — removes ALL org data
DELETE /admin/delete-customer
Authorization: Bearer <admin-token>
{ "orgId": "org_xyz" }
// Deletes: campaigns, templates, users, audit_logs, vectors

// Data Subject Access Report
GET /admin/dsr?orgId=org_xyz
// Returns: all stored data fields for the org in JSON

// Retention policy (in .env.local)
GDPR_RETENTION_DAYS=365   // audit logs purged after this`}
        </Code>
        <Callout variant="warn">Attachment content is held in memory only — never written to disk or database. Base64 encoding is used for in-flight payload handling exclusively.</Callout>
      </>
    ),
  },
  {
    id: 'env',
    label: 'Environment Variables',
    group: 'Security',
    render: () => (
      <>
        <p style={{ ...SANS, fontSize: 14, color: 'rgba(200,255,212,0.75)', lineHeight: 1.85, marginBottom: 16 }}>
          All configuration is loaded from <code style={{ ...MONO, background: 'rgba(0,255,65,0.08)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>apps/web/.env.local</code>. Never hardcode credentials.
        </p>
        <Code label=".env.local — full reference">
{`# ── AI Provider — OpenRouter (required) ──────────────────
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=deepseek/deepseek-r1:free
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=PhishForge AI
DEFAULT_AI_PROVIDER=openrouter

# ── AI Provider — Ollama (optional local fallback) ───────
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.2

# ── Database — Supabase ──────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJ...           # service role key
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── Vector DB — Pinecone ─────────────────────────────────
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=phishforge-knowledge
PINECONE_ENVIRONMENT=us-east-1

# ── Auth ─────────────────────────────────────────────────
NEXTAUTH_SECRET=<random-32-char-hex>
NEXTAUTH_URL=http://localhost:3000

# ── Billing — Stripe ─────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# ── Rate Limiting ────────────────────────────────────────
RATE_LIMIT_GENERATE=30        # req/min per API key
RATE_LIMIT_VALIDATE=60
WEBHOOK_TIMEOUT_MS=5000
GDPR_RETENTION_DAYS=365

# ── Application ──────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_BILLING=false
NEXT_PUBLIC_ENABLE_OLLAMA=true`}
        </Code>
        <Callout variant="tip">Only OPENROUTER_API_KEY is required to use AI features in demo mode. All other variables have safe defaults or are optional.</Callout>
      </>
    ),
  },
];

// Group sections for sidebar
const GROUPS = [...new Set(SECTIONS.map(s => s.group))];

export default function DocsContent() {
  const [active, setActive] = useState('overview');
  const section = SECTIONS.find(s => s.id === active)!;
  const idx = SECTIONS.findIndex(s => s.id === active);

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .docs-nav-item { transition: all 120ms; }
        .docs-nav-item:hover { background: rgba(0,255,65,0.06) !important; color: #00ff41 !important; opacity: 1 !important; }
        pre::-webkit-scrollbar { height: 4px; width: 4px; }
        pre::-webkit-scrollbar-thumb { background: rgba(0,255,65,0.3); border-radius: 2px; }
        .doc-content { animation: fadeSlideUp 0.18s ease both; }
        @media (max-width: 768px) { .docs-sidebar { display: none !important; } }
      `}</style>

      <div style={{ paddingTop: 60, minHeight: '100vh', display: 'flex' }}>
        {/* Sidebar */}
        <div className="docs-sidebar" style={{
          width: 220, flexShrink: 0, position: 'sticky', top: 60,
          height: 'calc(100vh - 60px)', overflowY: 'auto',
          borderRight: '1px solid rgba(0,255,65,0.1)',
          padding: '24px 0 32px',
          background: 'rgba(0,0,0,0.25)',
        }}>
          <p style={{ ...MONO, fontSize: 10, color: G, opacity: 0.35, letterSpacing: '0.2em', padding: '0 16px', marginBottom: 16 }}>// DOCS</p>
          {GROUPS.map(group => (
            <div key={group} style={{ marginBottom: 8 }}>
              <div style={{ ...MONO, fontSize: 9, color: G, opacity: 0.3, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 16px 4px' }}>
                {group}
              </div>
              {SECTIONS.filter(s => s.group === group).map(s => (
                <button key={s.id} onClick={() => setActive(s.id)} className="docs-nav-item" style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 16px',
                  background: active === s.id ? 'rgba(0,255,65,0.08)' : 'transparent',
                  border: 'none',
                  borderLeft: active === s.id ? `2px solid ${G}` : '2px solid transparent',
                  cursor: 'pointer', textAlign: 'left',
                  ...MONO, fontSize: 12,
                  color: active === s.id ? G : 'rgba(0,255,65,0.45)',
                  opacity: active === s.id ? 1 : 0.85,
                }}>
                  {active === s.id && <ChevronRight size={10} style={{ flexShrink: 0 }} />}
                  {s.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, maxWidth: 860, padding: '36px 48px 80px', overflow: 'hidden' }}>
          <div key={active} className="doc-content">
            {/* Breadcrumb */}
            <div style={{ ...MONO, fontSize: 10, color: G, opacity: 0.35, marginBottom: 10 }}>
              {section.group} / {section.label}
            </div>

            {/* Title */}
            <h1 style={{ ...MONO, fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, color: G, marginBottom: 24, textShadow: '0 0 16px rgba(0,255,65,0.2)', lineHeight: 1.2 }}>
              {section.label}
            </h1>

            {/* Section body */}
            {section.render()}
          </div>

          {/* Prev / Next */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, borderTop: '1px solid rgba(0,255,65,0.1)', paddingTop: 24, gap: 12 }}>
            {idx > 0 ? (
              <button onClick={() => setActive(SECTIONS[idx - 1].id)} style={{
                background: 'transparent', border: '1px solid rgba(0,255,65,0.2)', color: G,
                ...MONO, fontSize: 12, padding: '8px 16px', borderRadius: 4, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                ← {SECTIONS[idx - 1].label}
              </button>
            ) : <div />}
            {idx < SECTIONS.length - 1 ? (
              <button onClick={() => setActive(SECTIONS[idx + 1].id)} style={{
                background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.25)', color: G,
                ...MONO, fontSize: 12, padding: '8px 16px', borderRadius: 4, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {SECTIONS[idx + 1].label} →
              </button>
            ) : <div />}
          </div>
        </div>
      </div>
    </>
  );
}
