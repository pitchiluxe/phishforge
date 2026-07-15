import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractFinalAnswer, stripThinkTags } from '@/lib/ai/openrouter';

// Seed pool — the generator picks a random subset so every run yields a fresh course.
const TOPIC_SEEDS = [
  { topic: 'File globbing & wildcards',        difficulty: 'Beginner',     color: '#00ff41' },
  { topic: 'Finding files with find & locate', difficulty: 'Intermediate', color: '#34d399' },
  { topic: 'Hard links vs symbolic links',     difficulty: 'Intermediate', color: '#22d3ee' },
  { topic: 'Cron jobs & task scheduling',      difficulty: 'Intermediate', color: '#fb923c' },
  { topic: 'User & group administration',      difficulty: 'Intermediate', color: '#a78bfa' },
  { topic: 'Disk usage & quota analysis',      difficulty: 'Intermediate', color: '#38bdf8' },
  { topic: 'SSH keys & remote access',         difficulty: 'Intermediate', color: '#60a5fa' },
  { topic: 'tmux & terminal multiplexing',     difficulty: 'Intermediate', color: '#4ade80' },
  { topic: 'Regular expressions with grep',    difficulty: 'Advanced',     color: '#facc15' },
  { topic: 'Advanced awk programming',         difficulty: 'Advanced',     color: '#a78bfa' },
  { topic: 'Bash functions & arguments',       difficulty: 'Advanced',     color: '#4ade80' },
  { topic: 'Log parsing & analysis',           difficulty: 'Advanced',     color: '#f472b6' },
  { topic: 'Network sockets with netcat',      difficulty: 'Advanced',     color: '#60a5fa' },
  { topic: 'Nmap scanning techniques',         difficulty: 'Advanced',     color: '#f87171' },
  { topic: 'Hash cracking with john/hashcat',  difficulty: 'Advanced',     color: '#f87171' },
  { topic: 'File permissions & SUID hunting',  difficulty: 'Advanced',     color: '#facc15' },
  { topic: 'Package management deep-dive',     difficulty: 'Beginner',     color: '#38bdf8' },
  { topic: 'Environment & shell configuration',difficulty: 'Intermediate', color: '#818cf8' },
  { topic: 'Process signals & job control',    difficulty: 'Intermediate', color: '#fb923c' },
  { topic: 'Curl & HTTP from the terminal',    difficulty: 'Intermediate', color: '#22d3ee' },
];

const SYSTEM = `You are a senior Linux instructor and CTF coach who designs ONE hands-on TERMINAL lab at a time for a Kali Linux training sandbox.
Every lab teaches real, runnable Linux/bash commands. The learner types commands into a simulated shell and an AI tutor coaches them.
Environment: Kali Linux, user "hacker", home dir with Documents/, Downloads/, scripts/, notes.txt, targets.txt, loot/, wordlists/. Lab network 10.10.10.0/24.
Return ONE JSON object only — no markdown, no prose, no array.`;

interface Seed { topic: string; difficulty: string; color: string }

function buildOnePrompt(seed: Seed, focus: string) {
  const focusLine = focus ? ` Extra focus: ${focus}.` : '';
  return `Design ONE hands-on Linux terminal lab about "${seed.topic}" at ${seed.difficulty} level.${focusLine}
Provide 4 REAL Linux commands that run in bash on Kali, and 4 short hints. Keep it terminal-only (no GUI).

Return ONLY this JSON object (no array, no markdown):
{
  "title": "<specific lab title>",
  "topic": "${seed.topic}",
  "color": "${seed.color}",
  "difficulty": "${seed.difficulty}",
  "objective": "<one sentence: what the learner masters by typing commands>",
  "context": "<2-3 sentences: the concrete task/scenario>",
  "hints": ["<h1>", "<h2>", "<h3>", "<h4>"],
  "starterCommands": ["<cmd1>", "<cmd2>", "<cmd3>", "<cmd4>"]
}`;
}

// Pull a single lab object out of a model reply, tolerating arrays, wrapper
// objects, and markdown noise from smaller local models.
function parseOneLab(raw: string): any | null {
  const looksLikeLab = (o: any) =>
    o && typeof o === 'object' && o.title && o.objective &&
    Array.isArray(o.hints) && Array.isArray(o.starterCommands);

  const tryValue = (v: any): any | null => {
    if (Array.isArray(v)) return v.find(looksLikeLab) ?? null;
    if (looksLikeLab(v)) return v;
    if (v && typeof v === 'object') {
      for (const val of Object.values(v)) {
        const hit = tryValue(val);
        if (hit) return hit;
      }
    }
    return null;
  };

  try {
    const hit = tryValue(JSON.parse(raw));
    if (hit) return hit;
  } catch { /* fall through */ }

  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { const hit = tryValue(JSON.parse(objMatch[0])); if (hit) return hit; } catch { /* ignore */ }
  }
  return null;
}

async function genOne(
  seed: Seed,
  focus: string,
  provider: string,
  model: string | undefined,
): Promise<any | null> {
  const messages = [
    { role: 'system' as const, content: SYSTEM },
    { role: 'user' as const, content: buildOnePrompt(seed, focus) },
  ];

  // Try providers in order and return the first parseable lab, so a throttled or
  // unreachable provider never breaks generation. Ollama first (free/unlimited),
  // then the OpenRouter free-model waterfall.
  const order: ('ollama' | 'openrouter')[] =
    provider === 'openrouter' ? ['openrouter', 'ollama']
    : provider === 'ollama' ? ['ollama', 'openrouter']
    : ['ollama', 'openrouter'];

  for (const p of order) {
    try {
      let raw = '';
      if (p === 'ollama') {
        const ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
        const ollamaModel = provider === 'ollama' && model ? model : (process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2');
        const res = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            messages,
            stream: false,
            format: 'json',
            options: { temperature: 0.9, num_predict: 700 },
          }),
          signal: AbortSignal.timeout(120_000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        raw = stripThinkTags(data.message?.content ?? '');
      } else {
        // Only pass an explicit model if it's an OpenRouter slug; otherwise let the
        // free-model waterfall choose.
        const orModel = model && model.includes('/') ? model : undefined;
        const result = await callOpenRouter(messages, { maxTokens: 700, temperature: 0.85, primaryModel: orModel });
        raw = extractFinalAnswer(result.content);
      }

      const lab = parseOneLab(raw);
      const finalized = lab ? finalizeLab(lab, seed) : null;
      if (finalized) return finalized;
    } catch {
      // try the next provider
    }
  }
  return null;
}

function finalizeLab(lab: any, seed: Seed): any {
    // Small models sometimes wrap text in pseudo-HTML (e.g. "<h1>...</h2>"); strip it.
    const clean = (s: unknown) => String(s).replace(/<\/?[^>]+>/g, '').trim();
    const hints = (lab.hints as any[]).map(clean).filter(Boolean).slice(0, 6);
    const starterCommands = (lab.starterCommands as any[]).map(clean).filter(Boolean).slice(0, 6);
    if (hints.length === 0 || starterCommands.length === 0) return null;
    return {
      title: clean(lab.title),
      topic: lab.topic ?? seed.topic,
      color: lab.color ?? seed.color,
      difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(lab.difficulty) ? lab.difficulty : seed.difficulty,
      objective: clean(lab.objective),
      context: clean(lab.context ?? ''),
      hints,
      starterCommands,
    };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const count: number = Math.min(Math.max(body.count ?? 6, 1), 8);
    const focus: string = body.focus ?? '';
    const provider = body.provider ?? process.env.DEFAULT_AI_PROVIDER ?? 'openrouter';
    const model = body.model ?? (
      provider === 'ollama'
        ? (process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2')
        : (process.env.OPENROUTER_DEFAULT_MODEL ?? undefined)
    );

    const seeds = [...TOPIC_SEEDS].sort(() => Math.random() - 0.5).slice(0, count);

    // One lab per request — reliable across large and small models. Run them together.
    const results = await Promise.allSettled(seeds.map((s) => genOne(s, focus, provider, model)));
    const labs = results
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter((l): l is any => l !== null)
      .map((l, i) => ({ id: `ai-linux-${Date.now()}-${i}`, ...l }));

    if (labs.length === 0) {
      throw new Error('The model did not return any usable labs — please try again.');
    }

    return NextResponse.json({ labs, model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
