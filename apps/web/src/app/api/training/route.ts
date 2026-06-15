import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are CyberForge-Trainer, an AI-powered cybersecurity training system running realistic phishing and social engineering attack simulations for authorized security awareness training.

Your role:
- SIMULATE: Play the role of a realistic attacker or threat scenario. Be convincing. Use real social engineering tactics. The trainee is practicing how to respond correctly.
- SCORE: Objectively evaluate the trainee's responses across 4 dimensions.

IMPORTANT RULES:
- This is authorized security training. Always stay in character during simulation.
- Make scenarios challenging but realistic—use real-world attack patterns.
- After 4-6 exchanges in a simulation, you can optionally signal the scenario is concluding.
- For scoring, be fair but honest about weaknesses.

SCORING DIMENSIONS (0-25 each, 100 total):
- DETECTION: Did they recognize the threat? Did they call out specific red flags?
- RESPONSE: Correct immediate action (don't click, don't share credentials, verify via official channel)?
- ESCALATION: Did they involve IT/security/manager? Did they report it properly?
- AWARENESS: Did they demonstrate security knowledge? Ask right questions? Maintain skepticism throughout?

Return ONLY valid JSON for score mode:
{"detection":0-25,"response":0-25,"escalation":0-25,"awareness":0-25,"total":0-100,"verdict":"pass|review|fail","feedback":"...","keyStrengths":["..."],"areasToImprove":["..."]}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mode, scenario, messages = [], provider, model: requestedModel } = body;

  const provider_ = provider ?? process.env.DEFAULT_AI_PROVIDER ?? 'openrouter';
  const model = requestedModel ?? (
    provider_ === 'ollama'
      ? (process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2')
      : (process.env.OPENROUTER_DEFAULT_MODEL ?? 'deepseek/deepseek-chat-v3-0324')
  );

  const contextPrompt = mode === 'score'
    ? `SCORE MODE: Evaluate this training session for scenario "${scenario.title}". Context: ${scenario.context}. Return JSON scores only.`
    : `SIMULATE MODE: You are running a "${scenario.title}" scenario. Context: ${scenario.context}. ${messages.length === 0 ? 'Start the scenario now — present the attack/situation to the trainee.' : 'Continue the scenario based on the trainee\'s last response.'}`;

  const apiMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: contextPrompt },
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
          body: JSON.stringify({ model, messages: apiMessages, stream: false, options: { temperature: 0.75, num_predict: 900 } }),
          signal: AbortSignal.timeout(120_000),
        });
      } catch {
        throw new Error(`Ollama is not reachable at ${ollamaUrl}. Start with: ollama serve`);
      }
      if (res.status === 404) throw new Error(`Ollama model "${model}" not found. Pull it: ollama pull ${model}`);
      if (!res.ok) throw new Error(`Ollama error ${res.status}`);
      const data = await res.json();
      content = data.message?.content ?? '';
    } else {
      const client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY!,
        baseURL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'https://phishforge.ai',
          'X-Title': 'PhishForge Training',
        },
      });
      const freeModels = [
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'meta-llama/llama-3.1-8b-instruct:free',
        'qwen/qwen3-8b:free',
        'mistralai/mistral-7b-instruct:free',
      ];
      const modelsToTry = [model, ...freeModels.filter(m => m !== model)];
      let lastErr: Error | null = null;
      let tokensUsed = 0;
      let modelUsed = model;
      for (const m of modelsToTry) {
        try {
          const completion = await client.chat.completions.create({
            model: m,
            messages: apiMessages,
            temperature: 0.75,
            max_tokens: 900,
          });
          content = completion.choices[0].message.content ?? '';
          if (content) {
            tokensUsed = completion.usage?.total_tokens ?? 0;
            modelUsed = m;
            break;
          }
        } catch (e: unknown) {
          lastErr = e instanceof Error ? e : new Error(String(e));
        }
      }
      if (!content) throw lastErr ?? new Error('All models failed.');
      fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/usage/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: 'training', tokensUsed, model: modelUsed }),
      }).catch(() => {});
    }

    if (mode === 'score') {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch?.[0] ?? content);
        return NextResponse.json({ score: parsed });
      } catch {
        return NextResponse.json({ error: 'Failed to parse score response' }, { status: 422 });
      }
    }

    return NextResponse.json({ message: content.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
