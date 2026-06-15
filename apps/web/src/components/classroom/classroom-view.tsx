'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Zap, Award, ChevronRight, ChevronLeft, Lock, CheckCircle2,
  Play, FlaskConical, Brain, Star, Trophy, Send, Loader2, RotateCcw, X,
} from 'lucide-react';
import {
  ALL_COURSES, BADGES, XP_LEVELS, getTotalXP, getLevelForXP, getXPProgress,
  getCourseProgress, getCompletedModuleCount,
  STANDALONE_LABS, getLabCategories,
  type ClassroomProgress, type Course, type CourseModule, type StandaloneLab,
} from '@/lib/classroom';
import { FlaskConical as LabIcon, Tag, Search, Wand2, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// ── AI Course/Lab Generation ──────────────────────────────────────────────────
function AIGenerateBanner({
  onCourseGenerated,
  onLabGenerated,
  activeTab,
}: {
  onCourseGenerated: (course: Course) => void;
  onLabGenerated: (lab: StandaloneLab) => void;
  activeTab: string;
}) {
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    const type = activeTab === 'labs' ? 'lab' : 'course';
    try {
      const res = await fetch('/api/classroom/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (type === 'lab') {
        onLabGenerated(data.lab);
        toast.success('AI lab generated!', { style: { background: '#0a0a0a', color: '#00ff41', border: '1px solid rgba(0,255,65,0.2)' } });
      } else {
        onCourseGenerated(data.course);
        toast.success('AI course generated!', { style: { background: '#0a0a0a', color: '#00ff41', border: '1px solid rgba(0,255,65,0.2)' } });
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div style={{
      background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.2)',
      borderRadius: 10, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Wand2 size={15} style={{ color: '#a78bfa' }} />
        </div>
        <div>
          <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: '#a78bfa' }}>AI {activeTab === 'labs' ? 'Lab' : 'Course'} Generator</div>
          <div style={{ ...MONO, fontSize: 9, color: '#a78bfa', opacity: 0.6 }}>
            {activeTab === 'labs' ? 'Generate a unique hands-on lab with AI' : 'Generate a full course with lessons, labs & simulations'}
          </div>
        </div>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <button
          onClick={generate}
          disabled={generating}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: generating ? 'rgba(167,139,250,0.1)' : '#a78bfa',
            color: generating ? '#a78bfa' : '#000',
            border: 'none', borderRadius: 7, padding: '8px 20px',
            ...MONO, fontSize: 12, fontWeight: 700,
            cursor: generating ? 'not-allowed' : 'pointer', transition: 'all 150ms',
          }}
        >
          {generating
            ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
            : <><Sparkles size={13} /> Generate {activeTab === 'labs' ? 'Lab' : 'Course'}</>}
        </button>
      </div>
    </div>
  );
}

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;
const STORAGE_KEY = 'pf_classroom_progress';
const BADGES_KEY = 'pf_classroom_badges';

function loadProgress(): ClassroomProgress {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
}
function saveProgress(p: ClassroomProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}
function loadBadges(): string[] {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) ?? '[]'); } catch { return []; }
}
function saveBadges(b: string[]) {
  try { localStorage.setItem(BADGES_KEY, JSON.stringify(b)); } catch {}
}

// ─── Sub-views ──────────────────────────────────────────────────────────────

function ModuleIcon({ type }: { type: CourseModule['type'] }) {
  if (type === 'LESSON') return <BookOpen size={12} />;
  if (type === 'LAB') return <FlaskConical size={12} />;
  return <Brain size={12} />;
}

function DifficultyBadge({ d }: { d: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    beginner:     { color: '#00ff41', bg: 'rgba(0,255,65,0.08)' },
    intermediate: { color: '#facc15', bg: 'rgba(250,204,21,0.08)' },
    advanced:     { color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  };
  const s = map[d] ?? map.beginner;
  return (
    <span style={{ ...MONO, fontSize: 9, color: s.color, background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 3, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {d}
    </span>
  );
}

// ─── Lesson View ─────────────────────────────────────────────────────────────
function LessonView({ mod, onComplete }: { mod: CourseModule; onComplete: () => void }) {
  const [done, setDone] = useState(false);
  const lines = (mod.content ?? '').split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.15)',
        borderRadius: 8, padding: '28px 32px', maxHeight: 520, overflowY: 'auto',
      }}>
        {lines.map((line, i) => {
          if (line.startsWith('## ')) return <h2 key={i} style={{ ...MONO, color: '#00ff41', fontSize: 15, fontWeight: 700, marginBottom: 16, marginTop: i > 0 ? 24 : 0, textShadow: '0 0 8px rgba(0,255,65,0.4)' }}>{line.slice(3)}</h2>;
          if (line.startsWith('### ')) return <h3 key={i} style={{ ...MONO, color: '#c8ffd4', fontSize: 13, fontWeight: 600, marginBottom: 10, marginTop: 18 }}>{line.slice(4)}</h3>;
          if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ ...MONO, color: '#00ff41', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{line.slice(2, -2)}</p>;
          if (line.startsWith('> ')) return <blockquote key={i} style={{ ...MONO, fontSize: 11, color: '#facc15', borderLeft: '2px solid rgba(250,204,21,0.5)', paddingLeft: 14, margin: '8px 0', fontStyle: 'italic' }}>{line.slice(2)}</blockquote>;
          if (line.startsWith('- ')) return <li key={i} style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.8, marginBottom: 4, listStyle: 'none', paddingLeft: 12 }}>· {line.slice(2)}</li>;
          if (line.startsWith('`') && line.endsWith('`') && !line.startsWith('```')) return <code key={i} style={{ ...MONO, fontSize: 10, color: '#00ff41', background: 'rgba(0,255,65,0.07)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 3, padding: '2px 6px', display: 'block', margin: '4px 0' }}>{line.slice(1, -1)}</code>;
          if (line.startsWith('```') || line === '') return <div key={i} style={{ height: line === '' ? 8 : 0 }} />;
          return <p key={i} style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.7, lineHeight: 1.7, marginBottom: 4 }}>{line}</p>;
        })}
      </div>
      <button
        onClick={() => { setDone(true); onComplete(); }}
        disabled={done}
        style={{
          ...MONO, fontSize: 12, fontWeight: 600, padding: '12px 24px',
          background: done ? 'rgba(0,255,65,0.15)' : '#00ff41',
          color: done ? '#00ff41' : '#000',
          border: `1px solid ${done ? 'rgba(0,255,65,0.3)' : '#00ff41'}`,
          borderRadius: 6, cursor: done ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          transition: 'all 200ms',
        }}
      >
        {done ? <><CheckCircle2 size={14} /> Lesson Complete — +{mod.xpReward} XP</> : 'Mark as Complete'}
      </button>
    </div>
  );
}

// ─── Lab View ─────────────────────────────────────────────────────────────────
function LabView({ mod, onComplete }: { mod: CourseModule; onComplete: (score: number) => void }) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  function handleSubmit() {
    if (!answer.trim()) return;
    const keywords = mod.labKeywords ?? [];
    const lower = answer.toLowerCase();
    const matched = keywords.filter((k) => lower.includes(k.toLowerCase())).length;
    const pct = keywords.length > 0 ? Math.round((matched / keywords.length) * 100) : 75;
    const finalScore = Math.min(100, Math.max(40, pct));
    setScore(finalScore);
    setSubmitted(true);
    onComplete(finalScore);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 8, padding: '20px 24px' }}>
        <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>// Lab Exercise</div>
        <div style={{ ...MONO, fontSize: 12, color: '#c8ffd4', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{mod.labPrompt}</div>
      </div>

      {!submitted ? (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here..."
            rows={8}
            style={{
              ...MONO, fontSize: 11, color: '#c8ffd4', background: 'rgba(0,255,65,0.02)',
              border: '1px solid rgba(0,255,65,0.2)', borderRadius: 8, padding: '14px 18px',
              resize: 'vertical', outline: 'none', lineHeight: 1.6,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)'; }}
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            style={{
              ...MONO, fontSize: 12, fontWeight: 600, padding: '12px 24px',
              background: answer.trim() ? '#00ff41' : 'rgba(0,255,65,0.08)',
              color: answer.trim() ? '#000' : '#00ff41',
              border: `1px solid ${answer.trim() ? '#00ff41' : 'rgba(0,255,65,0.2)'}`,
              borderRadius: 6, cursor: answer.trim() ? 'pointer' : 'default',
              transition: 'all 200ms',
            }}
          >
            Submit Lab
          </button>
        </>
      ) : (
        <div style={{ background: score >= 70 ? 'rgba(0,255,65,0.05)' : 'rgba(250,204,21,0.05)', border: `1px solid ${score >= 70 ? 'rgba(0,255,65,0.25)' : 'rgba(250,204,21,0.25)'}`, borderRadius: 8, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <CheckCircle2 size={18} style={{ color: score >= 70 ? '#00ff41' : '#facc15' }} />
            <div>
              <div style={{ ...MONO, fontSize: 14, fontWeight: 700, color: score >= 70 ? '#00ff41' : '#facc15' }}>
                {score}% — {score >= 90 ? 'Excellent!' : score >= 70 ? 'Good Work' : 'Needs Review'}
              </div>
              <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5, marginTop: 2 }}>
                +{Math.round(mod.xpReward * (score / 100))} XP earned
              </div>
            </div>
          </div>
          <div style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.65, lineHeight: 1.65 }}>
            {score >= 90
              ? 'Outstanding analysis. You identified all the critical indicators.'
              : score >= 70
              ? 'Good response. Review the lesson content to catch any indicators you may have missed.'
              : 'Review the lesson content and try to identify more specific technical indicators in future exercises.'}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Simulation Chat View ─────────────────────────────────────────────────────
function SimulationView({
  mod, provider, model, onComplete,
}: {
  mod: CourseModule;
  provider: string;
  model: string;
  onComplete: (score: number) => void;
}) {
  const [messages, setMessages] = useState<{ role: 'attacker' | 'trainee'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'active' | 'scoring' | 'done'>('intro');
  const [scoreData, setScoreData] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function startScenario() {
    setPhase('active');
    setLoading(true);
    try {
      const res = await fetch('/api/classroom/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'simulate', messages: [], scenarioContext: mod.scenarioContext, provider, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([{ role: 'attacker', content: data.message }]);
    } catch (e: any) {
      toast.error(e.message);
      setPhase('intro');
    } finally { setLoading(false); }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'trainee' as const, content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const apiMsgs = newMessages.map((m) => ({
        role: m.role === 'attacker' ? 'assistant' : 'user',
        content: m.content,
      }));
      const res = await fetch('/api/classroom/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'simulate', messages: apiMsgs, scenarioContext: mod.scenarioContext, provider, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: 'attacker', content: data.message }]);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  }

  async function endAndScore() {
    setPhase('scoring');
    setLoading(true);
    try {
      const apiMsgs = messages.map((m) => ({
        role: m.role === 'attacker' ? 'assistant' : 'user',
        content: m.content,
      }));
      const res = await fetch('/api/classroom/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'score', messages: apiMsgs, scenarioContext: mod.scenarioContext, provider, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScoreData(data.score);
      setPhase('done');
      onComplete(data.score.total ?? 75);
    } catch (e: any) {
      toast.error(e.message);
      setPhase('active');
    } finally { setLoading(false); }
  }

  if (phase === 'intro') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={24} style={{ color: '#00ff41' }} />
        </div>
        <div>
          <div style={{ ...MONO, fontSize: 14, fontWeight: 700, color: '#c8ffd4', marginBottom: 8 }}>Live Security Simulation</div>
          <div style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.6, lineHeight: 1.7, maxWidth: 400 }}>{mod.scenarioContext}</div>
        </div>
        <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.45, border: '1px solid rgba(0,255,65,0.15)', borderRadius: 6, padding: '10px 16px', background: 'rgba(0,255,65,0.02)', textAlign: 'left', maxWidth: 400 }}>
          // The AI will simulate a realistic attack. Respond as you would in real life. When you're ready to end the scenario, click "End &amp; Score".
        </div>
        <button onClick={startScenario} style={{ ...MONO, fontSize: 12, fontWeight: 600, padding: '12px 32px', background: '#00ff41', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Play size={14} /> Start Simulation
        </button>
      </div>
    );
  }

  if (phase === 'done' && scoreData) {
    const total = scoreData.total ?? 0;
    const color = total >= 80 ? '#00ff41' : total >= 60 ? '#facc15' : '#f87171';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 8, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${color}15`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ ...MONO, fontSize: 16, fontWeight: 700, color }}>{total}</span>
            </div>
            <div>
              <div style={{ ...MONO, fontSize: 15, fontWeight: 700, color }}>
                {total >= 80 ? 'Excellent Response!' : total >= 60 ? 'Good Effort' : 'Needs Improvement'}
              </div>
              <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5, marginTop: 4 }}>
                +{Math.round(mod.xpReward * (total / 100))} XP earned
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Detection', value: scoreData.detection },
              { label: 'Response', value: scoreData.response },
              { label: 'Escalation', value: scoreData.escalation },
              { label: 'Documentation', value: scoreData.documentation },
            ].map((dim) => (
              <div key={dim.label} style={{ background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{dim.label}</div>
                <div style={{ ...MONO, fontSize: 18, fontWeight: 700, color: (dim.value ?? 0) >= 18 ? '#00ff41' : (dim.value ?? 0) >= 12 ? '#facc15' : '#f87171' }}>{dim.value ?? 0}<span style={{ fontSize: 10, opacity: 0.4 }}>/25</span></div>
              </div>
            ))}
          </div>

          {scoreData.feedback && (
            <div style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.7, lineHeight: 1.7, marginBottom: 12 }}>{scoreData.feedback}</div>
          )}
          {scoreData.strengths?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Strengths</div>
              {scoreData.strengths.map((s: string, i: number) => (
                <div key={i} style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.7, marginBottom: 3 }}>✓ {s}</div>
              ))}
            </div>
          )}
          {scoreData.improvements?.length > 0 && (
            <div>
              <div style={{ ...MONO, fontSize: 9, color: '#facc15', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Areas to Improve</div>
              {scoreData.improvements.map((s: string, i: number) => (
                <div key={i} style={{ ...MONO, fontSize: 11, color: '#facc15', opacity: 0.7, marginBottom: 3 }}>△ {s}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0 16px', minHeight: 300, maxHeight: 400 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: m.role === 'trainee' ? 'flex-end' : 'flex-start' }}>
            <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {m.role === 'attacker' ? '// scenario' : '// your response'}
            </span>
            <div style={{
              ...MONO, fontSize: 12, lineHeight: 1.65, padding: '12px 16px', borderRadius: 8, maxWidth: '85%',
              background: m.role === 'attacker' ? 'rgba(248,113,113,0.07)' : 'rgba(0,255,65,0.07)',
              border: `1px solid ${m.role === 'attacker' ? 'rgba(248,113,113,0.2)' : 'rgba(0,255,65,0.2)'}`,
              color: m.role === 'attacker' ? '#fca5a5' : '#c8ffd4',
              whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5 }}>
            <Loader2 size={12} style={{ color: '#00ff41', animation: 'spin 1s linear infinite' }} />
            <span style={{ ...MONO, fontSize: 10, color: '#00ff41' }}>processing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {phase === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(0,255,65,0.1)', paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type your response... (Enter to send, Shift+Enter for new line)"
              rows={2}
              disabled={loading}
              style={{
                ...MONO, flex: 1, fontSize: 11, color: '#c8ffd4',
                background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.2)',
                borderRadius: 6, padding: '10px 14px', resize: 'none', outline: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)'; }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{ padding: '0 14px', background: input.trim() && !loading ? '#00ff41' : 'rgba(0,255,65,0.08)', border: 'none', borderRadius: 6, cursor: input.trim() && !loading ? 'pointer' : 'default', color: input.trim() && !loading ? '#000' : '#00ff41' }}
            >
              <Send size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={endAndScore}
              disabled={messages.length < 2 || loading}
              style={{ ...MONO, fontSize: 10, color: '#facc15', opacity: messages.length >= 2 && !loading ? 0.8 : 0.3, background: 'none', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 4, padding: '5px 12px', cursor: messages.length >= 2 && !loading ? 'pointer' : 'default' }}
            >
              End & Score →
            </button>
          </div>
        </div>
      )}
      {phase === 'scoring' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid rgba(0,255,65,0.1)', paddingTop: 12 }}>
          <Loader2 size={14} style={{ color: '#00ff41', animation: 'spin 1s linear infinite' }} />
          <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.6 }}>Evaluating your responses...</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ClassroomView() {
  const [progress, setProgress] = useState<ClassroomProgress>({});
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'badges' | 'labs'>('courses');
  const [labSearch, setLabSearch] = useState('');
  const [labCategory, setLabCategory] = useState('');
  const [activeLab, setActiveLab] = useState<StandaloneLab | null>(null);
  const [labAnswer, setLabAnswer] = useState('');
  const [labSubmitted, setLabSubmitted] = useState(false);
  const labCategories = getLabCategories();
  const [provider] = useState('openrouter');
  const [model] = useState('deepseek/deepseek-chat-v3-0324');
  const [aiCourses, setAiCourses] = useState<Course[]>([]);
  const [aiLabs, setAiLabs] = useState<StandaloneLab[]>([]);

  const allCourses = [...aiCourses, ...ALL_COURSES];
  const allLabs = [...aiLabs, ...STANDALONE_LABS];

  useEffect(() => {
    setProgress(loadProgress());
    setEarnedBadges(loadBadges());
  }, []);

  const totalXP = getTotalXP(progress);
  const level = getLevelForXP(totalXP);
  const xpProgress = getXPProgress(totalXP);
  const completedModules = getCompletedModuleCount(progress);

  function completeModule(courseId: string, moduleId: string, xpReward: number, score?: number) {
    const scaledXP = score !== undefined ? Math.round(xpReward * (score / 100)) : xpReward;
    const newProgress: ClassroomProgress = {
      ...progress,
      [courseId]: {
        ...(progress[courseId] ?? {}),
        [moduleId]: { completed: true, xpEarned: scaledXP, score, completedAt: new Date().toISOString() },
      },
    };
    setProgress(newProgress);
    saveProgress(newProgress);

    const newXP = getTotalXP(newProgress);
    const newLevel = getLevelForXP(newXP);
    if (newLevel.level > level.level) {
      toast.success(`Level Up! You're now ${newLevel.title}!`, { duration: 4000 });
    } else {
      toast.success(`+${scaledXP} XP${score !== undefined ? ` (${score}%)` : ''}`, { duration: 2500 });
    }

    checkBadges(newProgress, newXP);
  }

  function checkBadges(newProgress: ClassroomProgress, xp: number) {
    const newBadges = [...earnedBadges];
    let added = false;

    for (const badge of BADGES) {
      if (newBadges.includes(badge.id)) continue;
      if (badge.requiresMinXP && xp < badge.requiresMinXP) continue;
      if (badge.requiredModuleCount) {
        const count = getCompletedModuleCount(newProgress);
        if (count < badge.requiredModuleCount) continue;
      }
      if (badge.requiredCourseIds) {
        const allDone = badge.requiredCourseIds.every((cid) => {
          const course = ALL_COURSES.find((c) => c.id === cid);
          if (!course) return false;
          const cp = newProgress[cid] ?? {};
          return course.modules.every((m) => cp[m.id]?.completed);
        });
        if (!allDone) continue;
      }
      newBadges.push(badge.id);
      added = true;
      toast(`🏅 Badge unlocked: ${badge.name}!`, { duration: 3500 });
    }

    if (added) {
      setEarnedBadges(newBadges);
      saveBadges(newBadges);
    }
  }

  const isModuleLocked = (course: Course, modIndex: number) => {
    if (modIndex === 0) return false;
    const prevMod = course.modules[modIndex - 1];
    return !progress[course.id]?.[prevMod.id]?.completed;
  };

  // ── Module detail view ──
  if (selectedCourse && selectedModule) {
    const modIndex = selectedCourse.modules.findIndex((m) => m.id === selectedModule.id);
    const modProgress = progress[selectedCourse.id]?.[selectedModule.id];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 760 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <button onClick={() => { setSelectedCourse(null); setSelectedModule(null); }} style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={12} /> Courses
          </button>
          <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.3 }}>/</span>
          <button onClick={() => setSelectedModule(null)} style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer' }}>
            {selectedCourse.title}
          </button>
          <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.3 }}>/</span>
          <span style={{ ...MONO, fontSize: 11, color: '#c8ffd4' }}>{selectedModule.title}</span>
        </div>

        {/* Module header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ padding: '4px 10px', borderRadius: 4, background: selectedModule.type === 'LESSON' ? 'rgba(96,165,250,0.1)' : selectedModule.type === 'LAB' ? 'rgba(250,204,21,0.1)' : 'rgba(0,255,65,0.1)', border: `1px solid ${selectedModule.type === 'LESSON' ? 'rgba(96,165,250,0.3)' : selectedModule.type === 'LAB' ? 'rgba(250,204,21,0.3)' : 'rgba(0,255,65,0.3)'}`, display: 'flex', alignItems: 'center', gap: 5 }}>
            <ModuleIcon type={selectedModule.type} />
            <span style={{ ...MONO, fontSize: 9, color: selectedModule.type === 'LESSON' ? '#60a5fa' : selectedModule.type === 'LAB' ? '#facc15' : '#00ff41', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{selectedModule.type}</span>
          </div>
          <h2 style={{ ...MONO, fontSize: 14, fontWeight: 700, color: '#c8ffd4', flex: 1 }}>{selectedModule.title}</h2>
          <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5 }}>+{selectedModule.xpReward} XP</span>
          {modProgress?.completed && <CheckCircle2 size={16} style={{ color: '#00ff41' }} />}
        </div>

        {/* Module content */}
        {selectedModule.type === 'LESSON' && (
          <LessonView
            mod={selectedModule}
            onComplete={() => completeModule(selectedCourse.id, selectedModule.id, selectedModule.xpReward)}
          />
        )}
        {selectedModule.type === 'LAB' && (
          <LabView
            mod={selectedModule}
            onComplete={(score) => completeModule(selectedCourse.id, selectedModule.id, selectedModule.xpReward, score)}
          />
        )}
        {selectedModule.type === 'SIMULATION' && (
          <SimulationView
            mod={selectedModule}
            provider={provider}
            model={model}
            onComplete={(score) => completeModule(selectedCourse.id, selectedModule.id, selectedModule.xpReward, score)}
          />
        )}
      </div>
    );
  }

  // ── Course module list ──
  if (selectedCourse) {
    const courseXP = getTotalXP({ [selectedCourse.id]: progress[selectedCourse.id] ?? {} });
    const totalCourseXP = selectedCourse.modules.reduce((s, m) => s + m.xpReward, 0);
    const pct = getCourseProgress(selectedCourse.id, progress);

    return (
      <div style={{ maxWidth: 720 }}>
        <button onClick={() => setSelectedCourse(null)} style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
          <ChevronLeft size={12} /> All Courses
        </button>

        {/* Course header */}
        <div style={{ background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 8, padding: '20px 24px', marginBottom: 20, borderLeft: `3px solid ${selectedCourse.accentColor}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
            <div>
              <h2 style={{ ...MONO, fontSize: 16, fontWeight: 700, color: '#c8ffd4', marginBottom: 6 }}>{selectedCourse.title}</h2>
              <p style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.6, lineHeight: 1.65 }}>{selectedCourse.description}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ ...MONO, fontSize: 20, fontWeight: 700, color: selectedCourse.accentColor }}>{pct}%</div>
              <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase' }}>Complete</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DifficultyBadge d={selectedCourse.difficulty} />
            <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5 }}>{selectedCourse.modules.length} modules</span>
            <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5 }}>{courseXP}/{totalCourseXP} XP</span>
          </div>
          <div style={{ marginTop: 12, height: 4, background: 'rgba(0,255,65,0.08)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: selectedCourse.accentColor, borderRadius: 2, transition: 'width 500ms ease', boxShadow: `0 0 8px ${selectedCourse.accentColor}60` }} />
          </div>
        </div>

        {/* Module list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {selectedCourse.modules.map((mod, i) => {
            const locked = isModuleLocked(selectedCourse, i);
            const done = progress[selectedCourse.id]?.[mod.id]?.completed;
            const score = progress[selectedCourse.id]?.[mod.id]?.score;
            return (
              <button
                key={mod.id}
                onClick={() => !locked && setSelectedModule(mod)}
                disabled={locked}
                style={{
                  ...MONO, width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', borderRadius: 8, cursor: locked ? 'not-allowed' : 'pointer',
                  background: done ? 'rgba(0,255,65,0.05)' : 'rgba(0,255,65,0.02)',
                  border: `1px solid ${done ? 'rgba(0,255,65,0.25)' : locked ? 'rgba(0,255,65,0.06)' : 'rgba(0,255,65,0.12)'}`,
                  opacity: locked ? 0.4 : 1, transition: 'all 150ms', textAlign: 'left',
                }}
                onMouseEnter={(e) => { if (!locked) e.currentTarget.style.background = 'rgba(0,255,65,0.07)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = done ? 'rgba(0,255,65,0.05)' : 'rgba(0,255,65,0.02)'; }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 6, background: locked ? 'rgba(0,255,65,0.03)' : done ? 'rgba(0,255,65,0.15)' : 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {locked ? <Lock size={12} style={{ color: '#00ff41', opacity: 0.4 }} /> : done ? <CheckCircle2 size={14} style={{ color: '#00ff41' }} /> : <ModuleIcon type={mod.type} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#c8ffd4', marginBottom: 3 }}>{mod.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, color: mod.type === 'LESSON' ? '#60a5fa' : mod.type === 'LAB' ? '#facc15' : '#00ff41', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{mod.type}</span>
                    <span style={{ fontSize: 9, color: '#00ff41', opacity: 0.4 }}>·</span>
                    <span style={{ fontSize: 9, color: '#00ff41', opacity: 0.4 }}>{mod.durationMin} min</span>
                    {score !== undefined && <><span style={{ fontSize: 9, color: '#00ff41', opacity: 0.4 }}>·</span><span style={{ fontSize: 9, color: score >= 80 ? '#00ff41' : '#facc15' }}>{score}%</span></>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: '#00ff41', opacity: 0.5 }}>+{mod.xpReward} XP</span>
                  {!locked && <ChevronRight size={12} style={{ color: '#00ff41', opacity: 0.4 }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Main view ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* AI Banner */}
      <AIGenerateBanner
        activeTab={activeTab}
        onCourseGenerated={course => setAiCourses(prev => [course, ...prev])}
        onLabGenerated={lab => setAiLabs(prev => [lab, ...prev])}
      />
      {/* XP / Level header */}
      <div style={{ background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${level.color}18`, border: `2px solid ${level.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px ${level.glowColor}` }}>
              <span style={{ ...MONO, fontSize: 14, fontWeight: 700, color: level.color }}>{level.level}</span>
            </div>
            <div>
              <div style={{ ...MONO, fontSize: 15, fontWeight: 700, color: level.color, textShadow: `0 0 8px ${level.glowColor}` }}>{level.title}</div>
              <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5, marginTop: 2 }}>{totalXP.toLocaleString()} XP · {completedModules} modules completed</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...MONO, fontSize: 18, fontWeight: 700, color: '#00ff41' }}>{earnedBadges.length}</div>
              <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase' }}>Badges</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...MONO, fontSize: 18, fontWeight: 700, color: '#00ff41' }}>{ALL_COURSES.filter((c) => getCourseProgress(c.id, progress) === 100).length}</div>
              <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase' }}>Courses</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase' }}>
              Progress to {XP_LEVELS[Math.min(level.level, XP_LEVELS.length - 1)]?.title ?? 'Max'}
            </span>
            <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.5 }}>{xpProgress.current.toLocaleString()} / {(xpProgress.max - xpProgress.min).toLocaleString()} XP</span>
          </div>
          <div style={{ height: 6, background: 'rgba(0,255,65,0.08)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${xpProgress.pct}%`, background: level.color, borderRadius: 3, transition: 'width 600ms ease', boxShadow: `0 0 10px ${level.glowColor}` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(0,255,65,0.1)', paddingBottom: 0 }}>
        {(['courses', 'labs', 'badges'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...MONO, fontSize: 11, fontWeight: 600, padding: '8px 16px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#00ff41',
              opacity: activeTab === tab ? 1 : 0.4,
              borderBottom: `2px solid ${activeTab === tab ? '#00ff41' : 'transparent'}`,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              transition: 'all 150ms', marginBottom: -1,
            }}
          >
            {tab === 'courses'
            ? `Courses (${allCourses.length}${aiCourses.length > 0 ? ` · ${aiCourses.length} AI` : ''})`
            : tab === 'labs'
            ? `Labs (${allLabs.length}${aiLabs.length > 0 ? ` · ${aiLabs.length} AI` : ''})`
            : `Badges (${earnedBadges.length}/${BADGES.length})`}
          </button>
        ))}
      </div>

      {/* Labs tab */}
      {activeTab === 'labs' && (
        <div>
          {activeLab ? (
            <div style={{ maxWidth: 720 }}>
              <button onClick={() => { setActiveLab(null); setLabAnswer(''); setLabSubmitted(false); }} style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                <ChevronLeft size={12} /> All Labs
              </button>
              <div style={{ background: 'rgba(0,255,65,0.03)', border: `2px solid ${activeLab.accentColor}30`, borderLeft: `3px solid ${activeLab.accentColor}`, borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...MONO, fontSize: 9, color: activeLab.accentColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{activeLab.category}</div>
                    <h2 style={{ ...MONO, fontSize: 16, fontWeight: 700, color: '#c8ffd4', marginBottom: 6 }}>{activeLab.title}</h2>
                    <p style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.6, lineHeight: 1.65 }}>{activeLab.description}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ ...MONO, fontSize: 18, fontWeight: 700, color: activeLab.accentColor }}>+{activeLab.xpReward}</div>
                    <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4 }}>XP</div>
                    <DifficultyBadge d={activeLab.difficulty} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {activeLab.keywords.slice(0, 6).map(k => (
                    <span key={k} style={{ ...MONO, fontSize: 9, color: '#64748b', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3, padding: '2px 6px' }}>{k}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: '#050505', border: '1px solid rgba(250,204,21,0.15)', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ ...MONO, fontSize: 10, color: '#facc15', opacity: 0.7, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>// Scenario</div>
                <p style={{ ...MONO, fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>{activeLab.scenario}</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.6, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>// Tasks</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activeLab.tasks.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.08)', borderRadius: 6 }}>
                      <span style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.5, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ ...MONO, fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              {activeLab.tools && (
                <div style={{ marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ ...MONO, fontSize: 10, color: '#475569' }}>Tools:</span>
                  {activeLab.tools.map(t => <span key={t} style={{ ...MONO, fontSize: 9, color: '#60a5fa', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 3, padding: '2px 7px' }}>{t}</span>)}
                </div>
              )}
              <LabView
                mod={{ id: activeLab.id, title: activeLab.title, type: 'LAB', durationMin: activeLab.estimatedMin, xpReward: activeLab.xpReward, labPrompt: activeLab.labPrompt, labKeywords: activeLab.keywords }}
                onComplete={(score) => {
                  toast.success(`Lab complete! +${activeLab.xpReward} XP`, { style: { background: '#0a0a0a', color: '#00ff41', border: '1px solid rgba(0,255,65,0.2)' } });
                }}
              />
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input
                    value={labSearch}
                    onChange={e => setLabSearch(e.target.value)}
                    placeholder="Search labs..."
                    style={{ width: '100%', padding: '8px 10px 8px 30px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0', ...MONO, fontSize: 11, outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
                <select
                  value={labCategory}
                  onChange={e => setLabCategory(e.target.value)}
                  style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: labCategory ? '#e2e8f0' : '#475569', ...MONO, fontSize: 11, outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">All Categories</option>
                  {labCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                {allLabs.filter(lab => {
                  const q = labSearch.toLowerCase();
                  return (!labSearch || lab.title.toLowerCase().includes(q) || lab.description.toLowerCase().includes(q) || lab.keywords.some(k => k.toLowerCase().includes(q)))
                    && (!labCategory || lab.category === labCategory);
                }).map(lab => {
                  const isAILab = aiLabs.some(l => l.id === lab.id);
                  return (
                  <button
                    key={lab.id}
                    onClick={() => setActiveLab(lab)}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 0, padding: '16px 18px',
                      background: isAILab ? 'rgba(167,139,250,0.03)' : 'rgba(0,255,65,0.02)', borderRadius: 10, cursor: 'pointer',
                      border: isAILab ? '1px solid rgba(167,139,250,0.2)' : '1px solid rgba(0,255,65,0.1)', borderLeft: `3px solid ${lab.accentColor}`,
                      textAlign: 'left', transition: 'all 150ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isAILab ? 'rgba(167,139,250,0.06)' : 'rgba(0,255,65,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isAILab ? 'rgba(167,139,250,0.03)' : 'rgba(0,255,65,0.02)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <LabIcon size={12} style={{ color: lab.accentColor, flexShrink: 0 }} />
                      <span style={{ ...MONO, fontSize: 9, color: lab.accentColor, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>{lab.category}</span>
                      {isAILab && <span style={{ ...MONO, fontSize: 8, color: '#a78bfa', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>AI</span>}
                      <span style={{ marginLeft: 'auto', ...MONO, fontSize: 11, fontWeight: 700, color: lab.accentColor }}>+{lab.xpReward}</span>
                    </div>
                    <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: '#c8ffd4', marginBottom: 6, lineHeight: 1.4 }}>{lab.title}</div>
                    <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.55, lineHeight: 1.6, marginBottom: 12, flex: 1 }}>{lab.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <DifficultyBadge d={lab.difficulty} />
                      <span style={{ ...MONO, fontSize: 9, color: '#475569' }}>{lab.estimatedMin} min</span>
                      <span style={{ ...MONO, fontSize: 9, color: '#475569', marginLeft: 'auto' }}>{lab.tasks.length} tasks</span>
                    </div>
                  </button>
                );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Course grid */}
      {activeTab === 'courses' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {allCourses.map((course) => {
            const isAI = aiCourses.some(c => c.id === course.id);
            const pct = getCourseProgress(course.id, progress);
            const courseXP = getTotalXP({ [course.id]: progress[course.id] ?? {} });
            const totalCourseXP = course.modules.reduce((s, m) => s + m.xpReward, 0);
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 0, padding: '18px 20px',
                  background: isAI ? 'rgba(167,139,250,0.03)' : 'rgba(0,255,65,0.02)', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${pct === 100 ? 'rgba(0,255,65,0.3)' : isAI ? 'rgba(167,139,250,0.2)' : 'rgba(0,255,65,0.1)'}`,
                  borderLeft: `3px solid ${course.accentColor}`,
                  textAlign: 'left', transition: 'all 150ms', position: 'relative',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,65,0.05)'; e.currentTarget.style.borderColor = course.accentColor + '55'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,255,65,0.02)'; e.currentTarget.style.borderColor = pct === 100 ? 'rgba(0,255,65,0.3)' : 'rgba(0,255,65,0.1)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: '#c8ffd4', lineHeight: 1.4, flex: 1 }}>{course.title}</div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {isAI && <span style={{ ...MONO, fontSize: 8, color: '#a78bfa', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 3, padding: '1px 5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles size={7} />AI</span>}
                    {pct === 100 && <CheckCircle2 size={14} style={{ color: '#00ff41' }} />}
                  </div>
                </div>
                <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.55, lineHeight: 1.6, marginBottom: 14, flex: 1 }}>{course.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <DifficultyBadge d={course.difficulty} />
                  <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4 }}>{course.modules.length} modules</span>
                  <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, marginLeft: 'auto' }}>{courseXP}/{totalCourseXP} XP</span>
                </div>
                <div style={{ height: 3, background: 'rgba(0,255,65,0.06)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: course.accentColor, borderRadius: 2, transition: 'width 500ms ease', boxShadow: pct > 0 ? `0 0 6px ${course.accentColor}60` : 'none' }} />
                </div>
                <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, marginTop: 6, textAlign: 'right' }}>{pct}% complete</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Badges grid */}
      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {BADGES.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            const catColor: Record<string, string> = { completion: '#00ff41', score: '#60a5fa', specialty: '#a78bfa', streak: '#facc15' };
            const color = catColor[badge.category] ?? '#00ff41';
            return (
              <div
                key={badge.id}
                style={{
                  padding: '14px 16px', borderRadius: 8,
                  background: earned ? `${color}08` : 'rgba(0,255,65,0.01)',
                  border: `1px solid ${earned ? color + '30' : 'rgba(0,255,65,0.08)'}`,
                  opacity: earned ? 1 : 0.4, transition: 'all 150ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: earned ? `${color}15` : 'rgba(0,255,65,0.04)', border: `1px solid ${earned ? color + '40' : 'rgba(0,255,65,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {earned ? <Award size={14} style={{ color }} /> : <Lock size={12} style={{ color: '#00ff41', opacity: 0.4 }} />}
                  </div>
                  <div>
                    <div style={{ ...MONO, fontSize: 11, fontWeight: 700, color: earned ? color : '#00ff41' }}>{badge.name}</div>
                    <div style={{ ...MONO, fontSize: 8, color, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{badge.category}</div>
                  </div>
                </div>
                <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.55, lineHeight: 1.5 }}>{badge.description}</div>
                {badge.xpBonus > 0 && <div style={{ ...MONO, fontSize: 9, color, opacity: 0.6, marginTop: 6 }}>+{badge.xpBonus} XP bonus</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
