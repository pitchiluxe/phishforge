import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { parseAIJson } from '@/lib/ai/json';

const CATEGORY_SEEDS = [
  { category: 'Active Directory',   difficulty: 'intermediate', color: '#60a5fa' },
  { category: 'Credential Theft',   difficulty: 'advanced',     color: '#f87171' },
  { category: 'Threat Hunting',     difficulty: 'advanced',     color: '#facc15' },
  { category: 'Persistence',        difficulty: 'intermediate', color: '#fb923c' },
  { category: 'Defense Evasion',    difficulty: 'advanced',     color: '#a78bfa' },
  { category: 'C2 Detection',       difficulty: 'advanced',     color: '#34d399' },
  { category: 'Lateral Movement',   difficulty: 'intermediate', color: '#60a5fa' },
  { category: 'Network Security',   difficulty: 'beginner',     color: '#34d399' },
  { category: 'Ransomware',         difficulty: 'advanced',     color: '#f87171' },
  { category: 'Endpoint Hardening', difficulty: 'beginner',     color: '#00ff41' },
  { category: 'Identity Security',  difficulty: 'intermediate', color: '#a78bfa' },
  { category: 'Cloud Security',     difficulty: 'advanced',     color: '#60a5fa' },
  { category: 'Incident Response',  difficulty: 'intermediate', color: '#fb923c' },
  { category: 'Forensics',          difficulty: 'intermediate', color: '#facc15' },
  { category: 'Compliance Audit',   difficulty: 'beginner',     color: '#00ff41' },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const count: number = Math.min(body.count ?? 10, 12);
    const focus: string = body.focus ?? '';

    // Pick `count` random seeds (shuffle and take)
    const shuffled = [...CATEGORY_SEEDS].sort(() => Math.random() - 0.5).slice(0, count);
    const seedList = shuffled
      .map((s, i) => `${i + 1}. Category: "${s.category}", Difficulty: "${s.difficulty}", Color: "${s.color}"`)
      .join('\n');

    const focusLine = focus ? `\nAdditional focus area for realism: ${focus}` : '';

    const system = `You are a senior Windows PowerShell security expert and cybersecurity trainer.
You create realistic, technically accurate PowerShell training scenarios for CONTOSO.LOCAL corporate environment.
The environment has: WIN-DC01 (DC), WIN-WKS01-10 (workstations), WIN-SRV01 (file server), WIN-WEB01 (IIS).
Users: john.smith (admin), sarah.jones (manager), svc_backup, svc_sql, m.rodriguez, k.patel, temp_contractor01.
Generate scenarios that teach real security skills using real PowerShell commands. Return valid JSON only.`;

    const user = `Generate ${count} distinct PowerShell cybersecurity training scenarios.${focusLine}

Seeds (use these categories and difficulties):
${seedList}

For each scenario, provide 4 realistic starter commands and 4 investigation hints.
Starter commands must be REAL PowerShell commands that work in a Windows Server / AD environment.

Return ONLY a valid JSON array — no markdown, no explanation:
[
  {
    "id": "ai-ps-<N>",
    "title": "<specific scenario title — not generic>",
    "category": "<exact category from seed>",
    "color": "<hex color from seed>",
    "difficulty": "<Beginner|Intermediate|Advanced>",
    "objective": "<one sentence: what the analyst must accomplish>",
    "context": "<2-3 sentences: the incident situation that triggered this investigation — be specific with CONTOSO environment details>",
    "hints": ["<hint 1>", "<hint 2>", "<hint 3>", "<hint 4>"],
    "starterCommands": [
      "<real PS command 1>",
      "<real PS command 2>",
      "<real PS command 3>",
      "<real PS command 4>"
    ]
  }
]`;

    const result = await callOpenRouter(
      [{ role: 'system', content: system }, { role: 'user', content: user }],
      { maxTokens: 3000, temperature: 0.82 },
    );

    const parsed = parseAIJson<unknown>(result.content);
    const scenarios: any[] = Array.isArray(parsed)
      ? parsed
      : ((parsed as { scenarios?: any[] })?.scenarios ?? []);

    // Validate each entry has required fields
    const valid = scenarios.filter(
      (s: any) => s.id && s.title && s.objective && s.context && Array.isArray(s.hints) && Array.isArray(s.starterCommands),
    );
    if (valid.length === 0) throw new Error('No valid scenarios in AI response');

    return NextResponse.json({ scenarios: valid, model: result.model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
