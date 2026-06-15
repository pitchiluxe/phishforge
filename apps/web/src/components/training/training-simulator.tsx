'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Send, Loader2, RotateCcw, ChevronRight, Target, Shield, Brain, AlertTriangle, Cloud, Mail, Wand2, Sparkles, RefreshCw } from 'lucide-react';
import { TRAINING_SCENARIOS } from '@/lib/classroom';
import toast from 'react-hot-toast';

interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  xpReward: number;
  context: string;
  tags?: string[];
  estimatedMin?: number;
  isAI?: boolean;
}

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

type Phase = 'select' | 'active' | 'scoring' | 'scored';

const DIFFICULTY_STYLE: Record<string, { color: string; bg: string }> = {
  beginner:     { color: '#00ff41', bg: 'rgba(0,255,65,0.08)' },
  intermediate: { color: '#facc15', bg: 'rgba(250,204,21,0.08)' },
  advanced:     { color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Phishing:            Mail,
  BEC:                 AlertTriangle,
  'Social Engineering': Brain,
  'Incident Response': Shield,
  'Cloud Security':    Cloud,
  'Spear Phishing':    Target,
};

const STORAGE_KEY = 'pf_training_sessions';

function saveSession(session: any) {
  try {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 20)));
  } catch {}
}

function ScoreBar({ label, value, max = 25 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 80 ? '#00ff41' : pct >= 60 ? '#facc15' : '#f87171';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color }}>{value}<span style={{ fontSize: 9, opacity: 0.5 }}>/{max}</span></span>
      </div>
      <div style={{ height: 4, background: 'rgba(0,255,65,0.08)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 600ms ease', boxShadow: `0 0 6px ${color}60` }} />
      </div>
    </div>
  );
}

export function TrainingSimulator() {
  const [scenario, setScenario] = useState<TrainingScenario | null>(null);
  const [messages, setMessages] = useState<{ role: 'attacker' | 'trainee'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('select');
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [provider] = useState('openrouter');
  const [model] = useState('deepseek/deepseek-chat-v3-0324');
  const [sessions, setSessions] = useState<any[]>([]);
  const [aiScenarios, setAiScenarios] = useState<TrainingScenario[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setSessions(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
    } catch {}
    generateAIScenarios();
  }, []);

  async function generateAIScenarios() {
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'batch-scenarios', count: 5 }),
      });
      const data = await res.json();
      if (data.scenarios) {
        const normalized: TrainingScenario[] = data.scenarios.map((s: any) => ({
          ...s,
          context: s.scenarioContext ?? s.description,
          isAI: true,
        }));
        setAiScenarios(normalized);
      }
    } catch {} finally {
      setGeneratingAI(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function startScenario(s: TrainingScenario) {
    setScenario(s);
    setMessages([]);
    setScoreData(null);
    setPhase('active');
    setLoading(true);
    try {
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', scenario: s, messages: [], provider, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([{ role: 'attacker', content: data.message }]);
    } catch (e: any) {
      toast.error(e.message);
      setPhase('select');
      setScenario(null);
    } finally { setLoading(false); }
  }

  async function sendMessage() {
    if (!input.trim() || loading || !scenario) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages: { role: 'attacker' | 'trainee'; content: string }[] = [...messages, { role: 'trainee', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const apiMsgs = newMessages.map((m) => ({
        role: m.role === 'attacker' ? 'assistant' : 'user',
        content: m.content,
      }));
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', scenario, messages: apiMsgs, provider, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: 'attacker', content: data.message }]);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  }

  async function endAndScore() {
    if (!scenario || messages.length < 2) return;
    setPhase('scoring');
    setLoading(true);
    try {
      const apiMsgs = messages.map((m) => ({
        role: m.role === 'attacker' ? 'assistant' : 'user',
        content: m.content,
      }));
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'score', scenario, messages: apiMsgs, provider, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScoreData(data.score);
      setPhase('scored');

      const session = {
        id: `tr-${Date.now()}`,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        score: data.score.total,
        verdict: data.score.verdict,
        completedAt: new Date().toISOString(),
      };
      saveSession(session);
      setSessions((prev) => [session, ...prev].slice(0, 20));
    } catch (e: any) {
      toast.error(e.message);
      setPhase('active');
    } finally { setLoading(false); }
  }

  function reset() {
    setPhase('select');
    setScenario(null);
    setMessages([]);
    setScoreData(null);
    setInput('');
  }

  const totalScore = scoreData?.total ?? 0;
  const scoreColor = totalScore >= 80 ? '#00ff41' : totalScore >= 60 ? '#facc15' : '#f87171';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header stats */}
      {sessions.length > 0 && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Sessions', value: sessions.length },
            { label: 'Avg Score', value: `${Math.round(sessions.reduce((s, x) => s + (x.score ?? 0), 0) / sessions.length)}%` },
            { label: 'Passed', value: sessions.filter((s) => s.verdict === 'pass').length },
          ].map((stat) => (
            <div key={stat.label} style={{ padding: '14px 20px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 8, textAlign: 'center', minWidth: 100 }}>
              <div style={{ ...MONO, fontSize: 20, fontWeight: 700, color: '#00ff41' }}>{stat.value}</div>
              <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── Scenario selection ── */}
        {phase === 'select' && (
          <motion.div key="select" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* AI Generate banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 18px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Wand2 size={14} style={{ color: '#a78bfa' }} />
                <div>
                  <div style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#a78bfa' }}>
                    AI-Generated Scenarios
                    {aiScenarios.length > 0 && <span style={{ marginLeft: 8, fontSize: 9, opacity: 0.7 }}>({aiScenarios.length} ready)</span>}
                  </div>
                  <div style={{ ...MONO, fontSize: 9, color: '#a78bfa', opacity: 0.55 }}>Dynamic scenarios generated from 2025 threat intelligence</div>
                </div>
              </div>
              <button
                onClick={generateAIScenarios}
                disabled={generatingAI}
                style={{ ...MONO, fontSize: 10, color: generatingAI ? '#a78bfa' : '#000', background: generatingAI ? 'rgba(167,139,250,0.1)' : '#a78bfa', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: generatingAI ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, transition: 'all 150ms' }}
              >
                {generatingAI ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><RefreshCw size={11} /> Generate More</>}
              </button>
            </div>

            <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>// Select Training Scenario ({aiScenarios.length > 0 ? `${aiScenarios.length} AI · ` : ''}{TRAINING_SCENARIOS.length} static)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {[...aiScenarios, ...TRAINING_SCENARIOS].map((s) => {
                const isAI = !!(s as TrainingScenario).isAI;
                const Icon = CATEGORY_ICONS[s.category] ?? Target;
                const ds = DIFFICULTY_STYLE[s.difficulty] ?? DIFFICULTY_STYLE.intermediate;
                const bestSession = sessions.filter((x) => x.scenarioId === s.id).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
                return (
                  <button
                    key={s.id}
                    onClick={() => startScenario(s as TrainingScenario)}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 10, padding: '18px 20px',
                      background: isAI ? 'rgba(167,139,250,0.03)' : 'rgba(0,255,65,0.02)',
                      border: isAI ? '1px solid rgba(167,139,250,0.18)' : '1px solid rgba(0,255,65,0.12)',
                      borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = isAI ? 'rgba(167,139,250,0.08)' : 'rgba(0,255,65,0.06)'; e.currentTarget.style.borderColor = isAI ? 'rgba(167,139,250,0.4)' : 'rgba(0,255,65,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isAI ? 'rgba(167,139,250,0.03)' : 'rgba(0,255,65,0.02)'; e.currentTarget.style.borderColor = isAI ? 'rgba(167,139,250,0.18)' : 'rgba(0,255,65,0.12)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: isAI ? 'rgba(167,139,250,0.08)' : 'rgba(0,255,65,0.06)', border: `1px solid ${isAI ? 'rgba(167,139,250,0.2)' : 'rgba(0,255,65,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={15} style={{ color: isAI ? '#a78bfa' : '#00ff41' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: '#c8ffd4' }}>{s.title}</div>
                            {isAI && <span style={{ ...MONO, fontSize: 8, color: '#a78bfa', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 3, padding: '1px 5px', display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles size={7} /> AI</span>}
                          </div>
                          <span style={{ ...MONO, fontSize: 9, color: isAI ? '#a78bfa' : '#00ff41', opacity: 0.5 }}>{s.category}</span>
                        </div>
                      </div>
                      <span style={{ ...MONO, fontSize: 9, color: ds.color, background: ds.bg, border: `1px solid ${ds.color}33`, borderRadius: 3, padding: '2px 7px', textTransform: 'uppercase', flexShrink: 0 }}>{s.difficulty}</span>
                    </div>
                    <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.55, lineHeight: 1.65 }}>{s.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.4 }}>+{s.xpReward} XP</span>
                      {bestSession ? (
                        <span style={{ ...MONO, fontSize: 10, color: bestSession.score >= 80 ? '#00ff41' : '#facc15' }}>Best: {bestSession.score}%</span>
                      ) : (
                        <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.3 }}>Not attempted</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Active simulation ── */}
        {(phase === 'active' || phase === 'scoring') && scenario && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Scenario info bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 8 }}>
              <Target size={14} style={{ color: '#00ff41', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...MONO, fontSize: 11, fontWeight: 700, color: '#c8ffd4' }}>{scenario.title}</div>
                <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.45 }}>{scenario.context}</div>
              </div>
              <button onClick={reset} style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, background: 'none', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <RotateCcw size={10} /> Reset
              </button>
            </div>

            {/* Chat */}
            <div style={{ background: 'rgba(0,255,65,0.01)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 320, maxHeight: 480, overflowY: 'auto' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: m.role === 'trainee' ? 'flex-end' : 'flex-start' }}>
                  <span style={{ ...MONO, fontSize: 8, color: '#00ff41', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {m.role === 'attacker' ? `// scenario [${scenario.category}]` : '// your response'}
                  </span>
                  <div style={{
                    ...MONO, fontSize: 12, lineHeight: 1.7, padding: '12px 16px', borderRadius: 8, maxWidth: '88%',
                    background: m.role === 'attacker' ? 'rgba(248,113,113,0.06)' : 'rgba(0,255,65,0.06)',
                    border: `1px solid ${m.role === 'attacker' ? 'rgba(248,113,113,0.18)' : 'rgba(0,255,65,0.18)'}`,
                    color: m.role === 'attacker' ? '#fca5a5' : '#c8ffd4',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader2 size={12} style={{ color: '#00ff41', animation: 'spin 1s linear infinite' }} />
                  <span style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5 }}>
                    {phase === 'scoring' ? 'Evaluating your responses...' : 'Generating response...'}
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            {phase === 'active' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="How do you respond? (Enter to send, Shift+Enter for new line)"
                    rows={3}
                    disabled={loading}
                    style={{
                      ...MONO, flex: 1, fontSize: 11, color: '#c8ffd4',
                      background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.2)',
                      borderRadius: 8, padding: '10px 14px', resize: 'none', outline: 'none',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.5)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)'; }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    style={{ padding: '0 16px', background: input.trim() && !loading ? '#00ff41' : 'rgba(0,255,65,0.08)', border: 'none', borderRadius: 8, cursor: input.trim() && !loading ? 'pointer' : 'default', color: input.trim() && !loading ? '#000' : '#00ff41', transition: 'all 150ms' }}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.3 }}>{messages.length} message{messages.length !== 1 ? 's' : ''} · respond at least once before scoring</span>
                  <button
                    onClick={endAndScore}
                    disabled={messages.length < 2 || loading}
                    style={{ ...MONO, fontSize: 10, color: '#facc15', opacity: messages.length >= 2 && !loading ? 0.9 : 0.3, background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 4, padding: '5px 14px', cursor: messages.length >= 2 && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    End & Score <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Score results ── */}
        {phase === 'scored' && scoreData && (
          <motion.div key="scored" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Total score card */}
            <div style={{ padding: '28px 32px', background: `${scoreColor}08`, border: `1px solid ${scoreColor}25`, borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: `${scoreColor}12`, border: `3px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${scoreColor}40`, flexShrink: 0 }}>
                  <span style={{ ...MONO, fontSize: 20, fontWeight: 700, color: scoreColor }}>{totalScore}</span>
                </div>
                <div>
                  <div style={{ ...MONO, fontSize: 16, fontWeight: 700, color: scoreColor, marginBottom: 4 }}>
                    {totalScore >= 80 ? 'Excellent Security Response!' : totalScore >= 60 ? 'Good Effort' : 'Needs Improvement'}
                  </div>
                  <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.5 }}>
                    {scenario?.title} · {scoreData.verdict === 'pass' ? '✓ Passed' : scoreData.verdict === 'review' ? '△ Needs Review' : '✗ Failed'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                <ScoreBar label="Detection" value={scoreData.detection ?? 0} />
                <ScoreBar label="Response" value={scoreData.response ?? 0} />
                <ScoreBar label="Escalation" value={scoreData.escalation ?? 0} />
                <ScoreBar label="Awareness" value={scoreData.awareness ?? 0} />
              </div>

              {scoreData.feedback && (
                <div style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.7, lineHeight: 1.75, marginBottom: 16, padding: '14px 18px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 6 }}>
                  {scoreData.feedback}
                </div>
              )}

              {scoreData.keyStrengths?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Key Strengths</div>
                  {scoreData.keyStrengths.map((s: string, i: number) => (
                    <div key={i} style={{ ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.7, marginBottom: 4, display: 'flex', gap: 8 }}>
                      <span style={{ color: '#00ff41', opacity: 0.5 }}>✓</span> {s}
                    </div>
                  ))}
                </div>
              )}

              {scoreData.areasToImprove?.length > 0 && (
                <div>
                  <div style={{ ...MONO, fontSize: 9, color: '#facc15', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Areas to Improve</div>
                  {scoreData.areasToImprove.map((s: string, i: number) => (
                    <div key={i} style={{ ...MONO, fontSize: 11, color: '#facc15', opacity: 0.7, marginBottom: 4, display: 'flex', gap: 8 }}>
                      <span>△</span> {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => scenario && startScenario(scenario)}
                style={{ ...MONO, flex: 1, fontSize: 11, fontWeight: 600, padding: '11px 18px', background: 'rgba(0,255,65,0.06)', color: '#00ff41', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <RotateCcw size={12} /> Retry Scenario
              </button>
              <button
                onClick={reset}
                style={{ ...MONO, flex: 1, fontSize: 11, fontWeight: 600, padding: '11px 18px', background: '#00ff41', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                New Scenario
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session history */}
      {phase === 'select' && sessions.length > 0 && (
        <div>
          <div style={{ ...MONO, fontSize: 10, color: '#00ff41', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>// Recent Sessions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sessions.slice(0, 5).map((s) => {
              const color = (s.score ?? 0) >= 80 ? '#00ff41' : (s.score ?? 0) >= 60 ? '#facc15' : '#f87171';
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.08)', borderRadius: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}10`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color }}>{s.score ?? 0}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...MONO, fontSize: 11, color: '#c8ffd4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.scenarioTitle}</div>
                    <div style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.35, marginTop: 2 }}>
                      {new Date(s.completedAt).toLocaleDateString()} · {s.verdict === 'pass' ? '✓ passed' : s.verdict === 'review' ? '△ review' : '✗ failed'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
