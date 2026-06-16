'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, RotateCcw, Briefcase, Code2, Users, MessageSquare,
  ShieldCheck, Cloud, Globe, Server, FileCheck, ChevronRight, Star,
  TrendingUp, BookOpen, CheckCircle, XCircle, Award, Wand2, Sparkles,
  ChevronDown, ChevronUp, Play, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;
const IV_STORAGE_KEY = 'pf_interview_sessions';

interface IVMessage { role: 'interviewer' | 'candidate'; content: string; }

interface Assessment {
  scores: { knowledge: number; communication: number; problemSolving: number };
  verdict: string;
  strengths: string[];
  improvements: string[];
  resources: string[];
}

interface IVSession {
  id: string;
  role: string;
  interviewType: string;
  scores: Assessment['scores'];
  verdict: string;
  completedAt: string;
}

interface GeneratedQuestion {
  question: string;
  type: 'technical' | 'behavioral';
  difficulty: 'entry' | 'mid' | 'senior';
  category: string;
  tip: string;
}

function saveIVSession(session: IVSession) {
  try {
    const sessions: IVSession[] = JSON.parse(localStorage.getItem(IV_STORAGE_KEY) ?? '[]');
    sessions.unshift(session);
    localStorage.setItem(IV_STORAGE_KEY, JSON.stringify(sessions.slice(0, 20)));
  } catch {}
}

const ROLES = [
  { id: 'SOC Analyst',        icon: ShieldCheck, color: '#60a5fa', desc: 'Alert triage, SIEM, threat hunting, incident escalation' },
  { id: 'Penetration Tester', icon: Code2,       color: '#f87171', desc: 'Recon, exploitation, OWASP, CVEs, pentest reporting' },
  { id: 'Security Engineer',  icon: Server,      color: '#a78bfa', desc: 'Secure SDLC, DevSecOps, SAST/DAST, zero trust' },
  { id: 'Cloud Security',     icon: Cloud,       color: '#38bdf8', desc: 'IAM, CSPM, K8s security, cloud-native threats' },
  { id: 'Incident Responder', icon: Globe,       color: '#fb923c', desc: 'NIST IR lifecycle, forensics, ransomware response' },
  { id: 'GRC / Compliance',   icon: FileCheck,   color: '#4ade80', desc: 'GDPR, SOC2, ISO27001, risk assessment, audit prep' },
];

const INTERVIEW_TYPES = [
  { id: 'technical',  label: 'Technical',  icon: Code2,         desc: 'Deep technical questions specific to the role' },
  { id: 'behavioral', label: 'Behavioral', icon: Users,         desc: 'STAR-format situational and soft-skill questions' },
  { id: 'mixed',      label: 'Mixed',      icon: MessageSquare, desc: 'Combination of technical and behavioral questions' },
];

const VERDICT_STYLE: Record<string, { color: string; bg: string }> = {
  'exceptional hire':  { color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  'strong hire':       { color: '#00ff41', bg: 'rgba(0,255,65,0.08)' },
  'good candidate':    { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  'needs development': { color: '#fb923c', bg: 'rgba(251,146,60,0.08)' },
  'not ready':         { color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  entry:  '#00ff41',
  mid:    '#facc15',
  senior: '#f87171',
};

function ScoreCircle({ label, value }: { label: string; value: number }) {
  const color = value >= 8 ? '#00ff41' : value >= 6 ? '#facc15' : '#f87171';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 70, height: 70, borderRadius: '50%', border: `3px solid ${color}`, boxShadow: `0 0 16px ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', background: `${color}08` }}>
        <span style={{ ...MONO, fontSize: 22, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );
}

function QuestionCard({ q, index, onPractice }: { q: GeneratedQuestion; index: number; onPractice: (q: GeneratedQuestion) => void }) {
  const [tipOpen, setTipOpen] = useState(false);
  const dc = DIFFICULTY_COLOR[q.difficulty] ?? '#facc15';
  const typeColor = q.type === 'technical' ? '#60a5fa' : '#a78bfa';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ padding: '14px 16px', background: 'rgba(167,139,250,0.03)', border: '1px solid rgba(167,139,250,0.12)', borderRadius: 9, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {/* Badges */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ ...MONO, fontSize: 9, color: typeColor, background: `${typeColor}12`, border: `1px solid ${typeColor}30`, borderRadius: 3, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {q.type}
        </span>
        <span style={{ ...MONO, fontSize: 9, color: dc, background: `${dc}10`, border: `1px solid ${dc}25`, borderRadius: 3, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {q.difficulty}
        </span>
        <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.45, background: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 3, padding: '2px 7px' }}>
          {q.category}
        </span>
      </div>

      {/* Question text */}
      <p style={{ ...MONO, fontSize: 11, color: '#c8ffd4', lineHeight: 1.65, margin: 0 }}>
        {q.question}
      </p>

      {/* Tip toggle */}
      <button
        onClick={() => setTipOpen(o => !o)}
        style={{ ...MONO, fontSize: 10, color: '#facc15', background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.18)', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, alignSelf: 'flex-start', transition: 'all 150ms' }}
      >
        {tipOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        What a strong answer covers
      </button>

      {tipOpen && (
        <div style={{ padding: '10px 14px', background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.12)', borderRadius: 6, ...MONO, fontSize: 11, color: '#facc15', lineHeight: 1.65, opacity: 0.9 }}>
          {q.tip}
        </div>
      )}

      {/* Practice button */}
      <button
        onClick={() => onPractice(q)}
        style={{ ...MONO, fontSize: 10, fontWeight: 700, color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', transition: 'all 150ms' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; }}
      >
        <Play size={10} /> Practice This Question
      </button>
    </motion.div>
  );
}

export function InterviewSimulator() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [interviewType, setInterviewType] = useState<string | null>(null);
  const [phase, setPhase] = useState<'select' | 'active' | 'finished'>('select');
  const [messages, setMessages] = useState<IVMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [sessions, setSessions] = useState<IVSession[]>([]);

  // Question bank state
  const [questionBank, setQuestionBank] = useState<GeneratedQuestion[]>([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [bankRole, setBankRole] = useState<string | null>(null);
  const [bankType, setBankType] = useState<string>('mixed');

  const bottomRef = useRef<HTMLDivElement>(null);

  const questionCount = messages.filter(m => m.role === 'interviewer').length;
  const canFinish = questionCount >= 3;

  useEffect(() => {
    try { setSessions(JSON.parse(localStorage.getItem(IV_STORAGE_KEY) ?? '[]')); } catch {}
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function startInterview(seedQuestion?: string) {
    if (!selectedRole) { toast.error('Select a role first'); return; }
    const type = interviewType ?? 'mixed';
    setPhase('active');
    setMessages([]);
    setLoading(true);
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, interviewType: type, messages: [], mode: 'start', seedQuestion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([{ role: 'interviewer', content: data.message }]);
    } catch (e: any) {
      toast.error(e.message);
      setPhase('select');
    } finally { setLoading(false); }
  }

  async function practiceQuestion(q: GeneratedQuestion) {
    if (!selectedRole && !bankRole) { toast.error('Select a role to practice'); return; }
    const role = selectedRole ?? bankRole!;
    if (!selectedRole) setSelectedRole(role);
    if (!interviewType) setInterviewType(bankType);
    setPhase('active');
    setMessages([]);
    setLoading(true);
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, interviewType: interviewType ?? bankType, messages: [], mode: 'start', seedQuestion: q.question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([{ role: 'interviewer', content: data.message }]);
    } catch (e: any) {
      toast.error(e.message);
      setPhase('select');
    } finally { setLoading(false); }
  }

  async function generateQuestions() {
    const role = selectedRole ?? bankRole;
    if (!role) { toast.error('Select a role first'); return; }
    setBankRole(role);
    setGeneratingQuestions(true);
    setQuestionBank([]);
    try {
      const res = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, interviewType: bankType, count: 8 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!Array.isArray(data.questions) || data.questions.length === 0) throw new Error('No questions returned');
      setQuestionBank(data.questions);
    } catch (e: any) {
      toast.error(`Failed to generate questions: ${e.message}`);
    } finally { setGeneratingQuestions(false); }
  }

  async function sendAnswer() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages: IVMessage[] = [...messages, { role: 'candidate', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const apiMsgs = newMessages.map(m => ({ role: m.role === 'interviewer' ? 'assistant' : 'user', content: m.content }));
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, interviewType: interviewType ?? 'mixed', messages: apiMsgs, mode: 'chat' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [...prev, { role: 'interviewer', content: data.message }]);
      if (data.assessment) handleAssessment(data.assessment);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  }

  async function finalizeInterview() {
    setLoading(true);
    try {
      const apiMsgs = messages.map(m => ({ role: m.role === 'interviewer' ? 'assistant' : 'user', content: m.content }));
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, interviewType: interviewType ?? 'mixed', messages: apiMsgs, mode: 'finalize' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.message) setMessages(prev => [...prev, { role: 'interviewer', content: data.message }]);
      if (data.assessment) handleAssessment(data.assessment);
      else { toast.error('Could not generate assessment'); setPhase('finished'); }
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  }

  function handleAssessment(a: Assessment) {
    setAssessment(a);
    setPhase('finished');
    const session: IVSession = {
      id: `iv-${Date.now()}`,
      role: selectedRole!,
      interviewType: interviewType ?? 'mixed',
      scores: a.scores,
      verdict: a.verdict,
      completedAt: new Date().toISOString(),
    };
    saveIVSession(session);
    setSessions(prev => [session, ...prev]);
  }

  function reset() {
    setPhase('select');
    setSelectedRole(null);
    setInterviewType(null);
    setMessages([]);
    setAssessment(null);
    setInput('');
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAnswer(); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Session stats strip */}
      {sessions.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Interviews', value: sessions.length },
            { label: 'Avg Score', value: `${Math.round(sessions.reduce((s, x) => s + Math.round((x.scores.knowledge + x.scores.communication + x.scores.problemSolving) / 3), 0) / sessions.length)}/10` },
            { label: 'Best Verdict', value: sessions.find(s => s.verdict === 'exceptional hire') ? 'Exceptional' : sessions.find(s => s.verdict === 'strong hire') ? 'Strong Hire' : sessions[0]?.verdict ?? '—' },
          ].map(stat => (
            <div key={stat.label} style={{ padding: '12px 18px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 8, textAlign: 'center', minWidth: 100 }}>
              <div style={{ ...MONO, fontSize: 18, fontWeight: 700, color: '#00ff41' }}>{stat.value}</div>
              <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── Select phase ── */}
        {phase === 'select' && (
          <motion.div key="select" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* ── MOCK INTERVIEW SECTION ── */}
              <div style={{ padding: '16px 20px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Briefcase size={16} style={{ color: '#a78bfa' }} />
                  <div>
                    <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: '#a78bfa' }}>AI-Powered Mock Interviews</div>
                    <div style={{ ...MONO, fontSize: 10, color: '#a78bfa', opacity: 0.55, marginTop: 2 }}>Practice with a real hiring manager AI — get instant feedback and coaching on every answer</div>
                  </div>
                </div>
              </div>

              {/* Role selection */}
              <div>
                <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>// Step 1 — Select Target Role</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                  {ROLES.map(r => {
                    const Icon = r.icon;
                    const active = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => { setSelectedRole(r.id); setBankRole(r.id); }}
                        style={{ padding: '14px 16px', background: active ? `${r.color}10` : 'rgba(0,255,65,0.02)', border: `1px solid ${active ? r.color : 'rgba(0,255,65,0.1)'}`, borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms', boxShadow: active ? `0 0 12px ${r.color}25` : 'none' }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = `${r.color}50`; }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(0,255,65,0.1)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <Icon size={14} style={{ color: r.color }} />
                          <span style={{ ...MONO, fontSize: 12, fontWeight: 700, color: active ? r.color : '#c8ffd4' }}>{r.id}</span>
                        </div>
                        <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.4, lineHeight: 1.5 }}>{r.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interview type */}
              <div>
                <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>// Step 2 — Interview Type</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {INTERVIEW_TYPES.map(t => {
                    const Icon = t.icon;
                    const active = interviewType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { setInterviewType(t.id); setBankType(t.id); }}
                        style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, background: active ? 'rgba(0,255,65,0.08)' : 'transparent', border: `1px solid ${active ? '#00ff41' : 'rgba(0,255,65,0.15)'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 150ms' }}
                      >
                        <Icon size={13} style={{ color: active ? '#00ff41' : 'rgba(0,255,65,0.4)' }} />
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ ...MONO, fontSize: 11, fontWeight: active ? 700 : 400, color: active ? '#00ff41' : '#c8ffd4' }}>{t.label}</div>
                          <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, marginTop: 2 }}>{t.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start button */}
              <button
                onClick={() => startInterview()}
                disabled={!selectedRole || !interviewType}
                style={{ ...MONO, fontSize: 12, fontWeight: 700, padding: '14px 28px', background: selectedRole && interviewType ? '#00ff41' : 'rgba(0,255,65,0.08)', color: selectedRole && interviewType ? '#000' : 'rgba(0,255,65,0.3)', border: `1px solid ${selectedRole && interviewType ? '#00ff41' : 'rgba(0,255,65,0.15)'}`, borderRadius: 8, cursor: selectedRole && interviewType ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', transition: 'all 150ms' }}
              >
                <ChevronRight size={14} /> Start Mock Interview
              </button>

              {/* ── AI QUESTION BANK ── */}
              <div style={{ borderTop: '1px solid rgba(0,255,65,0.08)', paddingTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Wand2 size={16} style={{ color: '#a78bfa' }} />
                    <div>
                      <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: '#a78bfa' }}>
                        AI Question Bank
                        {questionBank.length > 0 && <span style={{ marginLeft: 8, fontSize: 9, opacity: 0.6 }}>({questionBank.length} questions · {bankRole})</span>}
                      </div>
                      <div style={{ ...MONO, fontSize: 10, color: '#a78bfa', opacity: 0.5, marginTop: 2 }}>
                        Generate real-world interview questions for your selected role — study, prep, or jump straight into practice
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    {/* Bank type filter (independent from mock interview type) */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(['technical', 'behavioral', 'mixed'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setBankType(t)}
                          style={{ ...MONO, fontSize: 9, padding: '4px 10px', background: bankType === t ? 'rgba(167,139,250,0.15)' : 'transparent', border: `1px solid ${bankType === t ? 'rgba(167,139,250,0.4)' : 'rgba(167,139,250,0.15)'}`, borderRadius: 4, cursor: 'pointer', color: '#a78bfa', opacity: bankType === t ? 1 : 0.45, textTransform: 'capitalize', transition: 'all 150ms' }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={generateQuestions}
                      disabled={generatingQuestions || (!selectedRole && !bankRole)}
                      style={{ ...MONO, fontSize: 11, fontWeight: 700, padding: '9px 18px', background: generatingQuestions ? 'rgba(167,139,250,0.08)' : 'rgba(167,139,250,0.12)', color: generatingQuestions ? 'rgba(167,139,250,0.5)' : '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 7, cursor: generatingQuestions || (!selectedRole && !bankRole) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 150ms' }}
                      onMouseEnter={e => { if (!generatingQuestions) e.currentTarget.style.background = 'rgba(167,139,250,0.2)'; }}
                      onMouseLeave={e => { if (!generatingQuestions) e.currentTarget.style.background = 'rgba(167,139,250,0.12)'; }}
                    >
                      {generatingQuestions
                        ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
                        : questionBank.length > 0
                        ? <><RefreshCw size={12} /> Regenerate</>
                        : <><Sparkles size={12} /> Generate Questions</>
                      }
                    </button>
                  </div>
                </div>

                {/* Questions grid */}
                {questionBank.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
                    {questionBank.map((q, i) => (
                      <QuestionCard key={i} q={q} index={i} onPractice={practiceQuestion} />
                    ))}
                  </div>
                )}

                {!questionBank.length && !generatingQuestions && (
                  <div style={{ padding: '28px 20px', textAlign: 'center', background: 'rgba(167,139,250,0.02)', border: '1px dashed rgba(167,139,250,0.15)', borderRadius: 10 }}>
                    <Sparkles size={24} style={{ color: '#a78bfa', opacity: 0.3, marginBottom: 10 }} />
                    <div style={{ ...MONO, fontSize: 11, color: '#a78bfa', opacity: 0.35 }}>
                      {selectedRole ? `Click "Generate Questions" to get AI questions for ${selectedRole}` : 'Select a role above, then generate questions'}
                    </div>
                  </div>
                )}

                {generatingQuestions && (
                  <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                    <Loader2 size={22} style={{ color: '#a78bfa', opacity: 0.5, animation: 'spin 1s linear infinite', marginBottom: 10 }} />
                    <div style={{ ...MONO, fontSize: 11, color: '#a78bfa', opacity: 0.4 }}>Generating real-world questions from current cybersecurity hiring data...</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Active interview ── */}
        {phase === 'active' && (
          <motion.div key="active" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Interview header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '12px 16px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 8 }}>
              <div>
                <div style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#00ff41' }}>{selectedRole} Interview</div>
                <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, marginTop: 2 }}>
                  {interviewType} · Jordan Mercer, Senior Security Manager · Q {questionCount}/6
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {canFinish && (
                  <button
                    onClick={finalizeInterview}
                    disabled={loading}
                    style={{ ...MONO, fontSize: 10, color: '#facc15', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
                  >
                    <Award size={11} style={{ display: 'inline', marginRight: 5 }} />Finish & Score
                  </button>
                )}
                <button
                  onClick={reset}
                  style={{ ...MONO, fontSize: 10, color: '#00ff41', background: 'transparent', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <RotateCcw size={10} /> Reset
                </button>
              </div>
            </div>

            {/* Message thread */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 300, maxHeight: 480, overflowY: 'auto', padding: '4px 2px', marginBottom: 16 }}>
              {messages.map((msg, i) => {
                const isInterviewer = msg.role === 'interviewer';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isInterviewer ? 'flex-start' : 'flex-end', gap: 4 }}>
                    <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {isInterviewer ? 'Jordan Mercer' : 'You'}
                    </div>
                    <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: 10, background: isInterviewer ? 'rgba(0,255,65,0.04)' : 'rgba(96,165,250,0.08)', border: `1px solid ${isInterviewer ? 'rgba(0,255,65,0.15)' : 'rgba(96,165,250,0.2)'}`, ...MONO, fontSize: 12, color: '#c8ffd4', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
                  <Loader2 size={13} style={{ color: '#00ff41', animation: 'spin 1s linear infinite' }} />
                  <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.5 }}>Jordan is reviewing your answer...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder="Type your answer... (Enter to send, Shift+Enter for newline)"
                rows={3}
                style={{ flex: 1, padding: '12px 14px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 8, ...MONO, fontSize: 12, color: '#c8ffd4', resize: 'vertical', lineHeight: 1.6, outline: 'none', caretColor: '#00ff41' }}
              />
              <button
                onClick={sendAnswer}
                disabled={!input.trim() || loading}
                style={{ padding: '12px 16px', background: input.trim() && !loading ? '#00ff41' : 'rgba(0,255,65,0.08)', border: 'none', borderRadius: 8, color: input.trim() && !loading ? '#000' : 'rgba(0,255,65,0.3)', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Assessment ── */}
        {phase === 'finished' && assessment && (
          <motion.div key="finished" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {(() => {
                const vs = VERDICT_STYLE[assessment.verdict] ?? VERDICT_STYLE['good candidate'];
                return (
                  <div style={{ padding: '20px 24px', background: vs.bg, border: `1px solid ${vs.color}40`, borderRadius: 10, textAlign: 'center', boxShadow: `0 0 20px ${vs.color}20` }}>
                    <div style={{ ...MONO, fontSize: 9, color: vs.color, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Interview Complete — {selectedRole}</div>
                    <div style={{ ...MONO, fontSize: 20, fontWeight: 700, color: vs.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{assessment.verdict}</div>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <ScoreCircle label="Knowledge" value={assessment.scores.knowledge} />
                <ScoreCircle label="Communication" value={assessment.scores.communication} />
                <ScoreCircle label="Problem Solving" value={assessment.scores.problemSolving} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: '16px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 8 }}>
                  <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    <CheckCircle size={11} style={{ display: 'inline', marginRight: 5 }} />Strengths
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {assessment.strengths.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Star size={10} style={{ color: '#00ff41', flexShrink: 0, marginTop: 2 }} />
                        <span style={{ ...MONO, fontSize: 11, color: '#c8ffd4', lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(248,113,113,0.03)', border: '1px solid rgba(248,113,113,0.12)', borderRadius: 8 }}>
                  <div style={{ ...MONO, fontSize: 10, color: '#f87171', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    <TrendingUp size={11} style={{ display: 'inline', marginRight: 5 }} />Areas to Improve
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {assessment.improvements.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <XCircle size={10} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />
                        <span style={{ ...MONO, fontSize: 11, color: '#c8ffd4', lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {assessment.resources?.length > 0 && (
                <div style={{ padding: '14px 16px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 8 }}>
                  <div style={{ ...MONO, fontSize: 10, color: '#a78bfa', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    <BookOpen size={11} style={{ display: 'inline', marginRight: 5 }} />Recommended Resources
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {assessment.resources.map((r, i) => (
                      <span key={i} style={{ ...MONO, fontSize: 10, color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 4, padding: '4px 10px' }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={reset}
                  style={{ ...MONO, fontSize: 11, fontWeight: 700, padding: '12px 24px', background: '#00ff41', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <RotateCcw size={13} /> New Interview
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'finished' && !assessment && (
          <motion.div key="no-assess" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ textAlign: 'center', padding: 40, ...MONO, fontSize: 12, color: '#00ff41', opacity: 0.4 }}>
              Interview data unavailable. <button onClick={reset} style={{ color: '#00ff41', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Start over</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
