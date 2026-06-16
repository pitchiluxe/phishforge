import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractFinalAnswer, trimHistory } from '@/lib/ai/openrouter';

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
  const primaryModel = requestedModel ?? (
    provider_ === 'ollama'
      ? (process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2')
      : (process.env.OPENROUTER_DEFAULT_MODEL ?? undefined)
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

  const history = trimHistory([
    ...messages.slice(0, -1),
    { role: 'user', content: userMessage },
  ], 10);
  const apiMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
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
        body: JSON.stringify({ model: primaryModel ?? 'llama3.2', messages: apiMessages, stream: false, options: { temperature: 0.4, num_predict: 2000 } }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) throw new Error(`Ollama error ${res.status}`);
      const data = await res.json();
      content = extractFinalAnswer(data?.message?.content ?? '');
      tokensUsed = (data?.prompt_eval_count ?? 0) + (data?.eval_count ?? 0);
      modelUsed = primaryModel ?? 'llama3.2';
    } else {
      const result = await callOpenRouter(apiMessages, {
        maxTokens: 2000,
        temperature: 0.4,
        primaryModel,
      });
      content = extractFinalAnswer(result.content);
      tokensUsed = result.tokens;
      modelUsed = result.model;
    }

    fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/usage/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: 'cyberlm', tokensUsed, model: modelUsed, latencyMs: Date.now() - startMs }),
    }).catch(() => {});

    return NextResponse.json({ message: content, tokensUsed, model: modelUsed });
  } catch (err) {
    console.error('[cyberlm]', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
