// Shared AI client with Ollama (free, local) + OpenRouter (backup) support
// Strategy: Try Ollama first (true free tier), fallback to OpenRouter if available
// Env vars checked: OLLAMA_BASE_URL, OPENROUTER_API_KEY, ANTHROPIC_AUTH_TOKEN, ANTHROPIC_API_KEY

// Ollama models (free, local) - only fast/small models to avoid OOM
// Models must be installed locally. Run: ollama pull <model>
// Ordered fastest-first so responses come back quickly; callOllama waterfalls
// through them and returns the first that answers. OLLAMA_DEFAULT_MODEL (if set)
// is tried before all of these.
export const OLLAMA_MODELS = [
  'llama3.2:3b',          // fast (3.2B params)
  'phi3:mini',            // ultra-fast (3.8B params)
  'mistral:7b',           // balanced quality/speed (7B params)
  'llama3.1:8b',          // higher quality, slower (8B params)
] as const;

// OpenRouter free-tier waterfall — verified available on the account (":free" slugs,
// $0 prompt/completion). callOpenRouter tries these in order, rolling to the next on
// any error/rate-limit, so a single model being throttled never breaks a request.
// NOTE: OpenRouter caps *all* free models to a shared per-account daily quota unless
// you add credits; when that quota is hit every :free model returns 429. Ollama is the
// only truly unlimited free path, which is why callAI prefers it first.
export const FALLBACK_FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-oss-20b:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'google/gemma-4-26b-a4b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
] as const;

export type OAMessage = { role: 'system' | 'user' | 'assistant'; content: string };

// Strip non-ASCII bytes — HTTP headers only allow bytes 0-255, and some key strings
// contain non-ASCII dashes/quotes that cause a ByteString error on certain runtimes.
function toAscii(s: string) {
  return s.replace(/[^\x00-\x7F]/g, '');
}

function apiKey(): string {
  // Check all env var names the user might have configured
  return (
    process.env.OPENROUTER_API_KEY ||
    process.env.ANTHROPIC_AUTH_TOKEN ||
    process.env.ANTHROPIC_API_KEY ||
    ''
  );
}

function getBaseUrl(): string {
  const raw = (
    process.env.OPENROUTER_BASE_URL ||
    process.env.ANTHROPIC_BASE_URL ||
    'https://openrouter.ai/api'
  ).replace(/\/+$/, '');
  return raw.endsWith('/v1') ? raw : `${raw}/v1`;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${toAscii(apiKey())}`,
    'HTTP-Referer': toAscii(
      process.env.OPENROUTER_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://phishforge.ai'
    ),
    'X-Title': 'PhishForge AI',
  };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function getOllamaUrl(): string {
  const raw = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '');
  return raw;
}

async function isOllamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${getOllamaUrl()}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // Increased timeout for slower systems
    });
    return res.ok;
  } catch (err) {
    console.debug('[ollama] availability check failed:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

async function callOllama(
  messages: OAMessage[],
  opts: {
    maxTokens?: number;
    temperature?: number;
    modelList?: string[];
  } = {},
): Promise<{ content: string; model: string; tokens: number }> {
  const { maxTokens = 1400, temperature = 0.7, modelList } = opts;
  const url = `${getOllamaUrl()}/api/chat`;
  const models = modelList && modelList.length > 0 ? modelList : [...OLLAMA_MODELS];

  let lastError = new Error('No Ollama models tried');

  for (const model of models) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            num_predict: maxTokens,
            temperature,
          },
        }),
        signal: AbortSignal.timeout(600000), // 10 min timeout for Ollama (models can be slow locally)
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(`${model} → ${res.status}: ${txt.slice(0, 300)}`);
      }

      const data: any = await res.json();
      const content = data.message?.content ?? '';
      if (!content) throw new Error(`${model} returned empty content`);

      return {
        content,
        model: `ollama:${model}`,
        tokens: data.prompt_eval_count + data.eval_count || 0,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[ollama] ${model} failed: ${lastError.message}`);
    }
  }

  throw new Error(`All Ollama models failed: ${lastError.message}`);
}

export async function callAI(
  messages: OAMessage[],
  opts: {
    maxTokens?: number;
    temperature?: number;
    primaryModel?: string;
    modelList?: string[];
    preferProvider?: 'ollama' | 'openrouter' | 'auto';
  } = {},
): Promise<{ content: string; model: string; tokens: number }> {
  const { preferProvider = 'auto' } = opts;

  // Try Ollama first if available (truly free, no API key needed)
  const shouldTryOllama = preferProvider === 'auto' || preferProvider === 'ollama';
  if (shouldTryOllama) {
    try {
      const available = await isOllamaAvailable();
      if (available) {
        console.log('[AI] ✓ Ollama available, using local model');
        // Try the configured default model first (usually the fastest one the user
        // has picked), then the rest of the installed set.
        const envModel = (process.env.OLLAMA_DEFAULT_MODEL || '').trim();
        const ollamaList = [...new Set([envModel, ...OLLAMA_MODELS].filter(Boolean))];
        return await callOllama(messages, { ...opts, modelList: ollamaList });
      } else {
        console.log('[AI] Ollama not available (check: ollama serve is running)');
      }
    } catch (err) {
      console.log('[AI] Ollama check failed:', err instanceof Error ? err.message : String(err));
    }
  }

  // Fall back to OpenRouter, cycling through the free-model waterfall. Skip only if
  // the caller explicitly pinned preferProvider to 'ollama'.
  if (preferProvider !== 'ollama') {
    if (apiKey()) {
      try {
        return await callOpenRouter(messages, {
          maxTokens: opts.maxTokens,
          temperature: opts.temperature,
          primaryModel: opts.primaryModel,
          modelList: opts.modelList,
        });
      } catch (err) {
        console.warn('[AI] OpenRouter fallback failed:', err instanceof Error ? err.message : String(err));
      }
    }
  }

  throw new Error(
    'No AI provider available. Fixes:\n' +
    '• Local: start Ollama — run "ollama serve" (models: ' + OLLAMA_MODELS.join(', ') + ')\n' +
    '• Hosted: set a valid OPENROUTER_API_KEY. Free models are rate-limited per day —\n' +
    '  add $10 of OpenRouter credits to lift the free-tier daily cap, or self-host Ollama.'
  );
}

export async function callOpenRouter(
  messages: OAMessage[],
  opts: {
    maxTokens?: number;
    temperature?: number;
    primaryModel?: string;
    modelList?: string[]; // Custom model list (if not provided, uses FALLBACK_FREE_MODELS)
  } = {},
): Promise<{ content: string; model: string; tokens: number }> {
  const { maxTokens = 1400, temperature = 0.7, primaryModel, modelList } = opts;
  const url = `${getBaseUrl()}/chat/completions`;

  // OpenRouter requires conversations to start with a user message
  // (system messages are fine at index 0, but assistant can't be first after system)
  const normalized: OAMessage[] = [];
  for (const msg of messages) {
    if (normalized.length <= 1 && msg.role === 'assistant') continue; // skip leading assistants
    normalized.push(msg);
  }

  // Build an ordered, de-duplicated waterfall so a single throttled/failed model
  // never breaks the request: caller's primary model → configured default →
  // caller's extra list → the curated free-model fallback list. callOpenRouter
  // then rolls through them in order until one succeeds.
  const envDefault = (process.env.OPENROUTER_DEFAULT_MODEL || '').trim();
  const ordered = [
    primaryModel,
    envDefault,
    ...(modelList ?? []),
    ...FALLBACK_FREE_MODELS,
  ].filter((m): m is string => !!m);
  const models: string[] = [...new Set(ordered)];

  let lastError = new Error('No models tried');

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            model,
            messages: normalized,
            max_tokens: maxTokens,
            temperature,
            // Suppresses inline chain-of-thought from DeepSeek/Qwen3 reasoning models.
            // Non-reasoning models safely ignore this field.
            include_reasoning: false,
          }),
        });

        // 429: wait 1.5s then retry once before moving to next model
        if (res.status === 429) {
          if (attempt === 0) { await sleep(1500); continue; }
          throw new Error(`429 on ${model}`);
        }

        if (res.status === 401) {
          const body = await res.json().catch(() => ({}));
          const msg = (body as any)?.error?.message ?? 'Missing or invalid API key';
          throw new Error(`401 Auth: ${msg}. Check OPENROUTER_API_KEY / ANTHROPIC_AUTH_TOKEN env var.`);
        }

        if (!res.ok) {
          const txt = await res.text().catch(() => `HTTP ${res.status}`);
          throw new Error(`${model} → ${res.status}: ${txt.slice(0, 300)}`);
        }

        const data: any = await res.json();
        if (data.error) throw new Error(`${model}: ${data.error.message ?? JSON.stringify(data.error)}`);

        const content: string = data.choices?.[0]?.message?.content ?? '';
        if (!content) throw new Error(`${model} returned empty content`);

        return { content, model, tokens: data.usage?.total_tokens ?? 0 };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // Only retry on 429; bail immediately for auth/other errors
        if (!lastError.message.includes('429')) break;
      }
    }
    console.warn(`[openrouter] ${model} failed: ${lastError.message} — trying next`);
    // On auth error, abort entire waterfall — no point trying other models
    if (lastError.message.startsWith('401 Auth')) {
      throw lastError;
    }
  }

  throw new Error(`All models failed. Last: ${lastError.message}`);
}

// ─── Text cleanup ──────────────────────────────────────────────────────────────

export function stripThinkTags(raw: string): string {
  // Strip markdown code blocks with backticks (common from Ollama responses)
  let text = raw.replace(/```(?:json)?\s*\n?([\s\S]*?)\n?```/g, '$1');
  text = text.replace(/```(?:json)?[\s\S]*?```/g, '');
  
  // Strip explicit <think>...</think> blocks (DeepSeek R1, Qwen3 thinking mode)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // Normalize fancy Unicode quotes and dashes to ASCII equivalents
  // This fixes: « » ‹ › — – ′ ″ etc.
  text = text
    .replace(/[«»]/g, '"')     // « » → "
    .replace(/[‹›]/g, "'")     // ‹ › → '
    .replace(/[—–]/g, '-')     // — – → -
    .replace(/[′″]/g, "'")     // ′ ″ → '
    .replace(/['']/g, "'")     // ' ' → '
    .replace(/[""]/g, '"');    // " " → "

  // Strip control / replacement characters
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F​-‍﻿]/g, '');
  text = text.replace(/�/g, '');

  return text.trim();
}

// More aggressive extraction: also strips inline chain-of-thought noise some
// reasoning models emit without <think> tags (copied from QuickBooks pattern).
export function extractFinalAnswer(raw: string): string {
  let text = stripThinkTags(raw);

  const SELF_TALK = /\bI (think|write|need|cite)\b|\bNow (final|answer|write)\b|\bOk\.\s*[\n$]|\bDone\.\s*[\n$]/i;
  if (!SELF_TALK.test(text)) return text;

  const paras = text.split(/\n{2,}/);
  const NOISE_HEAD = /^(But\b|Ok\.?\s*$|Yes\.?\s*$|Done\.?\s*$|Now\b|I think|I write|I need|I cite|I'm |Then\b|Answer\.?\s*$|Now final|Now answer|Now write|Write final|Final answer:|Ok answer)/i;
  const isNoise = (p: string) => NOISE_HEAD.test(p.trim()) || p.trim().length < 18;
  const CONTENT_MARKERS = /→|\*\*|\d+\.\s|MITRE|CVE|T1\d{3}/i;
  const isContent = (p: string) => !isNoise(p) && p.trim().length >= 40 && CONTENT_MARKERS.test(p);

  let lastContentIdx = -1;
  for (let i = paras.length - 1; i >= 0; i--) {
    if (isContent(paras[i])) { lastContentIdx = i; break; }
  }
  if (lastContentIdx === -1) return text;

  let startIdx = lastContentIdx;
  let noiseStreak = 0;
  for (let i = lastContentIdx - 1; i >= 0; i--) {
    if (isNoise(paras[i])) {
      if (++noiseStreak > 2) break;
    } else if (isContent(paras[i])) {
      startIdx = i; noiseStreak = 0;
    } else {
      if (++noiseStreak > 3) break;
    }
  }

  const answer = paras.slice(startIdx, lastContentIdx + 1).filter(p => !isNoise(p)).join('\n\n').trim();
  return answer.length > 60 ? answer : text;
}

// ─── Conversation helpers ──────────────────────────────────────────────────────

// Trim conversation history to last N turns and ensure it starts with a user message
// (OpenRouter rejects conversations that start with an assistant turn).
export function trimHistory(
  messages: Array<{ role: string; content: string }>,
  maxTurns = 10,
): OAMessage[] {
  const sliced = messages.slice(-maxTurns) as OAMessage[];
  // Drop leading assistant messages
  const start = sliced.findIndex((m) => m.role === 'user');
  return start >= 0 ? sliced.slice(start) : sliced;
}
