import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export interface BrainSource {
  id: string;
  title: string;
  summary: string;
  keyTopics: string[];
  url: string;
}

function buildSystemPrompt(sources: BrainSource[]): string {
  const base = `You are CyberBrain, an expert cybersecurity AI assistant built into PhishForge. You help security professionals understand threats, analyze vulnerabilities, and make better security decisions.

Your expertise covers: phishing & social engineering, malware analysis, network security, cloud security, incident response, threat intelligence, compliance (NIST, PCI DSS, GDPR, HIPAA), penetration testing, and security operations.

PERSONALITY:
- Precise and technical — use correct security terminology
- Cite MITRE ATT&CK technique IDs, CVE numbers, and framework references when relevant
- When uncertain, say so rather than hallucinate
- Format responses with markdown headers and code blocks where appropriate
- Prioritize actionable guidance over theory`;

  if (!sources || sources.length === 0) return base;

  const sourceBlock = sources.slice(0, 8).map((s, i) =>
    `[Source ${i + 1}] ${s.title}\nSummary: ${s.summary}\nKey Topics: ${s.keyTopics.join(', ')}`
  ).join('\n\n');

  return `${base}

IMPORTED KNOWLEDGE SOURCES (${sources.length} articles):
The user has imported the following cybersecurity resources as context. Reference them specifically when relevant:

${sourceBlock}

When your response draws from one of these sources, mention it naturally (e.g., "As covered in the NIST SP 800-61 guide...").`;
}

function extractFinalAnswer(raw: string): string {
  let text = raw;
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F�]/g, '');
  return text.trim();
}

// Ordered by capability — all confirmed free on OpenRouter as of 2025
const FALLBACK_MODELS = [
  'deepseek/deepseek-r1:free',
  'deepseek/deepseek-r1-0528:free',
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.5-flash:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'qwen/qwen3-14b:free',
  'qwen/qwen3-8b:free',
  'mistralai/mistral-7b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    messages = [],
    sources = [],
    provider,
    model: requestedModel,
  }: {
    messages: { role: string; content: string }[];
    sources: BrainSource[];
    provider?: string;
    model?: string;
  } = body;

  const provider_ = provider ?? process.env.DEFAULT_AI_PROVIDER ?? 'openrouter';
  // Default to a confirmed free model — ignore env var if it points to a paid model
  const envModel = process.env.OPENROUTER_DEFAULT_MODEL;
  const baseModel = requestedModel ?? (
    provider_ === 'ollama'
      ? (process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2')
      : (envModel ?? 'deepseek/deepseek-r1:free')
  );

  const systemPrompt = buildSystemPrompt(sources as BrainSource[]);
  const apiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  const startMs = Date.now();
  try {
    let content = '';
    let tokensUsed = 0;
    let modelUsed = baseModel;

    if (provider_ === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: baseModel, messages: apiMessages, stream: false, options: { temperature: 0.7, num_predict: 1200 } }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) throw new Error(`Ollama error ${res.status}`);
      const data = await res.json();
      content = extractFinalAnswer(data?.message?.content ?? '');
      tokensUsed = (data?.prompt_eval_count ?? 0) + (data?.eval_count ?? 0);
    } else {
      const apiKey = process.env.OPENROUTER_API_KEY ?? '';
      const baseURL = process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';
      const client = new OpenAI({
        apiKey,
        baseURL,
        defaultHeaders: {
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'http://localhost:3000',
          'X-Title': process.env.OPENROUTER_SITE_NAME ?? 'PhishForge AI',
        },
      });
      // Deduplicate: put base model first, then fallbacks
      const seen = new Set<string>();
      const modelsToTry: string[] = [];
      for (const m of [baseModel, ...FALLBACK_MODELS]) {
        if (!seen.has(m)) { seen.add(m); modelsToTry.push(m); }
      }
      let lastErr: Error | null = null;

      for (const m of modelsToTry) {
        try {
          const res = await client.chat.completions.create({
            model: m,
            messages: apiMessages,
            max_tokens: 1200,
            temperature: 0.7,
          });
          content = extractFinalAnswer(res.choices?.[0]?.message?.content ?? '');
          if (content) {
            tokensUsed = res.usage?.total_tokens ?? 0;
            modelUsed = m;
            break;
          }
        } catch (e: unknown) {
          lastErr = e instanceof Error ? e : new Error(String(e));
          console.warn(`[brain] model ${m} failed:`, lastErr.message);
        }
      }
      if (!content) throw lastErr ?? new Error('All models failed to generate a response.');
    }

    fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/usage/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: 'brain', tokensUsed, model: modelUsed, latencyMs: Date.now() - startMs }),
    }).catch(() => {});

    return NextResponse.json({ message: content, tokensUsed, model: modelUsed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[brain]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
