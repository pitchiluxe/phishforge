import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, stripThinkTags } from '@/lib/ai/openrouter';

const SYSTEM_PROMPT = `You are CyberForge-AI, a cybersecurity training facilitator running interactive security awareness simulations for authorized employee training.

Your role depends on the mode:

SIMULATE mode: You roleplay as the attacker or present the security scenario. Stay completely in character. Make the scenario realistic and challenging. After 4-6 exchanges, naturally bring the scenario to a close.

SCORE mode: You are an impartial security training evaluator. Analyze the full conversation and score the trainee objectively.

SCORING CRITERIA (25 points each, 100 total):
1. DETECTION (0-25): Did they correctly identify the threat/attack type? Did they spot the red flags?
2. RESPONSE (0-25): Did they take the right immediate actions? (not clicking, not providing credentials, etc.)
3. ESCALATION (0-25): Did they involve the right people? (IT security, manager, CISO?) Proper reporting?
4. DOCUMENTATION (0-25): Did they ask the right clarifying questions? Would they have enough info to file a proper incident report?

Always return ONLY valid JSON with no markdown fences.

For SCORE mode, return exactly:
{"detection":20,"response":18,"escalation":15,"documentation":16,"total":69,"feedback":"...","strengths":["..."],"improvements":["..."]}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mode, messages = [], scenarioContext, provider, model: requestedModel } = body;

  const provider_ = provider ?? process.env.DEFAULT_AI_PROVIDER ?? 'openrouter';
  const primaryModel = requestedModel ?? (
    provider_ === 'ollama'
      ? (process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2')
      : (process.env.OPENROUTER_DEFAULT_MODEL ?? undefined)
  );

  const contextMessage = `SCENARIO CONTEXT: ${scenarioContext}\nMODE: ${mode === 'score' ? 'SCORE — evaluate the conversation and return JSON scores' : 'SIMULATE — stay in character as the attacker/scenario presenter'}`;

  const apiMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: contextMessage },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  try {
    let content = '';

    if (provider_ === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
      let res: Response;
      try {
        res = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: primaryModel, messages: apiMessages, stream: false, options: { temperature: 0.7, num_predict: 1000 } }),
          signal: AbortSignal.timeout(120_000),
        });
      } catch {
        throw new Error(`Ollama is not reachable at ${ollamaUrl}. Start with: ollama serve`);
      }
      if (res.status === 404) throw new Error(`Ollama model "${primaryModel}" not found. Pull it with: ollama pull ${primaryModel}`);
      if (!res.ok) throw new Error(`Ollama error ${res.status}`);
      const data = await res.json();
      content = stripThinkTags(data.message?.content ?? '');
    } else {
      const result = await callOpenRouter(apiMessages, { maxTokens: 1000, temperature: 0.7, primaryModel });
      content = stripThinkTags(result.content);
      fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/usage/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: 'classroom', tokensUsed: result.tokens, model: result.model }),
      }).catch(() => {});
    }

    if (mode === 'score') {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch?.[0] ?? content);
        return NextResponse.json({ score: parsed });
      } catch {
        return NextResponse.json({ error: 'Failed to parse score from AI' }, { status: 422 });
      }
    }

    return NextResponse.json({ message: content.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
