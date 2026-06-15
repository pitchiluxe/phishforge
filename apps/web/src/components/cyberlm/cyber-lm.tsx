'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Send, Loader2, Copy, Check, ChevronDown, ChevronUp,
  RotateCcw, Zap, FileText, Activity, Search, Lock, List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { addTokenUsage } from '@/hooks/use-ai-usage';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;
const G = '#00ff41';

interface Scenario {
  label: string;
  icon: string;
  incidentType: string;
  severity: string;
  description: string;
  affectedSystems: string;
  iocs: string;
  color: string;
}

const QUICK_SCENARIOS: Scenario[] = [
  {
    label: 'LockBit Ransomware',
    icon: '🔒',
    incidentType: 'Ransomware Attack',
    severity: 'P1',
    description: 'LockBit 3.0 ransomware detected across 80+ Windows endpoints in the finance department. File shares encrypted with .lockbit extension. Ransom note demanding $750k BTC found on desktops. Domain controller logs show lateral movement starting 6 hours ago.',
    affectedSystems: '80 Windows workstations, 4 file servers, 2 domain controllers, finance ERP system',
    iocs: 'Encrypted ext: .lockbit, C2: 185.220.101.45, mutex: Global\\{BE4B0FAE-A484-4B7D-9C9E-D4C0CFB2E57A}, dropper hash: a3f1b0c2d4e5f6789abc',
    color: '#f87171',
  },
  {
    label: 'CFO Wire Fraud BEC',
    icon: '📧',
    incidentType: 'Business Email Compromise (BEC)',
    severity: 'P1',
    description: 'Finance team received an urgent email appearing to be from the CFO requesting an immediate $340,000 wire transfer to a new vendor account. Email domain is cfo@company-corp.com (legitimate is company.com). Two payments already processed before fraud was detected.',
    affectedSystems: 'Corporate email (O365), finance wire transfer system, accounts payable',
    iocs: 'Sender: cfo@company-corp.com, Reply-To: payments@fastmoney-transfer.biz, IP: 45.142.212.100, beneficiary account: GB29NWBK60161331926819',
    color: '#fb923c',
  },
  {
    label: 'Credential Phishing',
    icon: '🎣',
    incidentType: 'Phishing Campaign',
    severity: 'P2',
    description: 'Mass phishing campaign targeting 200 employees with fake Microsoft 365 login pages. 34 users clicked the link. 12 credentials confirmed stolen via attacker-controlled EvilProxy proxy. Threat actors now logging in from Ukrainian IPs using stolen SSO tokens.',
    affectedSystems: 'Microsoft 365 accounts, SharePoint, Teams, corporate email',
    iocs: 'Phishing domain: microsft-portal-login.com, EvilProxy C2: 91.108.4.0/22, accessed from UA IPs: 185.220.x.x range',
    color: '#fb923c',
  },
  {
    label: 'Supply Chain Compromise',
    icon: '⛓️',
    incidentType: 'Supply Chain Compromise',
    severity: 'P1',
    description: 'Trusted SaaS vendor notified us their signing infrastructure was compromised. A malicious DLL was distributed via their auto-update mechanism to all customers. Our endpoint tools detected suspicious network beaconing from the updated client process.',
    affectedSystems: '200+ endpoints running vendor software v4.2.1, internal network segmentation unclear',
    iocs: 'Malicious DLL: vendorclient_helper.dll (SHA256: e3b0c44298fc1c149), beaconing to: update-cdn.vendorname.io:443, process: VendorUpdate.exe',
    color: '#f87171',
  },
  {
    label: 'AWS S3 Data Exposure',
    icon: '☁️',
    incidentType: 'Unauthorized Cloud Access',
    severity: 'P2',
    description: 'AWS GuardDuty alert: S3 bucket containing PII of 50,000 customers was publicly accessible for 11 days. CloudTrail logs show external IP downloaded 2.3GB of data. Bucket contained customer names, SSNs, and payment data. GDPR 72-hour notification window may apply.',
    affectedSystems: 'AWS S3 bucket: prod-customer-data-2024, RDS PostgreSQL db, CloudFront CDN',
    iocs: 'Exfil IP: 203.0.113.42 (VPN provider), Bucket: prod-customer-data-2024, 2.3GB download at 2024-03-14T02:17:00Z',
    color: '#fb923c',
  },
  {
    label: 'APT Lateral Movement',
    icon: '🕵️',
    incidentType: 'APT Intrusion',
    severity: 'P1',
    description: 'SOC detected Cobalt Strike beacon traffic from a finance workstation to C2 infrastructure linked to APT29 (Cozy Bear). SIEM shows Mimikatz execution and Pass-the-Hash attacks across 3 subnets over the last 72 hours. Adversary appears to be staging for data exfiltration.',
    affectedSystems: 'Finance subnet (10.10.5.0/24), AD domain controllers, email servers, VPN concentrators',
    iocs: 'CS beacon: 195.123.246.138:443, tool hash: d8a9b3c1 (Mimikatz), PtH from host: FINWS-042, LSASS dump artifacts in C:\\Windows\\Temp',
    color: '#f87171',
  },
  {
    label: 'Insider Data Theft',
    icon: '👤',
    incidentType: 'Insider Threat',
    severity: 'P2',
    description: 'DLP system flagged a departing engineer uploading 4.7GB of proprietary source code to a personal GitHub account. The employee submitted resignation 3 days ago. Access logs show bulk downloads from internal Git repos, Confluence, and Jira over the past week.',
    affectedSystems: 'GitHub Enterprise, Confluence, Jira, internal GitLab, NAS file shares',
    iocs: 'User: john.doe@company.com, Personal GitHub: github.com/jd_personal, uploaded repos: internal-api, ml-pipeline, 4.7GB total, IP: home DSL 98.x.x.x',
    color: '#facc15',
  },
  {
    label: 'AD Privilege Escalation',
    icon: '⬆️',
    incidentType: 'Privilege Escalation',
    severity: 'P2',
    description: 'SIEM alert: standard user account added to Domain Admins group at 03:15 AM outside change window. No ticket in ITSM. Account then created 5 new admin accounts and disabled MFA for executive mailboxes. Suspect Zerologon (CVE-2020-1472) exploitation against legacy DC.',
    affectedSystems: 'Active Directory (DC: corp-dc-01, corp-dc-02), all Windows endpoints, Exchange On-Prem',
    iocs: 'Escalated account: svc_backup01, new DA accounts: admin1–admin5, CVE-2020-1472 indicators, DC logs show Netlogon service calls from 10.0.1.99',
    color: '#facc15',
  },
  {
    label: 'Malware — Agent Tesla',
    icon: '🐛',
    incidentType: 'Malware Infection',
    severity: 'P2',
    description: 'Endpoint detection found Agent Tesla keylogger and infostealer on 6 sales team laptops. Malware delivered via macro-enabled Excel attachment in shipping notification emails. Keylogger capturing credentials including VPN, Salesforce, and banking portal logins.',
    affectedSystems: '6 Windows laptops (sales team), corporate VPN, Salesforce CRM, email client',
    iocs: 'Sample hash: 7f4a8b2c91de3f56, C2: agentsvc.duckdns.org:8080, delivery: "Invoice_March2024.xlsm", persistence: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
    color: '#facc15',
  },
  {
    label: 'Okta SSO Breach',
    icon: '🔑',
    incidentType: 'Account Takeover',
    severity: 'P1',
    description: 'Okta notified us that our tenant admin account was accessed from an unrecognized IP in Eastern Europe. Threat actors exported user list, reset MFA for 3 executive accounts, and created a new admin backdoor account. All downstream SaaS apps are potentially compromised.',
    affectedSystems: 'Okta SSO (all 340 users affected), Google Workspace, Salesforce, Slack, AWS SSO, GitHub Org',
    iocs: 'Attacker IP: 77.83.36.x, Session ID: abc123, backdoor account: it.support@company-help.com, MFA bypass for: CEO, CTO, CISO accounts',
    color: '#f87171',
  },
];

const INCIDENT_TYPES = [
  'Ransomware Attack', 'Data Breach / Exfiltration', 'Business Email Compromise (BEC)',
  'Phishing Campaign', 'Malware Infection', 'Insider Threat', 'Account Takeover',
  'DDoS Attack', 'Supply Chain Compromise', 'APT Intrusion', 'SQL Injection',
  'Credential Stuffing', 'Privilege Escalation', 'Lateral Movement Detected',
  'Unauthorized Cloud Access', 'Physical Security Breach', 'Other',
];

const SEVERITY_LEVELS = [
  { id: 'P1', label: 'P1 — Critical', color: '#f87171', desc: 'Active breach, production down, data theft in progress' },
  { id: 'P2', label: 'P2 — High', color: '#fb923c', desc: 'Confirmed compromise, contained but not eradicated' },
  { id: 'P3', label: 'P3 — Medium', color: '#facc15', desc: 'Suspicious activity, potential compromise, under investigation' },
  { id: 'P4', label: 'P4 — Low', color: '#60a5fa', desc: 'Policy violation, low-impact security event, informational' },
];

const SECTION_ICONS: Record<string, React.ElementType> = {
  'Threat Assessment': Shield,
  'Immediate Actions': Zap,
  'Containment Steps': Lock,
  'Evidence to Preserve': FileText,
  'Escalation Path': AlertTriangle,
  'IOC Checklist': Search,
  'MITRE ATT&CK TTPs': Activity,
  'Documentation Template': List,
};

interface ParsedSection {
  title: string;
  content: string;
}

function parseResponse(text: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = text.split('\n');
  let current: ParsedSection | null = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { title: line.slice(3).trim(), content: '' };
    } else if (current) {
      current.content += line + '\n';
    }
  }
  if (current) sections.push(current);
  return sections.filter(s => s.content.trim());
}

function SectionCard({ section, defaultOpen }: { section: ParsedSection; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const Icon = SECTION_ICONS[section.title] ?? FileText;

  const copy = async () => {
    await navigator.clipboard.writeText(section.content.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lines = section.content.trim().split('\n');

  return (
    <div style={{
      border: '1px solid rgba(0,255,65,0.1)', borderRadius: 8,
      background: '#050505', overflow: 'hidden',
    }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={13} style={{ color: G }} />
        </div>
        <span style={{ ...MONO, fontSize: 12, fontWeight: 600, color: '#e2e8f0', flex: 1 }}>
          {section.title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); copy(); }}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: copied ? G : '#475569', borderRadius: 4, padding: '3px 6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, ...MONO, fontSize: 10,
            }}
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {open ? <ChevronUp size={14} style={{ color: '#475569' }} /> : <ChevronDown size={14} style={{ color: '#475569' }} />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(0,255,65,0.06)' }}>
              <div style={{ paddingTop: 12 }}>
                {lines.map((line, i) => {
                  if (!line.trim()) return <div key={i} style={{ height: 4 }} />;
                  if (line.startsWith('### ')) return <div key={i} style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#60a5fa', marginTop: 8, marginBottom: 2 }}>{line.slice(4)}</div>;
                  if (line.startsWith('- ') || line.startsWith('* ')) return (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: G, flexShrink: 0, ...MONO, fontSize: 12 }}>›</span>
                      <span style={{ ...MONO, fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>{line.slice(2)}</span>
                    </div>
                  );
                  if (/^\d+\./.test(line)) return (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: G, flexShrink: 0, ...MONO, fontSize: 11 }}>{line.match(/^\d+/)?.[0]}.</span>
                      <span style={{ ...MONO, fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>{line.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  );
                  if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginTop: 4 }}>{line.slice(2, -2)}</div>;
                  if (line.startsWith('`') && line.endsWith('`')) return <code key={i} style={{ ...MONO, fontSize: 10, background: 'rgba(0,255,65,0.07)', color: G, padding: '1px 5px', borderRadius: 3, display: 'inline-block' }}>{line.slice(1, -1)}</code>;
                  return <div key={i} style={{ ...MONO, fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>{line}</div>;
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CyberLM() {
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [affectedSystems, setAffectedSystems] = useState('');
  const [iocs, setIocs] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [sections, setSections] = useState<ParsedSection[]>([]);
  const [followUp, setFollowUp] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const applyScenario = (s: Scenario) => {
    setIncidentType(s.incidentType);
    setSeverity(s.severity);
    setDescription(s.description);
    setAffectedSystems(s.affectedSystems);
    setIocs(s.iocs);
    setActiveScenario(s.label);
    setResponse('');
    setSections([]);
    setMessages([]);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const canSubmit = incidentType && severity && description.length >= 20;

  const analyze = async (isFollowUp = false) => {
    if (loading) return;
    if (!isFollowUp && !canSubmit) return;

    setLoading(true);
    try {
      const newMessages = isFollowUp
        ? [...messages, { role: 'user', content: followUp }]
        : [];

      const res = await fetch('/api/cyberlm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentType,
          severity,
          description,
          affectedSystems,
          iocs,
          messages: newMessages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || `Server error ${res.status}`);
      const txt: string = data.message ?? '';
      if (!txt) throw new Error('Empty response from AI — check your API key in .env.local');
      if (data.tokensUsed) addTokenUsage('cyberlm', data.tokensUsed);
      setResponse(txt);
      setSections(parseResponse(txt));
      if (isFollowUp) {
        setMessages([...newMessages, { role: 'assistant', content: txt }]);
        setFollowUp('');
      } else {
        setMessages([
          { role: 'user', content: `Analyze: ${incidentType} (${severity})\n${description}` },
          { role: 'assistant', content: txt },
        ]);
      }
      setTimeout(() => responseRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      toast.error(msg, { style: { background: '#0a0a0a', color: '#f87171' } });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResponse('');
    setSections([]);
    setMessages([]);
    setFollowUp('');
    setIncidentType('');
    setSeverity('');
    setDescription('');
    setAffectedSystems('');
    setIocs('');
    setActiveScenario(null);
  };

  const sel = SEVERITY_LEVELS.find(s => s.id === severity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Quick Scenarios */}
      <div style={{ background: '#050505', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 10, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Zap size={13} style={{ color: G }} />
          <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color: G }}>Quick Scenarios</span>
          <span style={{ ...MONO, fontSize: 10, color: '#334155', marginLeft: 4 }}>— click to auto-fill the analyzer</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {QUICK_SCENARIOS.map((s) => {
            const active = activeScenario === s.label;
            return (
              <button
                key={s.label}
                onClick={() => applyScenario(s)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                  padding: '10px 12px', borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                  background: active ? `${s.color}12` : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${active ? s.color + '50' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: active ? `0 0 14px ${s.color}20` : 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(0,255,65,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <span style={{ ...MONO, fontSize: 10, fontWeight: 700, color: active ? s.color : '#94a3b8', flex: 1, lineHeight: 1.3 }}>
                    {s.label}
                  </span>
                  {active && (
                    <span style={{ ...MONO, fontSize: 8, background: s.color, color: '#000', borderRadius: 3, padding: '1px 4px', fontWeight: 700, flexShrink: 0 }}>
                      LOADED
                    </span>
                  )}
                </div>
                <span style={{
                  ...MONO, fontSize: 9,
                  color: s.color,
                  background: `${s.color}15`,
                  border: `1px solid ${s.color}30`,
                  borderRadius: 3, padding: '1px 6px',
                }}>
                  {s.severity === 'P1' ? 'P1 Critical' : s.severity === 'P2' ? 'P2 High' : 'P3 Medium'} · {s.incidentType.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Form */}
      <div ref={formRef} style={{
        background: '#050505', border: '1px solid rgba(0,255,65,0.1)',
        borderRadius: 10, padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={15} style={{ color: G }} />
          </div>
          <div>
            <div style={{ ...MONO, fontSize: 13, fontWeight: 700, color: G }}>CyberLM Incident Analyzer</div>
            <div style={{ ...MONO, fontSize: 10, color: '#475569' }}>AI-powered incident response copilot</div>
          </div>
          {response && (
            <button onClick={reset} style={{
              marginLeft: 'auto', ...MONO, fontSize: 10, color: '#475569',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 5, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <RotateCcw size={11} /> New Incident
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Incident Type */}
          <div>
            <label style={{ ...MONO, fontSize: 10, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Incident Type *
            </label>
            <select
              value={incidentType}
              onChange={e => setIncidentType(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: incidentType ? '#e2e8f0' : '#475569',
                ...MONO, fontSize: 11, outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Select type...</option>
              {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label style={{ ...MONO, fontSize: 10, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Severity *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {SEVERITY_LEVELS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSeverity(s.id)}
                  title={s.desc}
                  style={{
                    padding: '7px 8px', borderRadius: 5, cursor: 'pointer',
                    background: severity === s.id ? `${s.color}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${severity === s.id ? s.color + '50' : 'rgba(255,255,255,0.07)'}`,
                    color: severity === s.id ? s.color : '#475569',
                    ...MONO, fontSize: 10, fontWeight: severity === s.id ? 700 : 400,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {sel && (
          <div style={{ marginBottom: 12, padding: '6px 10px', background: `${sel.color}10`, border: `1px solid ${sel.color}30`, borderRadius: 5 }}>
            <span style={{ ...MONO, fontSize: 10, color: sel.color }}>{sel.desc}</span>
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ ...MONO, fontSize: 10, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Incident Description * (min 20 chars)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what happened, what was observed, when it started, and any initial findings..."
            rows={4}
            style={{
              width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${description.length >= 20 ? 'rgba(0,255,65,0.2)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 6, color: '#e2e8f0', ...MONO, fontSize: 11,
              outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ ...MONO, fontSize: 10, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Affected Systems
            </label>
            <input
              value={affectedSystems}
              onChange={e => setAffectedSystems(e.target.value)}
              placeholder="e.g. 40 Windows workstations, 3 file servers..."
              style={{
                width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#e2e8f0',
                ...MONO, fontSize: 11, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ ...MONO, fontSize: 10, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Observed IOCs
            </label>
            <input
              value={iocs}
              onChange={e => setIocs(e.target.value)}
              placeholder="IPs, domains, file hashes, mutex names..."
              style={{
                width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#e2e8f0',
                ...MONO, fontSize: 11, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <button
          onClick={() => analyze(false)}
          disabled={loading || !canSubmit}
          style={{
            width: '100%', padding: '12px 0',
            background: loading || !canSubmit ? 'rgba(0,255,65,0.06)' : G,
            border: `1px solid ${!canSubmit ? 'rgba(0,255,65,0.2)' : G}`,
            borderRadius: 7, cursor: loading || !canSubmit ? 'not-allowed' : 'pointer',
            color: loading || !canSubmit ? 'rgba(0,255,65,0.35)' : '#000',
            ...MONO, fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s',
          }}
        >
          {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing Incident...</> : <><Shield size={14} /> Analyze Incident</>}
        </button>
        {!canSubmit && !loading && (
          <div style={{ ...MONO, fontSize: 10, color: '#334155', marginTop: 6, textAlign: 'center' }}>
            {!incidentType ? '↑ Select an incident type' : !severity ? '↑ Select a severity level' : '↑ Description needs at least 20 characters'}
          </div>
        )}
      </div>

      {/* Response */}
      <AnimatePresence>
        {sections.length > 0 && (
          <motion.div ref={responseRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ ...MONO, fontSize: 11, color: G, opacity: 0.7 }}>// CyberLM Analysis</div>
              {sel && <span style={{ ...MONO, fontSize: 10, color: sel.color, background: `${sel.color}15`, border: `1px solid ${sel.color}30`, borderRadius: 4, padding: '2px 8px' }}>{sel.label}</span>}
              <span style={{ ...MONO, fontSize: 10, color: '#475569', marginLeft: 'auto' }}>{incidentType}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sections.map((s, i) => (
                <SectionCard key={s.title} section={s} defaultOpen={i < 2} />
              ))}
            </div>

            {/* Follow-up */}
            <div style={{ marginTop: 20, background: '#050505', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 8, padding: 16 }}>
              <div style={{ ...MONO, fontSize: 10, color: '#64748b', marginBottom: 8 }}>// Follow-up Question</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={followUp}
                  onChange={e => setFollowUp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && followUp.trim() && analyze(true)}
                  placeholder="Ask a follow-up about this incident..."
                  style={{
                    flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#e2e8f0',
                    ...MONO, fontSize: 11, outline: 'none',
                  }}
                />
                <button
                  onClick={() => analyze(true)}
                  disabled={loading || !followUp.trim()}
                  style={{
                    background: loading || !followUp.trim() ? 'rgba(0,255,65,0.08)' : G,
                    border: 'none', borderRadius: 6, padding: '8px 14px', cursor: loading || !followUp.trim() ? 'default' : 'pointer',
                    color: loading || !followUp.trim() ? 'rgba(0,255,65,0.4)' : '#000',
                    display: 'flex', alignItems: 'center', gap: 6, ...MONO, fontSize: 11, fontWeight: 600,
                  }}
                >
                  {loading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={12} />}
                  Ask
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
