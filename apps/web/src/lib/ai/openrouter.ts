// Shared OpenRouter client with retry + model waterfall.
// Mirrors the pattern from QuickBooks Playground that handles 429s correctly.

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

function toAscii(s: string) {
  return s.replace(/[^\x00-\x7F]/g, '');
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${toAscii(process.env.OPENROUTER_API_KEY ?? '')}`,
    'HTTP-Referer': toAscii(process.env.OPENROUTER_SITE_URL ?? 'https://phishforge.ai'),
    'X-Title': 'PhishForge AI',
  };
}

function getBaseUrl() {
  const raw = (process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1').replace(/\/+$/, '');
  return raw.endsWith('/v1') ? raw : `${raw}/v1`;
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
            messages,
            max_tokens: maxTokens,
            temperature,
            include_reasoning: false,
          }),
        });

        if (res.status === 429) {
          if (attempt === 0) { await sleep(1500); continue; }
          throw new Error(`429 on ${model}`);
        }

        if (!res.ok) {
          const txt = await res.text().catch(() => `HTTP ${res.status}`);
          throw new Error(`${model} → ${res.status}: ${txt.slice(0, 200)}`);
        }

        const data: any = await res.json();
        if (data.error) throw new Error(`${model}: ${data.error.message ?? JSON.stringify(data.error)}`);

        const content: string = data.choices?.[0]?.message?.content ?? '';
        if (!content) throw new Error(`${model} returned empty content`);

        return { content, model, tokens: data.usage?.total_tokens ?? 0 };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (!lastError.message.includes('429')) break;
      }
    }
    console.warn(`[openrouter] ${model} failed: ${lastError.message} — trying next`);
  }

  throw new Error(`All models failed. Last: ${lastError.message}`);
}

export function stripThinkTags(raw: string): string {
  return raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F�]/g, '')
    .trim();
}
