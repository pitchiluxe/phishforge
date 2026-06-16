import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractFinalAnswer, trimHistory } from '@/lib/ai/openrouter';

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
  const envModel = process.env.OPENROUTER_DEFAULT_MODEL;
  const primaryModel = requestedModel ?? (
    provider_ === 'ollama'
      ? (process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2')
      : (envModel ?? undefined)
  );

  const systemPrompt = buildSystemPrompt(sources as BrainSource[]);
  // Trim to last 10 turns and ensure first message is from user (OpenRouter requirement)
  const history = trimHistory(messages, 10);
  const apiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...history,
  ];

  const startMs = Date.now();
  try {
    let content = '';
    let tokensUsed = 0;
    let modelUsed = '';

    if (provider_ === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: primaryModel ?? 'llama3.2', messages: apiMessages, stream: false, options: { temperature: 0.7, num_predict: 1200 } }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) throw new Error(`Ollama error ${res.status}`);
      const data = await res.json();
      content = extractFinalAnswer(data?.message?.content ?? '');
      tokensUsed = (data?.prompt_eval_count ?? 0) + (data?.eval_count ?? 0);
      modelUsed = primaryModel ?? 'llama3.2';
    } else {
      const result = await callOpenRouter(apiMessages, {
        maxTokens: 1400,
        temperature: 0.7,
        primaryModel,
      });
      content = extractFinalAnswer(result.content);
      tokensUsed = result.tokens;
      modelUsed = result.model;
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
