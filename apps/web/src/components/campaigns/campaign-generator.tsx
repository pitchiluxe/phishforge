'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Mail, Shield, Eye, Copy, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INDUSTRIES, TARGET_ROLES } from '@phishforge/shared';
import toast from 'react-hot-toast';
import type { AIProvider } from '@phishforge/shared';

interface CampaignGeneratorProps {
  defaultProvider: AIProvider;
  defaultModel: string;
  plan: string;
}

type Step = 'configure' | 'generating' | 'preview';

export function CampaignGenerator({ defaultProvider, defaultModel, plan }: CampaignGeneratorProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('configure');
  const [form, setForm] = useState({
    name: '',
    industry: 'technology',
    target_role: 'employee',
    simulation_type: 'email' as const,
    difficulty: 3,
    provider: defaultProvider,
    model: defaultModel,
    use_knowledge_base: false,
    context: '',
  });
  const [generated, setGenerated] = useState<any>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setStep('generating');

    try {
      // 1. Create campaign
      const createRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || `${form.industry} - ${form.target_role}`,
          industry: form.industry,
          target_role: form.target_role,
          simulation_type: form.simulation_type,
          difficulty: form.difficulty,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to create campaign');
      }
      const { id } = await createRes.json();
      setCampaignId(id);

      // 2. Generate content
      const genRes = await fetch(`/api/campaigns/${id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: form.industry,
          target_role: form.target_role,
          simulation_type: form.simulation_type,
          difficulty: form.difficulty,
          ai_provider: form.provider,
          ai_model: form.model,
          use_knowledge_base: form.use_knowledge_base,
          context: form.context || undefined,
        }),
      });

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(err.error ?? 'Content generation failed');
      }
      const data = await genRes.json();
      setGenerated(data.template);

      // Persist to localStorage so the campaigns list shows it in demo mode
      try {
        const saved = JSON.parse(localStorage.getItem('pf_demo_campaigns') ?? '[]');
        saved.unshift({
          id,
          name: form.name || `${form.industry} — ${form.target_role}`,
          status: 'draft',
          simulation_type: form.simulation_type,
          industry: form.industry,
          target_role: form.target_role,
          difficulty: form.difficulty,
          stats: { total_targets: 0, opened: 0, clicked: 0 },
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('pf_demo_campaigns', JSON.stringify(saved.slice(0, 50)));
      } catch {}

      setStep('preview');
    } catch (error: any) {
      toast.error(error.message ?? 'Generation failed');
      setStep('configure');
    }
  }

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied!');
  }

  return (
    <div className="max-w-3xl space-y-6">
      <AnimatePresence mode="wait">
        {step === 'configure' && (
          <motion.form
            key="configure"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            onSubmit={handleGenerate}
            className="space-y-6"
          >
            {/* Campaign basics */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold">Campaign Details</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign name (optional)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Q1 Finance Phishing Test"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <select
                    value={form.industry}
                    onChange={update('industry')}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i} className="capitalize">{i.replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target role</label>
                  <select
                    value={form.target_role}
                    onChange={update('target_role')}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {TARGET_ROLES.map((r) => (
                      <option key={r} value={r} className="capitalize">{r.replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Difficulty slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Difficulty</label>
                  <span className="text-sm text-muted-foreground">
                    {['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Expert'][form.difficulty]}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form.difficulty}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: parseInt(e.target.value) }))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Obvious</span>
                  <span>Highly Sophisticated</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional context (optional)</label>
                <textarea
                  value={form.context}
                  onChange={update('context')}
                  placeholder="e.g. We recently migrated to Microsoft 365. Use corporate language..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.use_knowledge_base}
                  onChange={(e) => setForm((f) => ({ ...f, use_knowledge_base: e.target.checked }))}
                  className="rounded border-input"
                />
                <span className="text-sm">Use knowledge base for personalization</span>
              </label>
            </div>

            {/* AI model selector */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="font-semibold">AI Model</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'openrouter', label: 'OpenRouter (Cloud)' },
                  { value: 'ollama', label: 'Ollama (Local)' },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm((f) => ({
                      ...f,
                      provider: p.value as AIProvider,
                      model: p.value === 'ollama' ? 'llama3.2' : 'deepseek/deepseek-chat-v3-0324',
                    }))}
                    className={cn(
                      'px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all cursor-pointer',
                      form.provider === p.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-accent',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Model ID</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={update('model')}
                  placeholder={form.provider === 'openrouter' ? 'deepseek/deepseek-chat-v3-0324' : 'llama3.2'}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {form.provider === 'ollama' && (
                  <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: '#00ff41', opacity: 0.45, margin: 0 }}>
                    Ollama must be running locally. Pull a model first:{' '}
                    <code style={{ background: 'rgba(0,255,65,0.07)', padding: '1px 5px', borderRadius: 3 }}>
                      ollama pull {form.model || 'llama3.2'}
                    </code>
                    {' '}· Popular: llama3.2, mistral, phi4, deepseek-r1
                  </p>
                )}
                {form.provider === 'openrouter' && (
                  <p style={{ fontFamily: 'var(--font-fira-code), monospace', fontSize: 10, color: '#00ff41', opacity: 0.45, margin: 0 }}>
                    Any model slug from{' '}
                    <span style={{ opacity: 0.7 }}>openrouter.ai/models</span>
                    {' '}· Free tiers available
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Sparkles className="h-5 w-5" />
              Generate Phishing Simulation
            </button>
          </motion.form>
        )}

        {step === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-border bg-card p-12 flex flex-col items-center gap-4 text-center"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Generating simulation…</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI is crafting a realistic phishing scenario for {form.industry} / {form.target_role}
              </p>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </motion.div>
        )}

        {step === 'preview' && generated && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Safety score */}
            <div className={cn(
              'rounded-xl border p-4 flex items-center gap-3',
              (generated.safety_score ?? 0) >= 70
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-yellow-500/30 bg-yellow-500/5',
            )}>
              <Shield className={cn('h-5 w-5', (generated.safety_score ?? 0) >= 70 ? 'text-green-500' : 'text-yellow-500')} />
              <div>
                <div className="text-sm font-medium">
                  Safety Score: {generated.safety_score ?? 'N/A'}/100
                </div>
                <div className="text-xs text-muted-foreground">
                  {(generated.safety_score ?? 0) >= 70 ? 'Safe for simulation delivery' : 'Review before use'}
                </div>
              </div>
            </div>

            {/* Email preview */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Generated Email</span>
                </div>
                <button
                  onClick={() => copy(JSON.stringify(generated, null, 2), 'all')}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {copiedField === 'all' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copy all
                </button>
              </div>

              <div className="p-4 space-y-3">
                <FieldRow label="From" value={`${generated.sender_name} <${generated.sender_email}>`} onCopy={() => copy(generated.sender_email, 'from')} copied={copiedField === 'from'} />
                <FieldRow label="Subject" value={generated.subject} onCopy={() => copy(generated.subject, 'subject')} copied={copiedField === 'subject'} />

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Preview</label>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border p-4 bg-background text-sm overflow-auto max-h-80"
                    dangerouslySetInnerHTML={{ __html: generated.body_html ?? '' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('configure')}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-all cursor-pointer"
              >
                Regenerate
              </button>
              <button
                onClick={() => router.push('/dashboard/campaigns')}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer"
              >
                Save campaign →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-muted-foreground font-medium w-16 pt-0.5 flex-shrink-0">{label}</span>
      <span className="text-sm flex-1 font-mono text-xs">{value}</span>
      <button onClick={onCopy} className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex-shrink-0">
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
