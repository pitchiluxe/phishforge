'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { FileText, Shield, Sparkles, X, Mail, User, Copy, Check, ArrowRight } from 'lucide-react';

const MONO = { fontFamily: 'var(--font-fira-code), monospace' } as const;

export interface TemplateItem {
  id: string;
  name: string;
  subject?: string;
  description?: string;
  industry?: string;
  difficulty?: number;
  safety_score?: number;
  ai_generated?: boolean;
  is_public?: boolean;
  body_html?: string;
  body_text?: string;
  sender_name?: string;
  sender_email?: string;
  created_at: string;
}

function TemplateModal({ template, onClose }: { template: TemplateItem; onClose: () => void }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    setMounted(true);
    // Lock scroll on the dashboard's scrollable main element and document body
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Also lock the nearest overflowY:auto ancestor (the dashboard <main>)
    const main = document.querySelector('main') as HTMLElement | null;
    const prevMain = main?.style.overflow ?? '';
    if (main) main.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeRef.current(); }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      if (main) main.style.overflow = prevMain;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  function copySubject() {
    if (template.subject) navigator.clipboard.writeText(template.subject);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const safe = (template.safety_score ?? 0) >= 70;

  const modal = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#0a0a0a', border: '1px solid rgba(0,255,65,0.25)',
        borderRadius: 8, width: '100%', maxWidth: 640,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 60px rgba(0,255,65,0.08)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid rgba(0,255,65,0.1)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={13} style={{ color: '#00ff41', opacity: 0.7 }} />
            <span style={{ ...MONO, fontSize: 12, fontWeight: 700, color: '#c8ffd4' }}>{template.name}</span>
            {template.ai_generated && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.6, border: '1px solid rgba(0,255,65,0.2)', borderRadius: 3, padding: '1px 5px' }}>
                <Sparkles size={8} /> AI
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#00ff41', opacity: 0.4, cursor: 'pointer', padding: 4, lineHeight: 1, minHeight: 'unset', minWidth: 'unset' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Meta row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {template.industry && (
              <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.5, border: '1px solid rgba(0,255,65,0.15)', borderRadius: 3, padding: '2px 7px', textTransform: 'capitalize' }}>
                {template.industry}
              </span>
            )}
            {template.difficulty && (
              <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, border: '1px solid rgba(0,255,65,0.12)', borderRadius: 3, padding: '2px 7px' }}>
                difficulty {template.difficulty}/5
              </span>
            )}
            {template.safety_score != null && (
              <span style={{
                ...MONO, fontSize: 9,
                color: safe ? '#00ff41' : '#facc15',
                background: safe ? 'rgba(0,255,65,0.07)' : 'rgba(250,204,21,0.07)',
                border: `1px solid ${safe ? 'rgba(0,255,65,0.2)' : 'rgba(250,204,21,0.2)'}`,
                borderRadius: 3, padding: '2px 7px',
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}>
                <Shield size={9} /> Safety {template.safety_score}/100
              </span>
            )}
          </div>

          {/* Sender */}
          {(template.sender_name || template.sender_email) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.08)', borderRadius: 5 }}>
              <User size={11} style={{ color: '#00ff41', opacity: 0.5, flexShrink: 0 }} />
              <span style={{ ...MONO, fontSize: 11, color: '#c8ffd4' }}>
                {template.sender_name ?? ''} {template.sender_email ? `<${template.sender_email}>` : ''}
              </span>
            </div>
          )}

          {/* Subject */}
          {template.subject && (
            <div style={{ padding: '10px 12px', background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.08)', borderRadius: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={11} style={{ color: '#00ff41', opacity: 0.5 }} />
                  <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Subject</span>
                </div>
                <button
                  onClick={copySubject}
                  style={{ background: 'none', border: 'none', color: '#00ff41', opacity: 0.4, cursor: 'pointer', padding: 2, lineHeight: 1, minHeight: 'unset', minWidth: 'unset' }}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                </button>
              </div>
              <span style={{ fontSize: 12, color: '#c8ffd4' }}>{template.subject}</span>
            </div>
          )}

          {/* Body preview */}
          {(template.body_html || template.body_text || template.description) && (
            <div style={{ padding: '12px 14px', background: 'rgba(0,255,65,0.015)', border: '1px solid rgba(0,255,65,0.08)', borderRadius: 5 }}>
              <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                Body Preview
              </span>
              {template.body_html ? (
                <div
                  style={{ fontSize: 12, color: '#c8ffd4', lineHeight: 1.7, maxHeight: 300, overflowY: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: template.body_html }}
                />
              ) : (
                <p style={{ fontSize: 12, color: '#c8ffd4', opacity: 0.7, lineHeight: 1.7, margin: 0 }}>
                  {template.body_text ?? template.description ?? 'No preview available'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(0,255,65,0.1)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '9px 0', background: 'none',
              border: '1px solid rgba(0,255,65,0.2)', borderRadius: 5,
              ...MONO, fontSize: 11, color: '#00ff41', opacity: 0.6,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={() => router.push('/dashboard/campaigns/new')}
            style={{
              flex: 2, padding: '9px 0',
              background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)',
              borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              ...MONO, fontSize: 11, color: '#00ff41', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Use in Campaign <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}

const INDUSTRIES = ['all', 'technology', 'finance', 'hr', 'healthcare', 'legal', 'retail', 'government', 'education'];

export function TemplateGrid({ templates }: { templates: TemplateItem[] }) {
  const [selected, setSelected] = useState<TemplateItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');

  const visible = templates.filter(t => {
    const q = search.toLowerCase();
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q) || (t.subject ?? '').toLowerCase().includes(q);
    const matchesIndustry = filterIndustry === 'all' || t.industry === filterIndustry || t.industry === 'all';
    return matchesSearch && matchesIndustry;
  });

  return (
    <>
      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates..."
          style={{
            flex: '1 1 200px', minWidth: 160, padding: '7px 12px',
            background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.15)',
            borderRadius: 4, color: '#c8ffd4', fontSize: 12,
            fontFamily: 'var(--font-fira-code), monospace', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              onClick={() => setFilterIndustry(ind)}
              style={{
                padding: '4px 10px', borderRadius: 3, cursor: 'pointer', fontSize: 10,
                fontFamily: 'var(--font-fira-code), monospace', textTransform: 'capitalize',
                border: `1px solid ${filterIndustry === ind ? 'rgba(0,255,65,0.5)' : 'rgba(0,255,65,0.15)'}`,
                background: filterIndustry === ind ? 'rgba(0,255,65,0.12)' : 'transparent',
                color: filterIndustry === ind ? '#00ff41' : 'rgba(0,255,65,0.45)',
                minHeight: 'unset', minWidth: 'unset',
              }}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-fira-code), monospace', fontSize: 11, color: '#00ff41', opacity: 0.4 }}>
          No templates match your search
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {visible.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelected(t)}
            style={{
              background: 'rgba(0,255,65,0.025)',
              border: '1px solid rgba(0,255,65,0.15)',
              borderRadius: 6, padding: '16px 18px',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(0,255,65,0.03)',
              transition: 'border-color 150ms, box-shadow 150ms',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,255,65,0.35)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px rgba(0,255,65,0.06)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,255,65,0.15)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 16px rgba(0,255,65,0.03)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={13} style={{ color: '#00ff41', opacity: 0.6 }} />
                <span style={{ ...MONO, fontSize: 12, fontWeight: 600, color: '#c8ffd4' }}>{t.name}</span>
              </div>
              {t.ai_generated && <Sparkles size={11} style={{ color: '#00ff41', opacity: 0.7 }} aria-label="AI Generated" />}
            </div>

            <p style={{
              fontSize: 11, color: '#00ff41', opacity: 0.45, lineHeight: 1.6, marginBottom: 12,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {t.description ?? t.subject ?? 'No preview'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {t.industry && (
                <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.5, border: '1px solid rgba(0,255,65,0.15)', borderRadius: 3, padding: '1px 6px', textTransform: 'capitalize' }}>
                  {t.industry}
                </span>
              )}
              {t.difficulty && (
                <span style={{ ...MONO, fontSize: 9, color: '#00ff41', opacity: 0.4, border: '1px solid rgba(0,255,65,0.12)', borderRadius: 3, padding: '1px 6px' }}>
                  difficulty {t.difficulty}/5
                </span>
              )}
              {t.safety_score != null && (
                <span style={{
                  ...MONO, fontSize: 9,
                  color: t.safety_score >= 70 ? '#00ff41' : '#facc15',
                  background: t.safety_score >= 70 ? 'rgba(0,255,65,0.07)' : 'rgba(250,204,21,0.07)',
                  border: `1px solid ${t.safety_score >= 70 ? 'rgba(0,255,65,0.2)' : 'rgba(250,204,21,0.2)'}`,
                  borderRadius: 3, padding: '1px 6px',
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                }}>
                  <Shield size={9} /> {t.safety_score}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && <TemplateModal template={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
