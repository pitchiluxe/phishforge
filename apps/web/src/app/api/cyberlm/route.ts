import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are CyberLM, an elite incident response copilot built into PhishForge. You help security analysts and incident responders analyze cybersecurity incidents in real-time.

When given an incident, return a structured analysis with ALL of these sections:

## Threat Assessment
Identify the likely threat actor category, attack type, and severity.

## Immediate Actions (First 15 Minutes)
Numbered list of actions to take RIGHT NOW to limit damage.

## Containment Steps
Specific technical steps to isolate affected systems.

## Evidence to Preserve
What forensic evidence must be captured immediately and how.

## Escalation Path
Who to notify and when (Security team → Management → Legal → Regulators → PR).

## IOC Checklist
Specific indicators to search for in logs, endpoints, and network traffic.

## MITRE ATT&CK TTPs
Map the incident to specific ATT&CK techniques (e.g., T1566.001 for spearphishing).

## Documentation Template
Key data points to log for the incident report and post-incident review.

RULES:
- Be precise and technical. Use real tool names (Volatility, Splunk, CrowdStrike, etc.)
- Reference specific log sources and event IDs where relevant
- Tailor advice to the severity level provided
- If information is missing, state what additional context you need`;

function extractFinalAnswer(raw: string): string {
  let text = raw;
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F�]/g, '');
  return text.trim();
}

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
  'nousresearch/hermes-3-llama-3.1-8b:free',
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    incidentType,
    severity,
    description,
    affectedSystems,
    iocs,
    messages = [],
    provider,
    model: requestedModel,
  }: {
    incidentType: string;
    severity: string;
    description: string;
    affectedSystems?: string;
    iocs?: string;
    messages?: { role: string; content: string }[];
    provider?: string;
    model?: string;
  } = body;

  const provider_ = provider ?? process.env.DEFAULT_AI_PROVIDER ?? 'openrouter';
  const baseModel = requestedModel ?? (
    provider_ === 'ollama'
      ? (process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2')
      : (process.env.OPENROUTER_DEFAULT_MODEL ?? 'deepseek/deepseek-r1:free')
  );

  const userMessage = messages.length > 0
    ? messages[messages.length - 1].content
    : `Analyze this incident:
Incident Type: ${incidentType}
Severity: ${severity}
Description: ${description}
${affectedSystems ? `Affected Systems: ${affectedSystems}` : ''}
${iocs ? `Observed IOCs: ${iocs}` : ''}

Provide a complete structured incident response analysis.`;

  const apiMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...messages.slice(0, -1).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
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
        body: JSON.stringify({ model: baseModel, messages: apiMessages, stream: false, options: { temperature: 0.4, num_predict: 2000 } }),
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
      const modelsToTry = [baseModel, ...FALLBACK_MODELS];
      let lastErr: Error | null = null;

      for (const m of modelsToTry) {
        try {
          const res = await client.chat.completions.create({
            model: m,
            messages: apiMessages,
            max_tokens: 2000,
            temperature: 0.4,
          });
          content = extractFinalAnswer(res.choices?.[0]?.message?.content ?? '');
          if (content) {
            tokensUsed = res.usage?.total_tokens ?? 0;
            modelUsed = m;
            break;
          }
        } catch (e: unknown) {
          lastErr = e instanceof Error ? e : new Error(String(e));
        }
      }
      if (!content) throw lastErr ?? new Error('All models failed to generate a response.');
    }

    // Fire-and-forget usage log (never blocks the response)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/usage/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: 'cyberlm', tokensUsed, model: modelUsed, latencyMs: Date.now() - startMs }),
    }).catch(() => {});

    return NextResponse.json({ message: content, tokensUsed, model: modelUsed });
  } catch (err) {
    console.error('[cyberlm]', err);
    return NextResponse.json({ error: 'AI request failed', detail: String(err) }, { status: 500 });
  }
}
