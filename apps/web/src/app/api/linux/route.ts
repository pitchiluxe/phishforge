import { NextRequest, NextResponse } from 'next/server';
import { callAI, extractFinalAnswer, trimHistory } from '@/lib/ai/openrouter';

const SYSTEM_PROMPT = `You are a Linux terminal environment simulator AND a friendly hands-on tutor, running an interactive shell for cybersecurity / terminal-mastery training inside the PhishForge platform.

**Environment:**
- Distro: Kali Linux 2024.4 (Debian-based) running in a safe training sandbox
- Shell: bash 5.2
- Current user: hacker (non-root, can use sudo for lab tasks)
- Prompt style: hacker@kali:~$
- Home dir seeded with realistic files: Documents/, Downloads/, scripts/, notes.txt, targets.txt, loot/, wordlists/, .bashrc, .ssh/
- Common tools installed: coreutils, grep, sed, awk, find, nmap, netcat, curl, wget, ssh, tcpdump, john, hashcat, hydra, gobuster, python3, git, vim, nano, tar, gzip, chmod, chown, ps, top, systemctl, ufw, iptables, ip, ss
- Fictional lab network: 10.10.10.0/24 (targets), 192.168.56.0/24 (host-only)

**Response format — ALWAYS use exactly this structure:**
<output>
[Realistic Linux/bash terminal output for the command the student typed. Match real tool formatting exactly — ls listings, permission strings like -rwxr-xr-x, ps columns, nmap scan reports, grep matches, etc. For listings, show 6-15 realistic entries. Keep everything consistent with the seeded home dir and lab network above and with the current scenario.]
</output>
<lesson>
[2-4 sentence tutor note so the learner is never lost: explain what the command did, why it matters, and give ONE next-step nudge or pro tip. Encouraging, concise, plain language. If the student seems stuck, suggest the exact next command to try.]
</lesson>

**Rules:**
- Stay in character as the live Kali shell. Generate plausible but fictional data (fake IPs in the lab ranges, fake hostnames, fake hashes/creds).
- If the command has a syntax error or the binary is missing, show the real bash error format (e.g. "bash: foo: command not found") and mark it with [ERROR], then in the lesson gently explain the fix.
- For destructive commands (rm -rf /, :(){ :|:& };:, mkfs, dd to a disk, chmod -R 777 /), DO NOT simulate damage — explain in the output that the sandbox blocked it and in the lesson teach what it would have done and why it's dangerous.
- Keep offensive tooling strictly educational and scoped to the fictional authorized lab network. Never produce instructions for attacking real, non-consenting systems.
- Reward correct progress in the lesson; if the learner completes the scenario objective, congratulate them and suggest what to master next.
- Always return BOTH the <output> and <lesson> blocks, even for errors.`;

// Split the model's reply into terminal output + tutor lesson.
// Handles three formats so it works across large (OpenRouter) and small (Ollama)
// models: <output>/<lesson> XML tags, plain "output:"/"lesson:" labels, or,
// as a last resort, everything as output with no separate lesson.
function parseTutorResponse(raw: string): { output: string; lesson: string } {
  // Remove any stray/partial tag or label markers a small model may leak.
  const stripMarkers = (s: string) =>
    s
      .replace(/<\/?(output|lesson)>/gi, '')
      .replace(/^\s*\**\s*(output|lesson)\s*\**\s*:?\s*$/gim, '')
      .replace(/^[ \t]*\n/gm, '\n')
      .trim();

  const xmlOut = raw.match(/<output>([\s\S]*?)<\/output>/i);
  const xmlLesson = raw.match(/<lesson>([\s\S]*?)<\/lesson>/i);
  if (xmlOut || xmlLesson) {
    return {
      output: stripMarkers(xmlOut ? xmlOut[1] : raw),
      lesson: stripMarkers(xmlLesson ? xmlLesson[1] : ''),
    };
  }

  // Split on a "lesson" marker line OR a lone <lesson> tag the model emitted.
  const lessonSplit = raw.split(/^\s*(?:<\/?lesson>|\**\s*lesson\s*\**\s*:?)\s*$/im);
  if (lessonSplit.length >= 2) {
    return {
      output: stripMarkers(lessonSplit[0]),
      lesson: stripMarkers(lessonSplit.slice(1).join('\n')),
    };
  }

  // Last resort: everything is output, markers stripped.
  return { output: stripMarkers(raw), lesson: '' };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    command,
    history = [],
    scenario = 'General Linux Terminal',
    scenarioContext = '',
    provider,
    model: requestedModel,
  } = body;

  if (!command?.trim()) {
    return NextResponse.json({ error: 'command is required' }, { status: 400 });
  }

  const systemWithScenario = scenarioContext
    ? `${SYSTEM_PROMPT}\n\n**Current Training Scenario:** ${scenario}\n${scenarioContext}`
    : SYSTEM_PROMPT;

  const rawMessages = [
    ...history.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: `hacker@kali:~$ ${command}` },
  ];

  const trimmed = trimHistory(rawMessages, 8);
  const apiMessages = [{ role: 'system' as const, content: systemWithScenario }, ...trimmed];

  try {
    // callAI is resilient: it prefers local Ollama (free, unlimited) and, if that is
    // unavailable, waterfalls through the free OpenRouter models. Never a single point of failure.
    const result = await callAI(apiMessages, {
      maxTokens: 800,
      temperature: 0.4,
      primaryModel: requestedModel,
      preferProvider: (provider as 'ollama' | 'openrouter' | 'auto') ?? 'auto',
    });
    const raw = extractFinalAnswer(result.content);
    const modelUsed = result.model;
    fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/usage/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: 'training', tokensUsed: result.tokens, model: result.model }),
    }).catch(() => {});

    const { output, lesson } = parseTutorResponse(raw);

    return NextResponse.json({ output, lesson, model: modelUsed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terminal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
