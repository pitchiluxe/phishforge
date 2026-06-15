'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, RotateCcw, Shuffle, BookOpen, Terminal,
  Network, Shield, Cloud, Lock, Bug, Search, Database,
  Cpu, GitBranch, ChevronRight, Lightbulb, GraduationCap, Wand2, Sparkles, Brain,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { addTokenUsage } from '@/hooks/use-ai-usage';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;
const SANS = { fontFamily: 'var(--font-fira-sans, system-ui), sans-serif' } as const;

export interface LabTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMin: number;
  xpReward: number;
  icon: React.ElementType;
  color: string;
  tags: string[];
}

const DIFFICULTY_STYLE = {
  beginner:     { color: '#00ff41', bg: 'rgba(0,255,65,0.08)',     border: 'rgba(0,255,65,0.25)' },
  intermediate: { color: '#facc15', bg: 'rgba(250,204,21,0.08)',   border: 'rgba(250,204,21,0.25)' },
  advanced:     { color: '#f87171', bg: 'rgba(248,113,113,0.08)',  border: 'rgba(248,113,113,0.25)' },
};

export const LAB_TOPICS: LabTopic[] = [
  {
    id: 'wireshark-analysis',
    title: 'Wireshark Packet Analysis',
    description: 'Analyze a suspicious PCAP capture. Identify malicious traffic, extract IOCs, and determine the attack type.',
    category: 'Network Security',
    difficulty: 'intermediate',
    estimatedMin: 30,
    xpReward: 175,
    icon: Network,
    color: '#60a5fa',
    tags: ['Wireshark', 'PCAP', 'TCP/IP', 'IOC extraction'],
  },
  {
    id: 'linux-hardening',
    title: 'Linux Server Hardening',
    description: 'Audit and harden a freshly deployed Ubuntu server. Disable risky services, configure firewall, and enforce least-privilege.',
    category: 'Endpoint Security',
    difficulty: 'intermediate',
    estimatedMin: 35,
    xpReward: 200,
    icon: Terminal,
    color: '#00ff41',
    tags: ['Linux', 'UFW', 'SSH', 'CIS Benchmark'],
  },
  {
    id: 'siem-log-investigation',
    title: 'SIEM Log Investigation',
    description: 'Work through a batch of Splunk/Elastic alerts. Correlate events, identify the attack chain, and escalate correctly.',
    category: 'SOC / SIEM',
    difficulty: 'intermediate',
    estimatedMin: 40,
    xpReward: 200,
    icon: Database,
    color: '#a78bfa',
    tags: ['SIEM', 'Splunk', 'Log analysis', 'Kill chain'],
  },
  {
    id: 'phishing-forensics',
    title: 'Phishing Email Forensics',
    description: 'Deep-dive into a suspicious email: analyze headers, decode URLs, sandbox attachments, and produce an IOC report.',
    category: 'Phishing & Forensics',
    difficulty: 'beginner',
    estimatedMin: 25,
    xpReward: 140,
    icon: Search,
    color: '#34d399',
    tags: ['Email headers', 'URL analysis', 'OSINT', 'IOC report'],
  },
  {
    id: 'web-app-pentest',
    title: 'Web App Penetration Testing',
    description: 'Test a deliberately vulnerable web app for OWASP Top 10 flaws: SQLi, XSS, broken auth, IDOR, and more.',
    category: 'Web Security',
    difficulty: 'advanced',
    estimatedMin: 45,
    xpReward: 250,
    icon: Bug,
    color: '#f87171',
    tags: ['OWASP', 'SQLi', 'XSS', 'Burp Suite', 'IDOR'],
  },
  {
    id: 'active-directory-attacks',
    title: 'Active Directory Security',
    description: 'Explore AD attack techniques (Kerberoasting, Pass-the-Hash, Golden Ticket) and the detections that catch them.',
    category: 'Identity & Access',
    difficulty: 'advanced',
    estimatedMin: 50,
    xpReward: 275,
    icon: Lock,
    color: '#fb923c',
    tags: ['Active Directory', 'Kerberos', 'BloodHound', 'RBAC'],
  },
  {
    id: 'aws-cloud-audit',
    title: 'AWS Cloud Security Audit',
    description: 'Audit an AWS account for misconfigurations: exposed S3 buckets, overly permissive IAM, open security groups.',
    category: 'Cloud Security',
    difficulty: 'intermediate',
    estimatedMin: 40,
    xpReward: 225,
    icon: Cloud,
    color: '#38bdf8',
    tags: ['AWS', 'IAM', 'S3', 'Security Hub', 'CIS AWS'],
  },
  {
    id: 'malware-static-analysis',
    title: 'Malware Static Analysis',
    description: 'Analyze a suspicious binary without executing it: strings, imports, PE headers, and YARA rule creation.',
    category: 'Malware Analysis',
    difficulty: 'advanced',
    estimatedMin: 45,
    xpReward: 250,
    icon: Cpu,
    color: '#e879f9',
    tags: ['Malware', 'PE Analysis', 'Strings', 'YARA', 'VirusTotal'],
  },
  {
    id: 'threat-hunting',
    title: 'Threat Hunting with MITRE ATT&CK',
    description: 'Proactively hunt for APT29 TTPs in endpoint telemetry using MITRE ATT&CK as your hunting guide.',
    category: 'Threat Intelligence',
    difficulty: 'advanced',
    estimatedMin: 50,
    xpReward: 275,
    icon: Shield,
    color: '#facc15',
    tags: ['Threat hunting', 'MITRE ATT&CK', 'APT29', 'EDR'],
  },
  {
    id: 'devsecops-pipeline',
    title: 'DevSecOps Pipeline Security',
    description: 'Integrate SAST, SCA, secrets scanning, and container scanning into a CI/CD pipeline. Find the vulnerabilities.',
    category: 'DevSecOps',
    difficulty: 'intermediate',
    estimatedMin: 35,
    xpReward: 200,
    icon: GitBranch,
    color: '#4ade80',
    tags: ['DevSecOps', 'SAST', 'SCA', 'GitHub Actions', 'Trivy'],
  },
  {
    id: 'zero-trust-design',
    title: 'Zero Trust Network Design',
    description: 'Design a Zero Trust architecture for a hybrid organization: identity verification, micro-segmentation, and SASE.',
    category: 'Network Security',
    difficulty: 'advanced',
    estimatedMin: 45,
    xpReward: 250,
    icon: Network,
    color: '#818cf8',
    tags: ['Zero Trust', 'SASE', 'Micro-segmentation', 'NIST 800-207'],
  },
  {
    id: 'incident-response-tabletop',
    title: 'IR Tabletop Exercise',
    description: 'Run through a realistic ransomware tabletop exercise: containment decisions, stakeholder comms, and recovery.',
    category: 'Incident Response',
    difficulty: 'intermediate',
    estimatedMin: 40,
    xpReward: 225,
    icon: BookOpen,
    color: '#f472b6',
    tags: ['Incident Response', 'Ransomware', 'Tabletop', 'NIST SP 800-61'],
  },
];

const LAB_STORAGE_KEY = 'pf_lab_sessions';

interface LabMessage { role: 'instructor' | 'student'; content: string; }
interface LabSession { id: string; labId: string; labTitle: string; completedAt: string; }

function saveLabSession(session: LabSession) {
  try {
    const sessions: LabSession[] = JSON.parse(localStorage.getItem(LAB_STORAGE_KEY) ?? '[]');
    sessions.unshift(session);
    localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(sessions.slice(0, 20)));
  } catch {}
}

function HintBubble({ hint }: { hint: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ ...MONO, fontSize: 10, color: '#facc15', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 4, padding: '3px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <Lightbulb size={10} /> Hint
      </button>
      {open && (
        <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, background: '#111', border: '1px solid rgba(250,204,21,0.3)', borderRadius: 6, padding: '10px 14px', ...MONO, fontSize: 11, color: '#facc15', opacity: 0.9, lineHeight: 1.6, maxWidth: 320, zIndex: 50, whiteSpace: 'pre-wrap' }}>
          {hint}
        </div>
      )}
    </div>
  );
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  'Network Security': Network,
  'Endpoint Security': Shield,
  'Cloud Security': Cloud,
  'Malware Analysis': Bug,
  'Incident Response': BookOpen,
  'Web Security': Search,
  'Identity Security': Lock,
  'Forensics': Database,
  'Threat Hunting': Search,
  'Social Engineering': Brain,
  'SOC Operations': Cpu,
  'Reconnaissance': Network,
};

interface AILabTopic extends Omit<LabTopic, 'icon'> {
  icon: React.ElementType;
  isAI: boolean;
  scenario?: string;
  steps?: Array<{ id: number; title: string; instruction: string; hint: string; expectedOutput: string }>;
  objectives?: string[];
  tools?: string[];
}

export function LabSimulator() {
  const [selectedLab, setSelectedLab] = useState<LabTopic | null>(null);
  const [messages, setMessages] = useState<LabMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'select' | 'active' | 'complete'>('select');
  const [filter, setFilter] = useState<string>('All');
  const [sessions, setSessions] = useState<LabSession[]>([]);
  const [aiLabs, setAiLabs] = useState<AILabTopic[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setSessions(JSON.parse(localStorage.getItem(LAB_STORAGE_KEY) ?? '[]')); } catch {}
    generateAILab();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function generateAILab() {
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lab' }),
      });
      const data = await res.json();
      if (data.lab) {
        const lab = data.lab;
        const iconKey = Object.keys(CATEGORY_ICON_MAP).find(k => lab.category?.includes(k.split(' ')[0]));
        const aiLab: AILabTopic = {
          id: lab.id ?? `ai-lab-${Date.now()}`,
          title: lab.title,
          description: lab.description,
          category: lab.category ?? 'Security Lab',
          difficulty: lab.difficulty ?? 'intermediate',
          estimatedMin: lab.estimatedMin ?? 35,
          xpReward: lab.xpReward ?? 200,
          icon: iconKey ? CATEGORY_ICON_MAP[iconKey] : Terminal,
          color: lab.color ?? '#a78bfa',
          tags: lab.tags ?? [],
          isAI: true,
          scenario: lab.scenario,
          steps: lab.steps,
          objectives: lab.objectives,
          tools: lab.tools,
        };
        setAiLabs(prev => [aiLab, ...prev].slice(0, 5));
      }
    } catch {} finally {
      setGeneratingAI(false);
    }
  }

  const allLabs: (LabTopic | AILabTopic)[] = [...aiLabs, ...LAB_TOPICS];
  const categories = ['All', 'AI Generated', ...Array.from(new Set(LAB_TOPICS.map(l => l.category)))];
  const filtered = filter === 'All'
    ? allLabs
    : filter === 'AI Generated'
      ? aiLabs
      : allLabs.filter(l => l.category === filter);

  async function startLab(lab: LabTopic) {
    setSelectedLab(lab);
    setMessages([]);
    setPhase('active');
    setLoading(true);
    try {
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labId: lab.id, labTitle: lab.title, labDescription: lab.description, messages: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.tokensUsed) addTokenUsage('training', data.tokensUsed);
      setMessages([{ role: 'instructor', content: data.message }]);
    } catch (e: any) {
      toast.error(e.message);
      setPhase('select');
      setSelectedLab(null);
    } finally { setLoading(false); }
  }

  async function sendMessage() {
    if (!input.trim() || loading || !selectedLab) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages: LabMessage[] = [...messages, { role: 'student', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const apiMsgs = newMessages.map(m => ({
        role: m.role === 'instructor' ? 'assistant' : 'user',
        content: m.content,
      }));
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labId: selectedLab.id, labTitle: selectedLab.title, labDescription: selectedLab.description, messages: apiMsgs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.tokensUsed) addTokenUsage('training', data.tokensUsed);
      setMessages(prev => [...prev, { role: 'instructor', content: data.message }]);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  }

  function completeLab() {
    if (!selectedLab) return;
    const session: LabSession = { id: `lab-${Date.now()}`, labId: selectedLab.id, labTitle: selectedLab.title, completedAt: new Date().toISOString() };
    saveLabSession(session);
    setSessions(prev => [session, ...prev]);
    setPhase('complete');
  }

  function reset() {
    setPhase('select');
    setSelectedLab(null);
    setMessages([]);
    setInput('');
  }

  function pickRandom() {
    const random = LAB_TOPICS[Math.floor(Math.random() * LAB_TOPICS.length)];
    startLab(random);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <AnimatePresence mode="wait">

        {/* ── Lab selection ── */}
        {phase === 'select' && (
          <motion.div key="select" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Header + random pick */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>// Interactive Labs — AI Instructor</div>
                <p style={{ ...SANS, fontSize: 13, color: 'rgba(200,255,212,0.55)', lineHeight: 1.6, maxWidth: 560 }}>
                  Pick a lab and the AI instructor will guide you step-by-step through hands-on cybersecurity exercises with realistic tool outputs and real-world scenarios.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={generateAILab}
                  disabled={generatingAI}
                  style={{ ...MONO, fontSize: 11, fontWeight: 600, color: generatingAI ? '#a78bfa' : '#000', background: generatingAI ? 'rgba(167,139,250,0.12)' : '#a78bfa', border: 'none', borderRadius: 6, padding: '9px 16px', cursor: generatingAI ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, transition: 'all 150ms' }}
                >
                  {generatingAI ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Wand2 size={12} /> AI Lab</>}
                </button>
                <button
                  onClick={pickRandom}
                  style={{ ...MONO, fontSize: 11, fontWeight: 600, color: '#000', background: '#00ff41', border: 'none', borderRadius: 6, padding: '9px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, boxShadow: '0 0 14px rgba(0,255,65,0.4)' }}
                >
                  <Shuffle size={13} /> Random Lab
                </button>
              </div>
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    ...MONO, fontSize: 10, padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
                    background: filter === cat ? 'rgba(0,255,65,0.15)' : 'transparent',
                    border: filter === cat ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(0,255,65,0.12)',
                    color: filter === cat ? '#00ff41' : 'rgba(0,255,65,0.45)',
                    transition: 'all 120ms',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Lab grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filtered.map(lab => {
                const isAILab = !!(lab as AILabTopic).isAI;
                const Icon = lab.icon;
                const ds = DIFFICULTY_STYLE[lab.difficulty];
                const done = sessions.some(s => s.labId === lab.id);
                const borderBase = isAILab ? 'rgba(167,139,250,0.18)' : (done ? 'rgba(0,255,65,0.2)' : 'rgba(0,255,65,0.1)');
                const bgBase = isAILab ? 'rgba(167,139,250,0.04)' : (done ? 'rgba(0,255,65,0.03)' : 'rgba(0,255,65,0.015)');
                return (
                  <button
                    key={lab.id}
                    onClick={() => startLab(lab as LabTopic)}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 18px',
                      background: bgBase,
                      border: `1px solid ${borderBase}`,
                      borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isAILab ? 'rgba(167,139,250,0.09)' : 'rgba(0,255,65,0.06)'; e.currentTarget.style.borderColor = isAILab ? 'rgba(167,139,250,0.4)' : `${lab.color}50`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = bgBase; e.currentTarget.style.borderColor = borderBase; }}
                  >
                    {done && !isAILab && (
                      <div style={{ position: 'absolute', top: 10, right: 12, ...MONO, fontSize: 8, color: '#00ff41', background: 'rgba(0,255,65,0.12)', border: '1px solid rgba(0,255,65,0.25)', borderRadius: 3, padding: '2px 6px' }}>
                        DONE
                      </div>
                    )}
                    {isAILab && (
                      <div style={{ position: 'absolute', top: 10, right: 12, ...MONO, fontSize: 8, color: '#a78bfa', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 3, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Sparkles size={7} /> AI
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: `${lab.color}12`, border: `1px solid ${lab.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={15} style={{ color: lab.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#c8ffd4', lineHeight: 1.3 }}>{lab.title}</div>
                        <div style={{ ...MONO, fontSize: 9, color: isAILab ? '#a78bfa' : '#00ff41', opacity: 0.4, marginTop: 1 }}>{lab.category}</div>
                      </div>
                    </div>
                    <div style={{ ...SANS, fontSize: 11, color: 'rgba(200,255,212,0.55)', lineHeight: 1.6 }}>{lab.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {lab.tags.slice(0, 3).map(t => (
                          <span key={t} style={{ ...MONO, fontSize: 8, color: lab.color, background: `${lab.color}10`, border: `1px solid ${lab.color}20`, borderRadius: 3, padding: '1px 6px' }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35 }}>~{lab.estimatedMin}m</span>
                        <span style={{ ...MONO, fontSize: 8, color: ds.color, background: ds.bg, border: `1px solid ${ds.border}`, borderRadius: 3, padding: '2px 7px', textTransform: 'uppercase' }}>{lab.difficulty}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Recent lab sessions */}
            {sessions.length > 0 && (
              <div>
                <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>// Completed Labs</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {sessions.slice(0, 6).map(s => (
                    <div key={s.id} style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.55, background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 4, padding: '4px 10px' }}>
                      ✓ {s.labTitle}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Active lab ── */}
        {phase === 'active' && selectedLab && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Lab info bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: `${selectedLab.color}08`, border: `1px solid ${selectedLab.color}25`, borderRadius: 8 }}>
              <selectedLab.icon size={16} style={{ color: selectedLab.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#c8ffd4' }}>{selectedLab.title}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                  <span style={{ ...MONO, fontSize: 9, color: selectedLab.color, opacity: 0.7 }}>{selectedLab.category}</span>
                  <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35 }}>~{selectedLab.estimatedMin}min · +{selectedLab.xpReward} XP</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={completeLab}
                  disabled={messages.length < 2}
                  style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: messages.length >= 2 ? 0.8 : 0.25, background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 4, padding: '4px 10px', cursor: messages.length >= 2 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <GraduationCap size={10} /> Complete
                </button>
                <button onClick={reset} style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, background: 'none', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>
                  ✕ Exit
                </button>
              </div>
            </div>

            {/* Chat window */}
            <div style={{ background: '#050505', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 380, maxHeight: 540, overflowY: 'auto' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: m.role === 'student' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {m.role === 'instructor' && <GraduationCap size={10} style={{ color: selectedLab.color, opacity: 0.7 }} />}
                    <span style={{ ...MONO, fontSize: 8, color: m.role === 'instructor' ? selectedLab.color : '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {m.role === 'instructor' ? '// CyberLab Instructor' : '// You'}
                    </span>
                  </div>
                  <div style={{
                    ...MONO, fontSize: 12, lineHeight: 1.85, padding: '14px 18px', borderRadius: 8, maxWidth: '92%',
                    background: m.role === 'instructor' ? `${selectedLab.color}07` : 'rgba(0,255,65,0.06)',
                    border: `1px solid ${m.role === 'instructor' ? `${selectedLab.color}20` : 'rgba(0,255,65,0.18)'}`,
                    color: m.role === 'instructor' ? '#e2e8f0' : '#c8ffd4',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader2 size={12} style={{ color: selectedLab.color, animation: 'spin 1s linear infinite' }} />
                  <span style={{ ...MONO, fontSize: 10, color: selectedLab.color, opacity: 0.5 }}>Instructor is preparing next step...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type your answer or ask the instructor a question… (Enter to send)"
                  rows={3}
                  disabled={loading}
                  style={{
                    ...MONO, flex: 1, fontSize: 12, color: '#c8ffd4',
                    background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.18)',
                    borderRadius: 8, padding: '10px 14px', resize: 'none', outline: 'none',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = `${selectedLab.color}60`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.18)'; }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  style={{ padding: '0 18px', background: input.trim() && !loading ? selectedLab.color : 'rgba(0,255,65,0.06)', border: 'none', borderRadius: 8, cursor: input.trim() && !loading ? 'pointer' : 'default', color: input.trim() && !loading ? '#000' : '#00ff41', transition: 'all 150ms', flexShrink: 0 }}
                >
                  <Send size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <HintBubble hint={`Not sure how to proceed? Try:\n• Ask the instructor for clarification\n• Type "I need a hint" for a nudge\n• Type "show me an example" for a demo`} />
                <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.25 }}>{messages.filter(m => m.role === 'student').length} response{messages.filter(m => m.role === 'student').length !== 1 ? 's' : ''} submitted</span>
                <button
                  onClick={() => { setInput('I need a hint for this step.'); }}
                  style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.3, background: 'none', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}
                >
                  💡 Ask for hint
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Lab complete ── */}
        {phase === 'complete' && selectedLab && (
          <motion.div key="complete" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '32px 36px', background: `${selectedLab.color}08`, border: `1px solid ${selectedLab.color}30`, borderRadius: 12, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${selectedLab.color}12`, border: `3px solid ${selectedLab.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 0 24px ${selectedLab.color}40` }}>
                <GraduationCap size={28} style={{ color: selectedLab.color }} />
              </div>
              <div style={{ ...MONO, fontSize: 18, fontWeight: 700, color: selectedLab.color, marginBottom: 8 }}>Lab Complete!</div>
              <div style={{ ...SANS, fontSize: 13, color: 'rgba(200,255,212,0.6)', marginBottom: 6 }}>{selectedLab.title}</div>
              <div style={{ ...MONO, fontSize: 12, color: selectedLab.color, opacity: 0.7 }}>+{selectedLab.xpReward} XP earned</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => startLab(selectedLab)}
                style={{ ...MONO, flex: 1, fontSize: 11, fontWeight: 600, padding: '11px 18px', background: 'rgba(0,255,65,0.06)', color: '#00ff41', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <RotateCcw size={12} /> Redo Lab
              </button>
              <button
                onClick={reset}
                style={{ ...MONO, flex: 1, fontSize: 11, fontWeight: 600, padding: '11px 18px', background: '#00ff41', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <ChevronRight size={12} /> Pick Another Lab
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
