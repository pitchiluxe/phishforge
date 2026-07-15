'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Server, Zap, RefreshCw, Trash2, Download, Check, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { OllamaModelSelector, OpenRouterModelSelector } from './model-pull-selector';
import type { AIProvider, OllamaModel, OpenRouterModel } from '@phishforge/shared';

interface AISettingsPanelProps {
  currentProvider: AIProvider;
  currentModel: string;
  ollamaBaseUrl: string;
  openrouterModel: string;
}

export function AISettingsPanel({
  currentProvider,
  currentModel,
  ollamaBaseUrl,
  openrouterModel,
}: AISettingsPanelProps) {
  const [provider, setProvider] = useState<AIProvider>(currentProvider);
  const [saving, setSaving] = useState(false);

  // OpenRouter state
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [selectedOpenRouterModel, setSelectedOpenRouterModel] = useState(openrouterModel);
  const [loadingOpenRouter, setLoadingOpenRouter] = useState(false);
  const [openRouterConnected, setOpenRouterConnected] = useState<boolean | null>(null);
  const [showFreeOnly, setShowFreeOnly] = useState(true);
  const [modelSearch, setModelSearch] = useState('');

  // Ollama state
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [ollamaUrl, setOllamaUrl] = useState(ollamaBaseUrl);
  const [loadingOllama, setLoadingOllama] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState<boolean | null>(null);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState(currentModel);
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullInput, setPullInput] = useState('');

  useEffect(() => {
    if (provider === 'openrouter') loadOpenRouterModels();
    else loadOllamaModels();
  }, [provider]);

  async function loadOpenRouterModels() {
    setLoadingOpenRouter(true);
    try {
      const token = localStorage.getItem('auth_token');
      const [statusRes, modelsRes] = await Promise.all([
        fetch('/api/v1/ai/status', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }),
        fetch('/api/v1/ai/models/openrouter', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }),
      ]);
      const status = statusRes.ok ? await statusRes.json() : {};
      const models = modelsRes.ok ? await modelsRes.json() : [];
      setOpenRouterConnected(status.openrouter?.connected ?? false);
      setOpenRouterModels(Array.isArray(models) ? models : []);
    } catch {
      setOpenRouterConnected(false);
    } finally {
      setLoadingOpenRouter(false);
    }
  }

  async function loadOllamaModels() {
    setLoadingOllama(true);
    try {
      const token = localStorage.getItem('auth_token');
      const [statusRes, modelsRes] = await Promise.all([
        fetch('/api/v1/ai/status', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }),
        fetch('/api/v1/ai/models/ollama', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }),
      ]);
      const status = statusRes.ok ? await statusRes.json() : {};
      const models = modelsRes.ok ? await modelsRes.json() : [];
      setOllamaConnected(status.ollama?.connected ?? false);
      setOllamaModels(Array.isArray(models) ? models : []);
    } catch {
      setOllamaConnected(false);
    } finally {
      setLoadingOllama(false);
    }
  }

  async function pullOllamaModel() {
    if (!pullInput.trim()) return;
    setPullingModel(pullInput.trim());
    toast.loading(`Pulling ${pullInput}…`, { id: 'pull' });

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/v1/ai/models/ollama/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ model: pullInput.trim() }),
      });

      if (!res.ok) throw new Error('Pull failed');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status === 'success') {
              toast.success(`${pullInput} pulled successfully!`, { id: 'pull' });
              setPullInput('');
              await loadOllamaModels();
            }
          } catch {}
        }
      }
    } catch (error: any) {
      toast.error(`Failed to pull model: ${error.message}`, { id: 'pull' });
    } finally {
      setPullingModel(null);
    }
  }

  async function deleteOllamaModel(modelName: string) {
    if (!confirm(`Delete model "${modelName}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/v1/ai/models/ollama/${encodeURIComponent(modelName)}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      toast.success(`${modelName} deleted`);
      await loadOllamaModels();
    } catch {
      toast.error('Failed to delete model');
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('Not authenticated - no session found');
      }

      // For demo mode, use the fake token from demo-login cookie
      let token: string | undefined;
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
      
      if (isDemoMode) {
        // In demo mode, use a placeholder token
        token = 'demo-token-placeholder';
        console.log('Demo mode detected, using placeholder token');
      } else {
        // In production, use the Supabase session access token
        token = session.access_token;
      }

      if (!token) {
        throw new Error('Failed to obtain authentication token');
      }

      const body = {
        ai_provider: provider,
        ...(provider === 'openrouter'
          ? { openrouter_model: selectedOpenRouterModel }
          : { ai_model: selectedOllamaModel, ollama_base_url: ollamaUrl }),
      };

      console.log('Saving settings:', body, 'User:', session.user.id);

      const res = await fetch('/api/v1/organizations/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = (errData as any)?.error || (errData as any)?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const data = await res.json();
      console.log('Settings saved:', data);
      toast.success('AI settings saved!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Save failed:', msg, err);
      toast.error(`Failed to save settings: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  const filteredOpenRouterModels = openRouterModels
    .filter((m) => {
      const matchesSearch = !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase()) || m.id.toLowerCase().includes(modelSearch.toLowerCase());
      const isFree = showFreeOnly ? (parseFloat(m.pricing?.prompt ?? '1') === 0 && parseFloat(m.pricing?.completion ?? '1') === 0) : true;
      return matchesSearch && isFree;
    });

  return (
    <div className="max-w-4xl space-y-6">
      {/* Provider selector */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-1">AI Provider</h2>
        <p className="text-sm text-muted-foreground mb-4">Switch between cloud and local AI models at any time.</p>

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              id: 'openrouter' as AIProvider,
              label: 'OpenRouter',
              description: 'Access 100+ models including free DeepSeek, Llama, Gemma, Qwen',
              icon: Zap,
              badge: 'Cloud',
            },
            {
              id: 'ollama' as AIProvider,
              label: 'Ollama',
              description: 'Run models locally on your machine — fully private, no API costs',
              icon: Server,
              badge: 'Local',
            },
          ].map((p) => {
            const Icon = p.icon;
            const selected = provider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={cn(
                  'relative flex flex-col gap-2 p-4 rounded-xl border-2 text-left cursor-pointer transition-all',
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border/80 hover:bg-accent/50',
                )}
              >
                {selected && (
                  <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />
                )}
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-5 w-5', selected ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="font-medium text-sm">{p.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p.badge}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider-specific settings */}
      <AnimatePresence mode="wait">
        {provider === 'openrouter' ? (
          <motion.div key="openrouter" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            <OpenRouterPanel
              models={filteredOpenRouterModels}
              allModels={openRouterModels}
              selected={selectedOpenRouterModel}
              onSelect={setSelectedOpenRouterModel}
              loading={loadingOpenRouter}
              connected={openRouterConnected}
              onRefresh={loadOpenRouterModels}
              showFreeOnly={showFreeOnly}
              onToggleFree={() => setShowFreeOnly(!showFreeOnly)}
              search={modelSearch}
              onSearch={setModelSearch}
            />
          </motion.div>
        ) : (
          <motion.div key="ollama" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            <OllamaPanel
              models={ollamaModels}
              selected={selectedOllamaModel}
              onSelect={setSelectedOllamaModel}
              loading={loadingOllama}
              connected={ollamaConnected}
              onRefresh={loadOllamaModels}
              ollamaUrl={ollamaUrl}
              onUrlChange={setOllamaUrl}
              pullInput={pullInput}
              onPullInputChange={setPullInput}
              onPull={pullOllamaModel}
              pullingModel={pullingModel}
              onDelete={deleteOllamaModel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save settings
        </button>
      </div>
    </div>
  );
}

function ConnectionBadge({ connected }: { connected: boolean | null }) {
  if (connected === null) return <span className="text-xs text-muted-foreground">Checking…</span>;
  return (
    <span className={cn('flex items-center gap-1 text-xs font-medium', connected ? 'text-green-500' : 'text-red-500')}>
      {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {connected ? 'Connected' : 'Disconnected'}
    </span>
  );
}

function OpenRouterPanel({
  models, allModels, selected, onSelect, loading, connected, onRefresh,
  showFreeOnly, onToggleFree, search, onSearch,
}: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">OpenRouter Model</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{allModels.length} models available</p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionBadge connected={connected} />
          <button onClick={onRefresh} disabled={loading} className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Quick select dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Quick Select Model</label>
        <OpenRouterModelSelector
          onSelect={onSelect}
          onPull={async (modelName) => {
            onSelect(modelName);
            toast.success(`Selected ${modelName}`);
          }}
        />
      </div>

      {/* Search and filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Browse & Search</label>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search models…"
          className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={onToggleFree}
          className={cn('px-3 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer', showFreeOnly ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'border-border text-muted-foreground hover:bg-accent')}
        >
          {showFreeOnly ? '✓ Free only' : 'All models'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
          {models.slice(0, 50).map((model: OpenRouterModel) => {
            const isFree = parseFloat(model.pricing?.prompt ?? '1') === 0;
            return (
              <button
                key={model.id}
                onClick={() => onSelect(model.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-all cursor-pointer',
                  selected === model.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent border border-transparent',
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{model.name}</div>
                  <div className="text-xs text-muted-foreground truncate font-mono">{model.id}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isFree && <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">FREE</span>}
                  {selected === model.id && <Check className="h-4 w-4 text-primary" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OllamaPanel({
  models, selected, onSelect, loading, connected, onRefresh,
  ollamaUrl, onUrlChange, pullInput, onPullInputChange, onPull, pullingModel, onDelete,
}: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Ollama Model Manager</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{models.length} models installed locally</p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionBadge connected={connected} />
          <button onClick={onRefresh} disabled={loading} className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Ollama URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Ollama Server URL</label>
        <input
          type="text"
          value={ollamaUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="http://localhost:11434"
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Pull new model */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Pull a Model</label>
        <div className="grid gap-3">
          {/* Dropdown selector for popular models */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick pull from popular models</p>
            <OllamaModelSelector
              onSelect={(modelName) => onSelect(modelName)}
              onPull={async (modelName) => {
                onPullInputChange(modelName);
                // Trigger pull
                const res = await fetch('/api/ai/models/ollama/pull', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ model: modelName }),
                });

                if (!res.ok) throw new Error('Pull failed');

                const reader = res.body!.getReader();
                const decoder = new TextDecoder();

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  const lines = decoder.decode(value).split('\n').filter(Boolean);
                  for (const line of lines) {
                    try {
                      const data = JSON.parse(line);
                      if (data.status === 'success') {
                        toast.success(`${modelName} pulled successfully!`);
                        onPullInputChange('');
                        onRefresh();
                      }
                    } catch {}
                  }
                }
              }}
            />
          </div>

          {/* Or manual entry */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Or enter model name manually</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pullInput}
                onChange={(e) => onPullInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onPull()}
                placeholder="e.g. llama3.2, mistral, gemma2"
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={onPull}
                disabled={!pullInput.trim() || !!pullingModel}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
              >
                {pullingModel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Pull
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Popular: llama3.2, llama3.1, mistral, gemma2, qwen2.5, deepseek-r1, phi4
        </p>
      </div>

      {/* Installed models */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          {connected ? 'No models installed. Pull one above.' : 'Cannot connect to Ollama. Is it running?'}
        </div>
      ) : (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {models.map((model: OllamaModel) => {
            const sizeMB = Math.round((model.size ?? 0) / (1024 * 1024));
            const sizeLabel = sizeMB > 1024 ? `${(sizeMB / 1024).toFixed(1)} GB` : `${sizeMB} MB`;
            return (
              <div
                key={model.name}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  selected === model.name ? 'bg-primary/10 border-primary/30' : 'border-transparent hover:bg-accent',
                )}
              >
                <button onClick={() => onSelect(model.name)} className="flex-1 flex items-center gap-3 text-left cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.details?.parameter_size ?? ''} • {sizeLabel}</div>
                  </div>
                  {selected === model.name && <Check className="h-4 w-4 text-primary" />}
                </button>
                <button
                  onClick={() => onDelete(model.name)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                  title="Delete model"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
