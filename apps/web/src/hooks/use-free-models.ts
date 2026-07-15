import { useEffect, useState } from 'react';

export interface FreeModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length?: number;
}

/**
 * Fetch free OpenRouter models from API with caching
 * Falls back to client-side list if API unavailable
 */
export function useFreeFreeModels() {
  const [models, setModels] = useState<FreeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API first (will have caching)
        const res = await fetch('/v1/ai/models/openrouter/free/best', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          },
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          setModels(data.models || []);
          return;
        }

        // Fallback: current verified free OpenRouter models (the app waterfalls
        // through these, rolling to the next if one is rate-limited/unavailable).
        const fallbackModels: FreeModel[] = [
          { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct', description: 'Great all-round quality', pricing: { prompt: '0', completion: '0' }, context_length: 128000 },
          { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B', description: 'Strong instruction following', pricing: { prompt: '0', completion: '0' }, context_length: 128000 },
          { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B', description: 'Fast and capable', pricing: { prompt: '0', completion: '0' }, context_length: 128000 },
          { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B', description: 'High-capacity reasoning', pricing: { prompt: '0', completion: '0' }, context_length: 128000 },
          { id: 'openai/gpt-oss-20b:free', name: 'GPT-OSS 20B', description: 'Efficient open model', pricing: { prompt: '0', completion: '0' }, context_length: 128000 },
          { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B', description: 'Lightweight and quick', pricing: { prompt: '0', completion: '0' }, context_length: 128000 },
        ];

        setModels(fallbackModels);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch models');
        // Use fallback even on error
        setModels([
          {
            id: 'meta-llama/llama-3.3-70b-instruct:free',
            name: 'Llama 3.3 70B (Fallback)',
            pricing: { prompt: '0', completion: '0' },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return { models, loading, error };
}

/**
 * Get the best working free model from the API
 */
export async function getWorkingFreeModel(token?: string): Promise<string> {
  try {
    const res = await fetch('/v1/ai/models/openrouter/working-free', {
      headers: {
        'Authorization': `Bearer ${token || localStorage.getItem('auth_token') || ''}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return data.model;
    }
  } catch (err) {
    console.warn('Failed to fetch working model from API:', err);
  }

  // Fallback to a known-good model
  return 'meta-llama/llama-3.3-70b-instruct:free';
}
