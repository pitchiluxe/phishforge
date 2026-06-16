// Shared OpenRouter client — mirrors the QuickBooks Playground pattern.
// Env vars (checked in order): OPENROUTER_API_KEY, ANTHROPIC_AUTH_TOKEN, ANTHROPIC_API_KEY
// Base URL vars: OPENROUTER_BASE_URL, ANTHROPIC_BASE_URL (default: openrouter.ai/api/v1)

export const FREE_MODELS = [
  // 2026-verified working on OpenRouter (ordered by speed/quality)
  'deepseek/deepseek-v4-flash:free',
  'openai/gpt-oss-20b:free',
  'openai/gpt-oss-120b:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'qwen/qwen3-14b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'arcee-ai/trinity-large-thinking:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'mistralai/mistral-7b-instruct:free',
  // Older still-working fallbacks
  'deepseek/deepseek-r1:free',
  'deepseek/deepseek-r1-0528:free',
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

export async function callOpenRouter(
  messages: OAMessage[],
  opts: {
    maxTokens?: number;
    temperature?: number;
    primaryModel?: string;
  } = {},
): Promise<{ content: string; model: string; tokens: number }> {
  const { maxTokens = 1400, temperature = 0.7, primaryModel } = opts;
  const url = `${getBaseUrl()}/chat/completions`;

  // OpenRouter requires conversations to start with a user message
  // (system messages are fine at index 0, but assistant can't be first after system)
  const normalized: OAMessage[] = [];
  for (const msg of messages) {
    if (normalized.length <= 1 && msg.role === 'assistant') continue; // skip leading assistants
    normalized.push(msg);
  }

  const models: string[] = primaryModel
    ? [primaryModel, ...FREE_MODELS.filter((m) => m !== primaryModel)]
    : [...FREE_MODELS];

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
  // Strip explicit <think>...</think> blocks (DeepSeek R1, Qwen3 thinking mode)
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '');

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
