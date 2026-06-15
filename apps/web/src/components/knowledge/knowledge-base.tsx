'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, File, Trash2, CheckCircle2, AlertCircle, Loader2,
  BookOpen, Search, Library, Tag, Clock, ChevronLeft, ChevronRight,
  Shield, Wifi, Bug, Cloud, Globe, Database, Cpu, Eye, Lock, AlertTriangle,
  Network, Wand2, Sparkles, X,
} from 'lucide-react';
import { cn, formatFileSize, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { KnowledgeDocument } from '@phishforge/shared';
import {
  CYBER_KB, CYBER_KB_CATEGORIES, searchCyberKB, getArticlesByCategory, type CyberKBArticle,
} from '@/lib/knowledge/cyber-kb';
import { KnowledgeGraph } from './knowledge-graph';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'library' | 'graph' | 'search' | 'upload';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/html': ['.html'],
  'text/csv': ['.csv'],
};

const STATUS_CONFIG = {
  uploading: { icon: Loader2, color: '#3b82f6', label: 'Uploading', spin: true },
  processing: { icon: Loader2, color: '#f59e0b', label: 'Processing', spin: true },
  indexed: { icon: CheckCircle2, color: '#00ff41', label: 'Indexed', spin: false },
  failed: { icon: AlertCircle, color: '#ef4444', label: 'Failed', spin: false },
};

const DIFFICULTY_CONFIG = {
  BEGINNER: { label: 'BEGINNER', color: '#00ff41', bg: 'rgba(0,255,65,0.12)' },
  INTERMEDIATE: { label: 'INTERMEDIATE', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  ADVANCED: { label: 'ADVANCED', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const CATEGORY_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  'Phishing & Social Engineering': Shield,
  'Malware & Ransomware': Bug,
  'Incident Response': AlertTriangle,
  'Network Security': Wifi,
  'Identity & Access Management': Lock,
  'Cloud Security': Cloud,
  'Threat Intelligence': Eye,
  'Web Application Security': Globe,
  'Endpoint Security': Cpu,
  'SOC & Detection': Database,
  'Compliance & Governance': BookOpen,
  'Secure Development': File,
};

const AI_TOPICS = [
  'AI-powered social engineering attacks 2025',
  'Post-quantum cryptography migration',
  'GenAI data leakage in enterprise copilots',
  'Browser-in-the-Browser phishing technique',
  'GitHub Actions supply chain security',
  'Passkeys and FIDO2 enterprise deployment',
  'LLM jailbreaking and prompt injection',
  'Ransomware-as-a-Service affiliate model 2025',
  'Mobile device threats iOS Android 2025',
  'Extended Detection and Response XDR',
  'DNS security DoH DoT hijacking',
  'Adversarial AI evading ML security controls',
  'Cloud storage misconfigurations data exposure',
  'Insider threat detection UEBA behavioral analytics',
  'OT ICS cyber threats critical infrastructure',
];

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────

function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const applyInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index} style={{ color: '#e2e8f0', fontWeight: 700 }}>{m[2]}</strong>);
      else if (m[3]) parts.push(<code key={m.index} style={{ background: 'rgba(0,255,65,0.08)', color: '#00ff41', fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.85em', padding: '1px 5px', borderRadius: 3 }}>{m[3]}</code>);
      else if (m[4]) parts.push(<em key={m.index} style={{ color: '#94a3b8' }}>{m[4]}</em>);
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      nodes.push(<h2 key={key++} style={{ color: '#00ff41', fontFamily: 'var(--font-fira-code, monospace)', fontSize: '1.15rem', fontWeight: 700, margin: '28px 0 12px', paddingBottom: 6, borderBottom: '1px solid rgba(0,255,65,0.2)' }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      nodes.push(<h3 key={key++} style={{ color: '#67e8f9', fontFamily: 'var(--font-fira-code, monospace)', fontSize: '1rem', fontWeight: 600, margin: '20px 0 8px' }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('#### ')) {
      nodes.push(<h4 key={key++} style={{ color: '#a78bfa', fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.9rem', fontWeight: 600, margin: '16px 0 6px' }}>{line.slice(5)}</h4>);
    } else if (line.startsWith('---')) {
      nodes.push(<hr key={key++} style={{ border: 'none', borderTop: '1px solid rgba(0,255,65,0.15)', margin: '20px 0' }} />);
    } else if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      nodes.push(<pre key={key++} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 6, padding: '12px 16px', overflowX: 'auto', margin: '12px 0', fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.8rem', color: '#a3e635', lineHeight: 1.6 }}><code>{codeLines.join('\n')}</code></pre>);
    } else if (line.startsWith('|') && i + 1 < lines.length && lines[i + 1].startsWith('|---')) {
      const headers = line.split('|').filter(c => c.trim()).map(c => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i].split('|').filter(c => c.trim()).map(c => c.trim()));
        i++;
      }
      nodes.push(
        <div key={key++} style={{ overflowX: 'auto', margin: '12px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: 'var(--font-fira-code, monospace)' }}>
            <thead><tr>{headers.map((h, j) => <th key={j} style={{ padding: '7px 12px', borderBottom: '1px solid rgba(0,255,65,0.3)', color: '#00ff41', fontWeight: 600, textAlign: 'left', background: 'rgba(0,255,65,0.05)' }}>{applyInline(h)}</th>)}</tr></thead>
            <tbody>{rows.map((row, ri) => <tr key={ri} style={{ borderBottom: '1px solid rgba(0,255,65,0.08)' }}>{row.map((cell, ci) => <td key={ci} style={{ padding: '6px 12px', color: '#94a3b8' }}>{applyInline(cell)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith('> ')) {
      nodes.push(<blockquote key={key++} style={{ borderLeft: '3px solid rgba(0,255,65,0.4)', paddingLeft: 12, margin: '10px 0', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.875rem' }}>{applyInline(line.slice(2))}</blockquote>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [line.slice(2)];
      while (i + 1 < lines.length && (lines[i + 1].startsWith('- ') || lines[i + 1].startsWith('* '))) { i++; items.push(lines[i].slice(2)); }
      nodes.push(<ul key={key++} style={{ margin: '8px 0 8px 18px', padding: 0, listStyle: 'none' }}>{items.map((item, ji) => <li key={ji} style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 2, display: 'flex', gap: 8 }}><span style={{ color: '#00ff41', flexShrink: 0, fontFamily: 'monospace' }}>▸</span>{applyInline(item)}</li>)}</ul>);
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = [line.replace(/^\d+\. /, '')];
      while (i + 1 < lines.length && /^\d+\. /.test(lines[i + 1])) { i++; items.push(lines[i].replace(/^\d+\. /, '')); }
      nodes.push(<ol key={key++} style={{ margin: '8px 0 8px 18px', padding: 0, listStyle: 'none', counterReset: 'item' }}>{items.map((item, ji) => <li key={ji} style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 4, display: 'flex', gap: 10 }}><span style={{ color: '#00ff41', minWidth: 20, fontFamily: 'monospace', fontSize: '0.8rem' }}>{ji + 1}.</span>{applyInline(item)}</li>)}</ol>);
    } else if (line.trim() === '') {
      nodes.push(<div key={key++} style={{ height: 4 }} />);
    } else {
      nodes.push(<p key={key++} style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.75, margin: '4px 0' }}>{applyInline(line)}</p>);
    }

    i++;
  }

  return nodes;
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({ article, onClick, isNew }: { article: CyberKBArticle; onClick: () => void; isNew?: boolean }) {
  const diff = DIFFICULTY_CONFIG[article.difficulty];
  const CatIcon = CATEGORY_ICONS[article.category] ?? BookOpen;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        background: isNew ? 'rgba(167,139,250,0.04)' : 'rgba(0,10,2,0.6)',
        border: isNew ? '1px solid rgba(167,139,250,0.25)' : '1px solid rgba(0,255,65,0.12)',
        borderRadius: 10, padding: '16px', cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s', position: 'relative',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = isNew ? 'rgba(167,139,250,0.5)' : 'rgba(0,255,65,0.35)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 18px rgba(0,255,65,0.06)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = isNew ? 'rgba(167,139,250,0.25)' : 'rgba(0,255,65,0.12)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
    >
      {isNew && (
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 4, padding: '1px 7px' }}>
          <Sparkles size={8} style={{ color: '#a78bfa' }} />
          <span style={{ fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.6rem', color: '#a78bfa', fontWeight: 700 }}>AI</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ padding: 6, background: 'rgba(0,255,65,0.1)', borderRadius: 6, display: 'flex' }}>
          <CatIcon size={13} color="#00ff41" />
        </div>
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-fira-code, monospace)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {article.category}
        </span>
      </div>
      <h3 style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4, marginBottom: 8, fontFamily: 'var(--font-fira-code, monospace)' }}>
        {article.title}
      </h3>
      <p style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {article.summary}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: diff.color, background: diff.bg, padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-fira-code, monospace)' }}>{diff.label}</span>
          <span style={{ fontSize: '0.68rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{article.readingMinutes} min</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {article.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{ fontSize: '0.63rem', color: '#475569', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '1px 6px', borderRadius: 3 }}>{tag}</span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

// ─── Article Reader ───────────────────────────────────────────────────────────

function ArticleReader({ article, onClose }: { article: CyberKBArticle; onClose: () => void }) {
  const diff = DIFFICULTY_CONFIG[article.difficulty];
  const CatIcon = CATEGORY_ICONS[article.category] ?? BookOpen;
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,255,65,0.12)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00ff41', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-fira-code, monospace)' }}>
          <ChevronLeft size={13} /> BACK
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CatIcon size={12} color="#00ff41" />
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-fira-code, monospace)', textTransform: 'uppercase' }}>{article.category}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: diff.color, background: diff.bg, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-fira-code, monospace)' }}>{diff.label}</span>
          <span style={{ fontSize: '0.7rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-fira-code, monospace)' }}><Clock size={11} />{article.readingMinutes} min read</span>
        </div>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 20 }}>
          {article.tags.map(tag => (
            <span key={tag} style={{ fontSize: '0.68rem', color: '#00ff41', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-fira-code, monospace)' }}>
              <Tag size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />{tag}
            </span>
          ))}
        </div>
        <div style={{ maxWidth: 720 }}>{renderMarkdown(article.content)}</div>
        {article.source && (
          <div style={{ marginTop: 32, padding: '10px 14px', background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 6, fontSize: '0.74rem', color: '#475569', fontFamily: 'var(--font-fira-code, monospace)' }}>
            SOURCE: {article.source}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── AI Generate Banner ───────────────────────────────────────────────────────

function AIGenerateBanner({ onGenerated }: { onGenerated: (article: CyberKBArticle) => void }) {
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  async function generate() {
    setGenerating(true);
    const chosenTopic = topic.trim() || AI_TOPICS[Math.floor(Math.random() * AI_TOPICS.length)];
    try {
      const res = await fetch('/api/knowledge/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: chosenTopic, category: 'Threat Intelligence' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onGenerated(data.article);
      setTopic('');
      toast.success('AI article generated!');
    } catch (e: any) {
      toast.error(e.message ?? 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(167,139,250,0.04)',
        border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: 10, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wand2 size={13} style={{ color: '#a78bfa' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa' }}>AI Article Generator</span>
      </div>
      <input
        value={topic}
        onChange={e => setTopic(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !generating && generate()}
        placeholder="Topic (leave blank for random 2025 threat)…"
        style={{
          flex: 1, minWidth: 200,
          background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: 6, padding: '7px 12px',
          fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.78rem',
          color: '#c8ffd4', outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.5)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(167,139,250,0.2)'; }}
      />
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={generate}
          disabled={generating}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: generating ? 'rgba(167,139,250,0.1)' : '#a78bfa',
            color: generating ? '#a78bfa' : '#000',
            border: 'none', borderRadius: 6, padding: '7px 16px',
            fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.78rem', fontWeight: 700,
            cursor: generating ? 'not-allowed' : 'pointer', transition: 'all 150ms',
          }}
        >
          {generating
            ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
            : <><Sparkles size={12} /> Generate</>}
        </button>
        <button
          onClick={() => setVisible(false)}
          style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px 6px', borderRadius: 4 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
        >
          <X size={13} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function KnowledgeBase({ documents: initialDocs }: { documents: KnowledgeDocument[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<CyberKBArticle | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [aiArticles, setAiArticles] = useState<CyberKBArticle[]>([]);

  // Upload tab state
  const [documents, setDocuments] = useState(initialDocs);
  const [uploading, setUploading] = useState(false);

  // Semantic search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // All articles (AI-generated first, then static)
  const allArticles = [...aiArticles, ...CYBER_KB];

  // ── Library filtering
  const filteredArticles = (() => {
    const q = librarySearch.toLowerCase();
    const terms = q.split(/\s+/).filter(t => t.length > 2);
    return allArticles.filter(a => {
      if (selectedCategory && a.category !== selectedCategory) return false;
      if (terms.length === 0) return true;
      const text = [a.title, a.summary, a.content, ...a.tags, a.category].join(' ').toLowerCase();
      return terms.some(t => text.includes(t));
    });
  })();

  const categoryStats = allArticles.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});

  // ── Upload handlers
  const onDrop = useCallback(async (files: File[]) => {
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) { toast.error(`${file.name} exceeds the 50MB limit`); continue; }
      await uploadFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: ACCEPTED_TYPES, multiple: true });

  async function uploadFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/knowledge/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const { document } = await res.json();
      setDocuments(prev => [document, ...prev]);
      toast.success(`${file.name} uploaded and processing`);
    } catch {
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(id: string, name: string) {
    if (!confirm(`Delete "${name}"? Indexed vectors will also be removed.`)) return;
    try {
      await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success(`${name} deleted`);
    } catch {
      toast.error('Failed to delete document');
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/knowledge/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const results = await res.json();
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  }

  function handleGraphArticleSelect(article: CyberKBArticle) {
    setSelectedArticle(article);
    setActiveTab('library');
  }

  // ─── Tabs ──────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: React.FC<{ size?: number }> }[] = [
    { key: 'library', label: 'Article Library', icon: Library },
    { key: 'graph',   label: 'Graph View',      icon: Network },
    { key: 'search',  label: 'Vector Search',   icon: Search },
    { key: 'upload',  label: 'Upload Docs',      icon: Upload },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats Banner */}
      <div style={{ background: 'rgba(0,10,2,0.7)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
        {[
          { label: 'Articles', value: allArticles.length },
          { label: 'AI Generated', value: aiArticles.length },
          { label: 'Categories', value: CYBER_KB_CATEGORIES.length },
          { label: 'My Documents', value: documents.length },
          { label: 'Indexed Docs', value: documents.filter(d => d.status === 'indexed').length },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: label === 'AI Generated' ? '#a78bfa' : '#00ff41', fontFamily: 'var(--font-fira-code, monospace)', lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'var(--font-fira-code, monospace)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#1a6b2f', fontFamily: 'var(--font-fira-code, monospace)', background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)', padding: '4px 10px', borderRadius: 5 }}>
          ◉ KNOWLEDGE BASE ONLINE
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 10, padding: 4 }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSelectedArticle(null); }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '9px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.8rem', fontWeight: 500,
              transition: 'all 0.15s',
              background: activeTab === key ? (key === 'graph' ? 'rgba(96,165,250,0.12)' : 'rgba(0,255,65,0.12)') : 'transparent',
              color: activeTab === key ? (key === 'graph' ? '#60a5fa' : '#00ff41') : '#475569',
              boxShadow: activeTab === key
                ? key === 'graph'
                  ? '0 0 12px rgba(96,165,250,0.08), inset 0 0 0 1px rgba(96,165,250,0.2)'
                  : '0 0 12px rgba(0,255,65,0.08), inset 0 0 0 1px rgba(0,255,65,0.2)'
                : 'none',
            }}
          >
            <Icon size={14} />
            {label}
            {key === 'graph' && (
              <span style={{ fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.58rem', color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>NEW</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">

        {/* ── Library ── */}
        {activeTab === 'library' && (
          <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* AI Generate Banner */}
              <AIGenerateBanner onGenerated={article => setAiArticles(prev => [article, ...prev])} />

              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, minHeight: 600 }}>
                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                    <input
                      value={librarySearch}
                      onChange={e => { setLibrarySearch(e.target.value); setSelectedArticle(null); }}
                      placeholder="Filter articles…"
                      style={{ width: '100%', padding: '8px 10px 8px 30px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 7, color: '#e2e8f0', fontSize: '0.78rem', fontFamily: 'var(--font-fira-code, monospace)', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(0,255,65,0.4)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(0,255,65,0.15)'; }}
                    />
                  </div>

                  <button
                    onClick={() => { setSelectedCategory(null); setSelectedArticle(null); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 11px', borderRadius: 7, border: '1px solid', borderColor: selectedCategory === null ? 'rgba(0,255,65,0.35)' : 'rgba(0,255,65,0.08)', background: selectedCategory === null ? 'rgba(0,255,65,0.1)' : 'rgba(0,0,0,0.3)', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{ fontSize: '0.75rem', color: selectedCategory === null ? '#00ff41' : '#94a3b8', fontFamily: 'var(--font-fira-code, monospace)', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Library size={12} /> All Articles
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#475569', background: 'rgba(0,0,0,0.4)', padding: '1px 5px', borderRadius: 3 }}>{allArticles.length}</span>
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {CYBER_KB_CATEGORIES.map(cat => {
                      const CatIcon = CATEGORY_ICONS[cat] ?? BookOpen;
                      const count = categoryStats[cat] ?? 0;
                      const active = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => { setSelectedCategory(cat); setSelectedArticle(null); }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 6, border: '1px solid', borderColor: active ? 'rgba(0,255,65,0.3)' : 'transparent', background: active ? 'rgba(0,255,65,0.08)' : 'transparent', cursor: 'pointer', width: '100%', transition: 'all 0.15s' }}
                          onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,65,0.04)'; }}
                          onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                        >
                          <span style={{ fontSize: '0.72rem', color: active ? '#00ff41' : '#64748b', fontFamily: 'var(--font-fira-code, monospace)', display: 'flex', alignItems: 'center', gap: 7, textAlign: 'left' }}>
                            <CatIcon size={11} color={active ? '#00ff41' : '#475569'} />{cat}
                          </span>
                          <span style={{ fontSize: '0.62rem', color: '#334155', background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: 3, flexShrink: 0 }}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main area: grid or reader */}
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 10, overflow: 'hidden', minHeight: 600 }}>
                  <AnimatePresence mode="wait">
                    {selectedArticle ? (
                      <ArticleReader key={selectedArticle.id} article={selectedArticle} onClose={() => setSelectedArticle(null)} />
                    ) : (
                      <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ padding: 16, overflowY: 'auto', maxHeight: 720 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <span style={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'var(--font-fira-code, monospace)' }}>
                            {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
                            {selectedCategory ? ` in ${selectedCategory}` : ''}
                            {librarySearch ? ` matching "${librarySearch}"` : ''}
                          </span>
                          <ChevronRight size={14} color="#334155" />
                        </div>
                        {filteredArticles.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#334155' }}>
                            <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                            <p style={{ fontSize: '0.85rem', fontFamily: 'var(--font-fira-code, monospace)' }}>No articles found</p>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                            {filteredArticles.map(article => (
                              <ArticleCard
                                key={article.id}
                                article={article}
                                onClick={() => setSelectedArticle(article)}
                                isNew={aiArticles.some(a => a.id === article.id)}
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Graph View ── */}
        {activeTab === 'graph' && (
          <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 10, overflow: 'hidden', minHeight: 680 }}>
              <KnowledgeGraph
                articles={allArticles}
                onBack={() => setActiveTab('library')}
                onSelectArticle={handleGraphArticleSelect}
              />
            </div>
          </motion.div>
        )}

        {/* ── Vector Search ── */}
        {activeTab === 'search' && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 10, padding: 20 }}>
                <h2 style={{ color: '#00ff41', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-fira-code, monospace)', marginBottom: 6 }}>Vector Semantic Search</h2>
                <p style={{ fontSize: '0.78rem', color: '#475569', marginBottom: 16, lineHeight: 1.5 }}>
                  Search across your uploaded documents using AI-powered semantic similarity.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Search your uploaded knowledge base…"
                    style={{ flex: 1, padding: '10px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 7, color: '#e2e8f0', fontSize: '0.85rem', fontFamily: 'var(--font-fira-code, monospace)', outline: 'none' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(0,255,65,0.5)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(0,255,65,0.2)'; }}
                  />
                  <button
                    onClick={handleSearch} disabled={searching}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'rgba(0,255,65,0.12)', border: '1px solid rgba(0,255,65,0.3)', borderRadius: 7, color: '#00ff41', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-fira-code, monospace)', cursor: searching ? 'not-allowed' : 'pointer', opacity: searching ? 0.6 : 1, transition: 'all 0.15s' }}
                  >
                    {searching ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
                    {searching ? 'Searching…' : 'Search'}
                  </button>
                </div>
              </div>
              {searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'var(--font-fira-code, monospace)' }}>{searchResults.length} RESULTS</div>
                  {searchResults.map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', fontFamily: 'var(--font-fira-code, monospace)' }}>{r.metadata?.document_name ?? 'Document'}</span>
                        <span style={{ fontSize: '0.72rem', color: '#00ff41', fontFamily: 'var(--font-fira-code, monospace)', background: 'rgba(0,255,65,0.1)', padding: '2px 7px', borderRadius: 4 }}>{Math.round(r.score * 100)}% match</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>{r.text?.slice(0, 220)}…</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Upload ── */}
        {activeTab === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 10, padding: 20 }}>
                <h2 style={{ color: '#00ff41', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-fira-code, monospace)', marginBottom: 4 }}>Upload Company Documents</h2>
                <p style={{ fontSize: '0.78rem', color: '#475569', marginBottom: 16, lineHeight: 1.5 }}>
                  Upload internal documents to personalize AI phishing simulations with your organization's context.
                </p>
                <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? 'rgba(0,255,65,0.6)' : 'rgba(0,255,65,0.2)'}`, borderRadius: 10, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'rgba(0,255,65,0.04)' : 'transparent', transition: 'all 0.2s' }}>
                  <input {...getInputProps()} />
                  <div style={{ padding: 14, background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 50 }}>
                    <Upload size={22} color="#00ff41" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', fontFamily: 'var(--font-fira-code, monospace)' }}>{isDragActive ? 'DROP FILES HERE…' : 'DRAG & DROP OR CLICK TO BROWSE'}</p>
                    <p style={{ fontSize: '0.73rem', color: '#475569', marginTop: 4 }}>PDF, DOCX, TXT, HTML, CSV · Max 50MB each</p>
                  </div>
                  {uploading && <Loader2 size={18} color="#00ff41" style={{ animation: 'spin 1s linear infinite' }} />}
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(0,255,65,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', fontFamily: 'var(--font-fira-code, monospace)' }}>INDEXED DOCUMENTS ({documents.length})</span>
                </div>
                {documents.length === 0 ? (
                  <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <BookOpen size={28} color="#1e293b" style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontSize: '0.82rem', color: '#334155', fontFamily: 'var(--font-fira-code, monospace)' }}>No documents yet. Upload some to personalize simulations.</p>
                  </div>
                ) : (
                  <div>
                    {documents.map(doc => {
                      const status = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.failed;
                      const Icon = status.icon;
                      return (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid rgba(0,255,65,0.06)' }}>
                          <div style={{ padding: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 6 }}>
                            <File size={14} color="#475569" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 500, fontFamily: 'var(--font-fira-code, monospace)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#334155', fontFamily: 'var(--font-fira-code, monospace)', marginTop: 2 }}>
                              {doc.file_size ? formatFileSize(doc.file_size) : ''} · {formatDate(doc.created_at)}
                              {(doc as any).chunk_count > 0 && ` · ${(doc as any).chunk_count} chunks`}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, color: status.color, fontFamily: 'var(--font-fira-code, monospace)' }}>
                            <Icon size={12} style={status.spin ? { animation: 'spin 1s linear infinite' } : {}} />{status.label}
                          </div>
                          <button onClick={() => deleteDocument(doc.id, doc.name)} style={{ padding: '6px 8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#334155', borderRadius: 5, transition: 'color 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#334155'; }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
