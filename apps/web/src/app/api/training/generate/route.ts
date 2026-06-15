import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SCENARIO_SEEDS = [
  { category: 'Phishing', difficulty: 'intermediate' },
  { category: 'BEC', difficulty: 'advanced' },
  { category: 'Ransomware', difficulty: 'advanced' },
  { category: 'Spear Phishing', difficulty: 'intermediate' },
  { category: 'Social Engineering', difficulty: 'beginner' },
  { category: 'Vishing', difficulty: 'intermediate' },
  { category: 'Supply Chain', difficulty: 'advanced' },
  { category: 'Insider Threat', difficulty: 'intermediate' },
  { category: 'Cloud Misconfiguration', difficulty: 'intermediate' },
  { category: 'Credential Stuffing', difficulty: 'beginner' },
  { category: 'Deepfake CEO Fraud', difficulty: 'advanced' },
  { category: 'QR Code Phishing', difficulty: 'intermediate' },
  { category: 'OAuth App Abuse', difficulty: 'advanced' },
  { category: 'SMS Smishing', difficulty: 'beginner' },
  { category: 'MFA Bypass', difficulty: 'advanced' },
];

const LAB_SEEDS = [
  { title: 'Malware PCAP Analysis', category: 'Network Security', difficulty: 'intermediate' },
  { title: 'Phishing Kit Forensics', category: 'Threat Intelligence', difficulty: 'intermediate' },
  { title: 'AWS CloudTrail Log Investigation', category: 'Cloud Security', difficulty: 'advanced' },
  { title: 'Active Directory Attack Paths', category: 'Identity Security', difficulty: 'advanced' },
  { title: 'Memory Forensics with Volatility', category: 'Forensics', difficulty: 'advanced' },
  { title: 'Python Malware Static Analysis', category: 'Malware Analysis', difficulty: 'intermediate' },
  { title: 'Splunk SIEM Alert Triage', category: 'SOC Operations', difficulty: 'beginner' },
  { title: 'Kubernetes RBAC Hardening', category: 'Cloud Security', difficulty: 'advanced' },
  { title: 'Burp Suite API Testing', category: 'Web Security', difficulty: 'intermediate' },
  { title: 'Windows Event Log Forensics', category: 'Forensics', difficulty: 'intermediate' },
  { title: 'Linux Rootkit Detection', category: 'Endpoint Security', difficulty: 'advanced' },
  { title: 'Microsoft Sentinel KQL Hunting', category: 'Threat Hunting', difficulty: 'intermediate' },
  { title: 'OSINT Recon & Attack Surface Mapping', category: 'Reconnaissance', difficulty: 'beginner' },
  { title: 'Email Header Forensics', category: 'Incident Response', difficulty: 'beginner' },
  { title: 'JWT & OAuth Token Abuse', category: 'Web Security', difficulty: 'advanced' },
];

const FREE_MODELS = [
  'deepseek/deepseek-r1:free',
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-8b:free',
  'mistralai/mistral-7b-instruct:free',
];

function extractFinalAnswer(text: string): string {
  const thinkEnd = text.lastIndexOf('</think>');
  return thinkEnd !== -1 ? text.slice(thinkEnd + 8).trim() : text.trim();
}

function extractJSON(text: string): any {
  const cleaned = extractFinalAnswer(text);
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  return JSON.parse(jsonMatch[0]);
}

async function callAI(client: OpenAI, defaultModel: string, system: string, user: string): Promise<string> {
  const models = [defaultModel, ...FREE_MODELS.filter(m => m !== defaultModel)];
  let lastErr: Error | null = null;
  for (const m of models) {
    try {
      const res = await client.chat.completions.create({
        model: m,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        temperature: 0.85,
        max_tokens: 1500,
      });
      const c = res.choices[0].message.content ?? '';
      if (c) return c;
    } catch (e: unknown) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr ?? new Error('All models failed');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const type: 'scenario' | 'lab' | 'batch-scenarios' = body.type ?? 'scenario';
    const count = Math.min(body.count ?? 1, 6);

    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'https://phishforge.ai',
        'X-Title': 'PhishForge Training',
      },
    });
    const defaultModel = process.env.OPENROUTER_DEFAULT_MODEL ?? 'deepseek/deepseek-r1:free';

    if (type === 'batch-scenarios') {
      // Generate multiple scenario summaries in one call
      const seeds = [...SCENARIO_SEEDS].sort(() => Math.random() - 0.5).slice(0, count);
      const seedList = seeds.map((s, i) => `${i + 1}. Category: ${s.category}, Difficulty: ${s.difficulty}`).join('\n');

      const system = `You are a cybersecurity red team expert creating realistic attack scenarios for security awareness training. Generate scenarios that reflect 2025 threat landscape. Return valid JSON only.`;
      const user = `Generate ${count} distinct attack scenarios for employee security training.

Seeds:
${seedList}

Return ONLY a JSON array:
[
  {
    "id": "ai-scenario-<N>",
    "title": "<scenario title>",
    "category": "<category from seed>",
    "difficulty": "<difficulty from seed>",
    "description": "<2 sentence scenario overview>",
    "scenarioContext": "<3-4 sentence detailed setup describing the attack situation the trainee will face — written in second person as if briefing the trainee>",
    "tags": ["<tag1>", "<tag2>", "<tag3>"],
    "estimatedMin": <15-40>,
    "xpReward": <75-250>
  }
]`;

      const raw = await callAI(client, defaultModel, system, user);
      const cleaned = extractFinalAnswer(raw);
      const arrMatch = cleaned.match(/\[[\s\S]*\]/);
      if (!arrMatch) throw new Error('No array in response');
      const scenarios = JSON.parse(arrMatch[0]);
      return NextResponse.json({ scenarios, model: defaultModel });
    }

    if (type === 'lab') {
      const seed = LAB_SEEDS[Math.floor(Math.random() * LAB_SEEDS.length)];
      const topic = body.topic ?? seed.title;
      const category = body.category ?? seed.category;
      const difficulty = body.difficulty ?? seed.difficulty;

      const system = `You are a senior cybersecurity trainer creating hands-on lab exercises. Generate realistic, technically accurate content for 2025. Return valid JSON only.`;
      const user = `Generate a hands-on cybersecurity lab exercise:
Topic: "${topic}"
Category: ${category}
Difficulty: ${difficulty}

Return ONLY valid JSON:
{
  "id": "ai-lab-${Date.now()}",
  "title": "<lab title>",
  "description": "<2-3 sentences>",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "estimatedMin": <20-50>,
  "xpReward": <100-300>,
  "color": "<tailwind-safe hex like #60a5fa or #00ff41 or #a78bfa or #f87171 or #facc15>",
  "tags": ["<tag1>", "<tag2>", "<tag3>", "<tag4>"],
  "scenario": "<3-4 sentence realistic incident scenario describing the situation>",
  "objectives": ["<objective 1>", "<objective 2>", "<objective 3>"],
  "steps": [
    {
      "id": 1,
      "title": "<step title>",
      "instruction": "<2-3 sentence instruction>",
      "hint": "<helpful hint for if they're stuck>",
      "expectedOutput": "<what a correct response looks like>"
    },
    {
      "id": 2,
      "title": "<step title>",
      "instruction": "<instruction>",
      "hint": "<hint>",
      "expectedOutput": "<expected>"
    },
    {
      "id": 3,
      "title": "<step title>",
      "instruction": "<instruction>",
      "hint": "<hint>",
      "expectedOutput": "<expected>"
    },
    {
      "id": 4,
      "title": "<step title>",
      "instruction": "<instruction>",
      "hint": "<hint>",
      "expectedOutput": "<expected>"
    }
  ],
  "tools": ["<tool1>", "<tool2>", "<tool3>"],
  "resources": [
    { "label": "<resource name>", "url": "<real URL>" }
  ]
}`;

      const raw = await callAI(client, defaultModel, system, user);
      const lab = extractJSON(raw);
      lab.id = lab.id ?? `ai-lab-${Date.now()}`;
      return NextResponse.json({ lab, model: defaultModel });
    }

    // Single scenario
    const seed = SCENARIO_SEEDS[Math.floor(Math.random() * SCENARIO_SEEDS.length)];
    const category = body.category ?? seed.category;
    const difficulty = body.difficulty ?? seed.difficulty;

    const system = `You are a cybersecurity red team expert creating realistic attack scenarios for training. Return valid JSON only.`;
    const user = `Generate a cybersecurity attack scenario for security awareness training:
Category: ${category}
Difficulty: ${difficulty}

Return ONLY valid JSON:
{
  "id": "ai-scenario-${Date.now()}",
  "title": "<scenario title>",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "description": "<2-3 sentences>",
  "scenarioContext": "<3-4 sentence setup for the trainee — written in second person>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "estimatedMin": <15-35>,
  "xpReward": <75-200>
}`;

    const raw = await callAI(client, defaultModel, system, user);
    const scenario = extractJSON(raw);
    scenario.id = scenario.id ?? `ai-scenario-${Date.now()}`;
    return NextResponse.json({ scenario, model: defaultModel });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
