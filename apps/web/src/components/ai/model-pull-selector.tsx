'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Download, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ModelDropdownProps {
  provider: 'ollama' | 'openrouter';
  onSelect: (modelName: string) => void;
  onPull: (modelName: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Model selection dropdown for pulling/selecting models
 * Fetches free models from backend and shows them in a dropdown
 */
export function ModelPullSelector({ provider, onSelect, onPull, isLoading = false }: ModelDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [pulling, setPulling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available models on mount
  useEffect(() => {
    if (isOpen) {
      fetchAvailableModels();
    }
  }, [isOpen, provider]);

  const fetchAvailableModels = async () => {
    setLoadingModels(true);
    setError(null);

    try {
      if (provider === 'openrouter') {
        // Fetch free OpenRouter models
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/v1/ai/models/openrouter/free', {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
          } : {},
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          const modelIds = (data.models || []).map((m: any) => m.id).slice(0, 20); // Top 20
          setModels(modelIds);
        } else {
          // Fallback list — current verified free OpenRouter models
          setModels([
            'meta-llama/llama-3.3-70b-instruct:free',
            'qwen/qwen3-next-80b-a3b-instruct:free',
            'google/gemma-4-31b-it:free',
            'nvidia/nemotron-3-super-120b-a12b:free',
            'openai/gpt-oss-20b:free',
            'meta-llama/llama-3.2-3b-instruct:free',
          ]);
        }
      } else {
        // Fetch Ollama models from registry
        const res = await fetch('https://registry.ollama.ai/api/tags', {
          headers: { 'Accept': 'application/json' },
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          // Filter to most popular/free models
          const popular = (data.results || [])
            .filter((m: any) => {
              const name = m.name.toLowerCase();
              return (
                name.includes('llama') ||
                name.includes('mistral') ||
                name.includes('gemma') ||
                name.includes('neural') ||
                name.includes('phi')
              );
            })
            .slice(0, 20)
            .map((m: any) => m.name);
          setModels(popular);
        } else {
          // Fallback
          setModels(['llama3.2', 'mistral', 'gemma2', 'neural-chat', 'phi']);
        }
      }
    } catch (err) {
      setError('Failed to load models');
      console.error(err);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSelectAndPull = async (modelName: string) => {
    setSelectedModel(modelName);
    setPulling(true);

    try {
      await onPull(modelName);
      onSelect(modelName);
      setIsOpen(false);
      setSelectedModel('');
    } catch (err) {
      setError(`Failed to pull ${modelName}`);
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || pulling}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer',
          isOpen
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-input bg-background text-foreground hover:border-primary/50',
          (isLoading || pulling) && 'opacity-60 cursor-not-allowed',
        )}
      >
        <span>
          {selectedModel ? `Pulling ${selectedModel}…` : 'Select model to pull'}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-card shadow-xl z-50 min-w-full">
          {error && (
            <div className="p-3 border-b border-border bg-destructive/10 dark:bg-destructive/20 flex items-center gap-2 text-xs text-destructive dark:text-destructive/80">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {error}
            </div>
          )}

          {loadingModels ? (
            <div className="flex items-center justify-center py-6 bg-card">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : models.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground bg-card">
              No models available
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto bg-card">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => handleSelectAndPull(model)}
                  disabled={pulling}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors border-b border-border last:border-b-0 cursor-pointer',
                    'hover:bg-accent/50 focus:outline-none focus:bg-accent/50',
                    selectedModel === model && 'bg-primary/10 hover:bg-primary/15',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{model}</div>
                    {provider === 'openrouter' && (
                      <div className="text-xs text-muted-foreground">OpenRouter</div>
                    )}
                  </div>
                  {selectedModel === model && pulling && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                  )}
                  {selectedModel !== model && (
                    <Download className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Ollama model dropdown selector
 */
export function OllamaModelSelector({
  onSelect,
  onPull,
}: {
  onSelect: (modelName: string) => void;
  onPull: (modelName: string) => Promise<void>;
}) {
  return (
    <ModelPullSelector
      provider="ollama"
      onSelect={onSelect}
      onPull={onPull}
    />
  );
}

/**
 * OpenRouter model dropdown selector
 */
export function OpenRouterModelSelector({
  onSelect,
  onPull,
}: {
  onSelect: (modelName: string) => void;
  onPull: (modelName: string) => Promise<void>;
}) {
  return (
    <ModelPullSelector
      provider="openrouter"
      onSelect={onSelect}
      onPull={onPull}
    />
  );
}
