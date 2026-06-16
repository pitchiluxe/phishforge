import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractFinalAnswer, trimHistory } from '@/lib/ai/openrouter';

const INSTRUCTOR_PROMPT = `You are CyberLab Instructor, an expert cybersecurity mentor running hands-on interactive security labs inside the PhishForge platform.

Your teaching philosophy:
- Teach by doing, not just explaining. Present realistic terminal output, log snippets, packet captures, and data for the student to analyze.
- Scaffold each lab into 3-6 numbered tasks. Only reveal the next task after the student completes the current one.
- When the student answers, validate their response thoroughly: acknowledge what they got right, correct misconceptions, and explain the WHY behind each concept.
- Adapt difficulty to their responses: if they struggle, give a targeted hint; if they excel, add depth or a challenge bonus step.
- Use realistic tool outputs (Nmap scans, Wireshark captures, SIEM logs, git blame output, etc.) to make labs feel authentic.
- Keep responses structured: use numbered lists, code blocks with backticks, and clear section labels.
- Never just give the answer unprompted — guide the student to discover it.

Lab format:
1. INTRODUCTION: Briefly set the scenario and objective (2-3 sentences max).
2. ENVIRONMENT: Show realistic environment context (tool versions, IP ranges, server names).
3. TASK N: State the task clearly. Present any data/output needed to complete it. Ask a specific question.
4. After each student response: FEEDBACK (what they got right/wrong + explanation) → TASK N+1.
5. DEBRIEF: After all tasks, provide a summary of key lessons, real-world application, and MITRE ATT&CK or framework mapping.

Always stay in the instructor role. Never break character. Never give unsolicited answers.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { labId, labTitle, labDescription, messages = [] } = body;

  const provider = process.env.DEFAULT_AI_PROVIDER ?? 'openrouter';

  const initMsg = messages.length === 0
    ? {
        role: 'user' as const,
        content: `Start the following cybersecurity lab. Introduce it with the scenario, environment context, and first task.\n\nLab ID: ${labId}\nLab Title: ${labTitle}\nLab Description: ${labDescription}`,
      }
    : null;

  const rawMessages = [
    ...(initMsg ? [initMsg] : []),
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  try {
    let content = '';
    let tokensUsed = 0;
    let modelUsed = '';

    if (provider === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
      const ollamaModel = process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2';
      let res: Response;
      try {
        res = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            messages: [{ role: 'system', content: INSTRUCTOR_PROMPT }, ...rawMessages],
            stream: false,
            options: { temperature: 0.5, num_predict: 1200 },
          }),
          signal: AbortSignal.timeout(120_000),
        });
      } catch {
        throw new Error(`Ollama not reachable at ${ollamaUrl}. Start with: ollama serve`);
      }
      if (!res.ok) throw new Error(`Ollama error ${res.status}`);
      const data = await res.json();
      content = data.message?.content ?? '';
      tokensUsed = (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0);
      modelUsed = ollamaModel;
    } else {
      const history = trimHistory(rawMessages, 10);
      const apiMessages = [
        { role: 'system' as const, content: INSTRUCTOR_PROMPT },
        ...history,
      ];
      const result = await callOpenRouter(apiMessages, { maxTokens: 1200, temperature: 0.5 });
      content = extractFinalAnswer(result.content);
      tokensUsed = result.tokens;
      modelUsed = result.model;
    }

    fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/usage/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: 'training', tokensUsed, model: modelUsed }),
    }).catch(() => {});

    return NextResponse.json({ message: content, tokensUsed, model: modelUsed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
