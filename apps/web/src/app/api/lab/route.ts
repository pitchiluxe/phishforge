import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

const FREE_MODELS = [
  'deepseek/deepseek-r1:free',
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'qwen/qwen3-8b:free',
  'mistralai/mistral-7b-instruct:free',
];

function extractFinalAnswer(text: string): string {
  const thinkEnd = text.lastIndexOf('</think>');
  if (thinkEnd !== -1) return text.slice(thinkEnd + 8).trim();
  return text.trim();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { labId, labTitle, labDescription, messages = [] } = body;

  const provider = process.env.DEFAULT_AI_PROVIDER ?? 'openrouter';
  const defaultModel = process.env.OPENROUTER_DEFAULT_MODEL ?? 'deepseek/deepseek-r1:free';

  const systemMsg = {
    role: 'system' as const,
    content: INSTRUCTOR_PROMPT,
  };

  const initMsg = messages.length === 0
    ? {
        role: 'user' as const,
        content: `Start the following cybersecurity lab. Introduce it with the scenario, environment context, and first task.\n\nLab ID: ${labId}\nLab Title: ${labTitle}\nLab Description: ${labDescription}`,
      }
    : null;

  const apiMessages = [
    systemMsg,
    ...(initMsg ? [initMsg] : []),
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  try {
    let content = '';
    let tokensUsed = 0;
    let modelUsed = defaultModel;

    if (provider === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
      const ollamaModel = process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2';
      let res: Response;
      try {
        res = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: ollamaModel, messages: apiMessages, stream: false, options: { temperature: 0.5, num_predict: 1200 } }),
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
      const client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY!,
        baseURL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'https://phishforge.ai',
          'X-Title': 'PhishForge Lab',
        },
      });

      const modelsToTry = [defaultModel, ...FREE_MODELS.filter(m => m !== defaultModel)];
      let lastErr: Error | null = null;

      for (const m of modelsToTry) {
        try {
          const res = await client.chat.completions.create({
            model: m,
            messages: apiMessages,
            temperature: 0.5,
            max_tokens: 1200,
          });
          content = res.choices[0].message.content ?? '';
          if (content) {
            tokensUsed = res.usage?.total_tokens ?? 0;
            modelUsed = m;
            break;
          }
        } catch (e: unknown) {
          lastErr = e instanceof Error ? e : new Error(String(e));
        }
      }
      if (!content) throw lastErr ?? new Error('All models failed.');
    }

    fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/usage/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: 'training', tokensUsed, model: modelUsed }),
    }).catch(() => {});

    return NextResponse.json({ message: extractFinalAnswer(content), tokensUsed, model: modelUsed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
