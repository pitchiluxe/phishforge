'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue } from 'framer-motion';
import {
  Brain, X, Minus, Maximize2, Minimize2, Search, ExternalLink, Send, Loader2,
  Plus, Trash2, ChevronRight, BookOpen, MessageSquare, Tag, GripVertical, Sparkles,
} from 'lucide-react';
import { searchCyberArticles, getArticleCategories, type CyberArticle } from '@/lib/cyber-articles';
import toast from 'react-hot-toast';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;
const G = '#00ff41';
const PANEL_W = 420;

type PanelMode = 'docked' | 'detached' | 'minimized';
type ActiveTab = 'sources' | 'chat';

interface Message { role: 'user' | 'assistant'; content: string; ts: number; }
interface ImportedSource { article: CyberArticle; addedAt: number; }

interface CyberBrainPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TOPICS = [
  'Phishing', 'Ransomware', 'Zero Trust', 'MITRE ATT&CK',
  'Cloud Security', 'Incident Response', 'OSINT', 'Malware',
];

const QUICK_PROMPTS = [
  'Explain phishing-resistant MFA',
  'What is MITRE ATT&CK?',
  'How do I respond to ransomware?',
  'Difference between EDR and AV?',
  'Explain Zero Trust architecture',
];

function sanitize(s: string) {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function MessageContent({ content }: { content: string }) {
  return (
    <div style={{ fontSize: 12, lineHeight: 1.65, ...MONO }}>
      {content.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 5 }} />;
        if (line.startsWith('## ')) return <div key={i} style={{ fontWeight: 700, color: G, fontSize: 13, marginTop: 8 }}>{line.slice(3)}</div>;
        if (line.startsWith('### ')) return <div key={i} style={{ fontWeight: 600, color: '#60a5fa', marginTop: 6 }}>{line.slice(4)}</div>;
        if (line.startsWith('- ') || line.startsWith('* ')) return (
          <div key={i} style={{ display: 'flex', gap: 6, paddingLeft: 4 }}>
            <span style={{ color: G, flexShrink: 0 }}>›</span>
            <span style={{ color: '#94a3b8' }}>{line.slice(2)}</span>
          </div>
        );
        if (/^\d+\./.test(line)) return <div key={i} style={{ paddingLeft: 12, color: '#94a3b8' }}>{line}</div>;
        if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 700, color: '#e2e8f0' }}>{line.slice(2, -2)}</div>;
        return <div key={i} style={{ color: '#cbd5e1' }}>{line}</div>;
      })}
    </div>
  );
}

// ── Article Card ─────────────────────────────────────────────────────────────
function ArticleCard({ article, imported, onAdd, onRemove }: {
  article: CyberArticle; imported: boolean;
  onAdd: (a: CyberArticle) => void; onRemove: (id: string) => void;
}) {
  return (
    <div style={{
      background: imported ? 'rgba(0,255,65,0.05)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${imported ? 'rgba(0,255,65,0.2)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 7, padding: '9px 11px', marginBottom: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...MONO, fontSize: 11, fontWeight: 600, color: '#e2e8f0', marginBottom: 2, lineHeight: 1.4 }}>
            {article.title}
          </div>
          <div style={{ ...MONO, fontSize: 9, color: G, opacity: 0.7, marginBottom: 4 }}>
            {article.source} · {article.category}
          </div>
          <div style={{ ...MONO, fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>
            {article.summary.slice(0, 110)}...
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
            {article.keyTopics.slice(0, 4).map(t => (
              <span key={t} style={{ ...MONO, fontSize: 9, color: G, background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 3, padding: '1px 5px' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => imported ? onRemove(article.id) : onAdd(article)}
            style={{
              background: imported ? 'rgba(248,113,113,0.1)' : 'rgba(0,255,65,0.1)',
              border: `1px solid ${imported ? 'rgba(248,113,113,0.3)' : 'rgba(0,255,65,0.3)'}`,
              color: imported ? '#f87171' : G, borderRadius: 4, padding: '3px 6px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, ...MONO, fontSize: 9,
            }}
          >
            {imported ? <><Trash2 size={9} />Remove</> : <><Plus size={9} />Add</>}
          </button>
          <a href={article.url} target="_blank" rel="noopener noreferrer"
            style={{ color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px 0' }}>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export function CyberBrainPanel({ isOpen, onClose }: CyberBrainPanelProps) {
  const [mode, setMode] = useState<PanelMode>('docked');
  const [activeTab, setActiveTab] = useState<ActiveTab>('sources');
  const [importedSources, setImportedSources] = useState<ImportedSource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const panelX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth - PANEL_W - 40 : 800);
  const panelY = useMotionValue(60);

  useEffect(() => {
    if (mode === 'detached' && typeof window !== 'undefined') {
      panelX.set(window.innerWidth - PANEL_W - 40);
      panelY.set(60);
    }
  }, [mode]);

  const categories = getArticleCategories();
  const filteredArticles = searchCyberArticles(searchQuery, selectedCategory || undefined);
  const importedIds = new Set(importedSources.map(s => s.article.id));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addSource = useCallback((article: CyberArticle) => {
    if (importedIds.has(article.id)) return;
    setImportedSources(prev => [{ article, addedAt: Date.now() }, ...prev]);
    toast.success(`Added: ${article.title.slice(0, 40)}`, { style: { background: '#0a0a0a', color: G, border: '1px solid rgba(0,255,65,0.2)' } });
  }, [importedIds]);

  const removeSource = useCallback((id: string) => {
    setImportedSources(prev => prev.filter(s => s.article.id !== id));
  }, []);

  const importByTopic = useCallback((topic: string) => {
    const articles = searchCyberArticles(topic).slice(0, 3);
    let added = 0;
    articles.forEach(a => {
      if (!importedIds.has(a.id)) {
        setImportedSources(prev => [{ article: a, addedAt: Date.now() }, ...prev]);
        added++;
      }
    });
    if (added > 0) {
      toast.success(`Imported ${added} ${topic} articles`, { style: { background: '#0a0a0a', color: G, border: '1px solid rgba(0,255,65,0.2)' } });
      setActiveTab('sources');
    }
  }, [importedIds]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          sources: importedSources.map(s => s.article),
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: sanitize(data.message), ts: Date.now() }]);
      } else {
        throw new Error(data.error || 'No response');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CyberBrain error';
      toast.error(msg, { style: { background: '#0a0a0a', color: '#f87171' } });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, importedSources]);

  const handleClose = () => {
    setMode('docked');
    onClose();
  };

  // Don't render when closed and not minimized
  if (!isOpen && mode !== 'minimized') return null;

  // ── Minimized pill ──────────────────────────────────────────────────────────
  if (mode === 'minimized') {
    return (
      <motion.button
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={() => setMode('docked')}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#030303', border: `1px solid ${G}`,
          borderRadius: 24, padding: '10px 16px', cursor: 'pointer',
          boxShadow: `0 0 20px rgba(0,255,65,0.2), 0 4px 24px rgba(0,0,0,0.6)`,
        }}
      >
        <Brain size={15} style={{ color: G, filter: `drop-shadow(0 0 6px ${G})` }} />
        <span style={{ ...MONO, fontSize: 12, color: G, fontWeight: 700 }}>CyberBrain</span>
        {importedSources.length > 0 && (
          <span style={{ background: G, color: '#000', borderRadius: 10, padding: '1px 6px', fontSize: 10, ...MONO, fontWeight: 700 }}>
            {importedSources.length}
          </span>
        )}
        <Maximize2 size={12} style={{ color: '#475569' }} />
      </motion.button>
    );
  }

  // ── Shared panel content ────────────────────────────────────────────────────
  const header = (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px',
        borderBottom: '1px solid rgba(0,255,65,0.1)', flexShrink: 0, userSelect: 'none',
        cursor: mode === 'detached' ? 'grab' : 'default',
      }}
      onPointerDown={mode === 'detached' ? e => dragControls.start(e) : undefined}
    >
      {mode === 'detached' && <GripVertical size={13} style={{ color: '#334155', flexShrink: 0 }} />}
      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Brain size={14} style={{ color: G }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...MONO, fontSize: 12, fontWeight: 700, color: G }}>CyberBrain</div>
        <div style={{ ...MONO, fontSize: 9, color: '#334155' }}>
          {importedSources.length > 0 ? `${importedSources.length} sources imported` : 'No sources — answers from training data'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }} onPointerDown={e => e.stopPropagation()}>
        <button onClick={() => setMode('minimized')} title="Minimize" style={iconBtn}><Minus size={11} /></button>
        {mode === 'docked' && (
          <button onClick={() => setMode('detached')} title="Float panel" style={iconBtn}><Maximize2 size={11} /></button>
        )}
        {mode === 'detached' && (
          <button onClick={() => setMode('docked')} title="Dock panel" style={iconBtn}><Minimize2 size={11} /></button>
        )}
        <button onClick={handleClose} title="Close" style={{ ...iconBtn, color: '#f87171', borderColor: 'rgba(248,113,113,0.2)' }}><X size={11} /></button>
      </div>
    </div>
  );

  const tabs = (
    <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,255,65,0.08)', flexShrink: 0 }}>
      {(['sources', 'chat'] as ActiveTab[]).map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)} style={{
          flex: 1, padding: '8px 0', background: activeTab === tab ? 'rgba(0,255,65,0.05)' : 'transparent',
          border: 'none', borderBottom: `2px solid ${activeTab === tab ? G : 'transparent'}`,
          color: activeTab === tab ? G : '#334155', cursor: 'pointer',
          ...MONO, fontSize: 11, fontWeight: activeTab === tab ? 600 : 400,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s',
        }}>
          {tab === 'sources' ? <BookOpen size={11} /> : <MessageSquare size={11} />}
          {tab === 'sources' ? 'Sources' : 'Chat'}
          {tab === 'sources' && importedSources.length > 0 && (
            <span style={{ background: G, color: '#000', borderRadius: 8, padding: '0 4px', fontSize: 9, ...MONO, fontWeight: 700, lineHeight: '14px' }}>
              {importedSources.length}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  const sourcesTab = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Quick topics */}
      <div style={{ padding: '10px 12px 6px', flexShrink: 0 }}>
        <div style={{ ...MONO, fontSize: 9, color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          // Quick Import
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {QUICK_TOPICS.map(t => (
            <button key={t} onClick={() => importByTopic(t)}
              style={{ ...MONO, fontSize: 10, color: '#64748b', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.color = G; e.currentTarget.style.borderColor = 'rgba(0,255,65,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 6 }}>
          <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search articles..."
            style={{ width: '100%', padding: '6px 8px 6px 26px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5, color: '#e2e8f0', ...MONO, fontSize: 11, boxSizing: 'border-box', outline: 'none' }} />
        </div>
        {/* Category pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {['', ...categories.slice(0, 5)].map(c => (
            <button key={c || 'all'} onClick={() => setSelectedCategory(c === selectedCategory ? '' : c)}
              style={{ ...MONO, fontSize: 9, background: selectedCategory === c ? 'rgba(0,255,65,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedCategory === c ? 'rgba(0,255,65,0.3)' : 'rgba(255,255,255,0.06)'}`, color: selectedCategory === c ? G : '#475569', borderRadius: 3, padding: '2px 7px', cursor: 'pointer' }}>
              {c || 'All'}
            </button>
          ))}
        </div>
      </div>
      {/* Article list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
        {importedSources.length > 0 && (
          <>
            <div style={{ ...MONO, fontSize: 9, color: G, opacity: 0.6, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>// Imported ({importedSources.length})</span>
              <button onClick={() => setImportedSources([])} style={{ ...MONO, fontSize: 9, color: '#334155', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Trash2 size={9} /> Clear
              </button>
            </div>
            {importedSources.map(s => (
              <ArticleCard key={s.article.id} article={s.article} imported onAdd={addSource} onRemove={removeSource} />
            ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '8px 0' }} />
          </>
        )}
        <div style={{ ...MONO, fontSize: 9, color: '#334155', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          // All Articles ({filteredArticles.filter(a => !importedIds.has(a.id)).length})
        </div>
        {filteredArticles.filter(a => !importedIds.has(a.id)).map(a => (
          <ArticleCard key={a.id} article={a} imported={false} onAdd={addSource} onRemove={removeSource} />
        ))}
      </div>
    </div>
  );

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  const chatTab = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Chat toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', flexShrink: 0, borderBottom: '1px solid rgba(0,255,65,0.05)', minHeight: 32 }}>
        {importedSources.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sparkles size={11} style={{ color: G, flexShrink: 0 }} />
            <span style={{ ...MONO, fontSize: 10, color: '#4ade80' }}>Grounded in {importedSources.length} source{importedSources.length > 1 ? 's' : ''}</span>
          </div>
        ) : (
          <span style={{ ...MONO, fontSize: 9, color: '#1e293b' }}>CyberBrain Chat</span>
        )}
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            title="Delete chat history"
            style={{ ...MONO, fontSize: 9, color: '#f87171', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 120ms' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.14)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.06)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.15)'; }}
          >
            <Trash2 size={9} /> Delete chat
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Brain size={28} style={{ color: G, opacity: 0.25, margin: '0 auto 8px' }} />
            <div style={{ ...MONO, fontSize: 11, color: '#334155', marginBottom: 12 }}>Ask CyberBrain anything about cybersecurity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {QUICK_PROMPTS.map(q => (
                <button key={q} onClick={() => setInput(q)} style={{ ...MONO, fontSize: 10, color: '#475569', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, padding: '6px 10px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.color = G; e.currentTarget.style.borderColor = 'rgba(0,255,65,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <ChevronRight size={10} style={{ color: G, flexShrink: 0 }} />{q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '92%', padding: '8px 12px',
              borderRadius: m.role === 'user' ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
              background: m.role === 'user' ? 'rgba(0,255,65,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${m.role === 'user' ? 'rgba(0,255,65,0.18)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              {m.role === 'assistant' ? <MessageContent content={m.content} /> : (
                <span style={{ ...MONO, fontSize: 12, color: '#e2e8f0' }}>{m.content}</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
            <Loader2 size={12} style={{ color: G, animation: 'spin 1s linear infinite' }} />
            <span style={{ ...MONO, fontSize: 11, color: '#334155' }}>CyberBrain thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      {/* Quick prompts row */}
      <div style={{ padding: '6px 12px', flexShrink: 0, display: 'flex', gap: 5, overflowX: 'auto' }}>
        {QUICK_PROMPTS.slice(0, 4).map(q => (
          <button key={q} onClick={() => setInput(q)} style={{ ...MONO, fontSize: 9, color: '#334155', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {q.split(' ').slice(0, 3).join(' ')}...
          </button>
        ))}
      </div>
      {/* Input */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(0,255,65,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={importedSources.length > 0 ? `Ask about your ${importedSources.length} sources…` : 'Ask about cybersecurity…'}
            disabled={loading}
            rows={1}
            style={{ flex: 1, padding: '7px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0', ...MONO, fontSize: 11, outline: 'none', resize: 'none', overflowY: 'hidden' }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{ background: loading || !input.trim() ? 'rgba(0,255,65,0.08)' : G, border: 'none', borderRadius: 6, padding: '7px 10px', cursor: loading || !input.trim() ? 'default' : 'pointer', color: loading || !input.trim() ? G : '#000', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
          </button>
        </div>
        <p style={{ ...MONO, fontSize: 9, color: '#1e293b', marginTop: 4, textAlign: 'center' }}>Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );

  const panelInner = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#030303' }}>
      {header}
      {tabs}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'sources' ? sourcesTab : chatTab}
      </div>
    </div>
  );

  // ── Docked: fixed right-side panel (slides in) ──────────────────────────────
  if (mode === 'docked') {
    return (
      <AnimatePresence>
        <motion.div
          key="brain-docked"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          style={{
            position: 'fixed', right: 0, top: 0, height: '100vh', zIndex: 40,
            width: PANEL_W, borderLeft: '1px solid rgba(0,255,65,0.15)',
            boxShadow: '-4px 0 30px rgba(0,255,65,0.06), -4px 0 60px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {panelInner}
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Detached: floating draggable window ─────────────────────────────────────
  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      style={{
        position: 'fixed', zIndex: 60, x: panelX, y: panelY,
        width: PANEL_W, height: 600,
        border: '1px solid rgba(0,255,65,0.25)',
        borderRadius: 10,
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,255,65,0.08)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}
    >
      {panelInner}
    </motion.div>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#64748b', borderRadius: 4, padding: '3px 5px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', lineHeight: 1,
};
