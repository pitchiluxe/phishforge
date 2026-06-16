import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractFinalAnswer } from '@/lib/ai/openrouter';

const ALL_CATS = ['Ransomware', 'Zero-Day', 'APT', 'Phishing', 'Data Breach', 'Cloud Security', 'Vulnerability', 'Nation-State', 'Malware', 'AI Security', 'Supply Chain', 'Incident Response'];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const count: number = Math.min(body.count ?? 9, 12);
  const category: string | null = body.category ?? null;
  const cats = category ? [category] : ALL_CATS;

  const today = new Date().toISOString().split('T')[0];

  const prompt = `You are a cybersecurity journalist. Generate exactly ${count} realistic cybersecurity news articles as a JSON array.

Each article must have these fields:
{
  "id": "news-XXX" (unique, e.g. news-001),
  "title": "compelling headline, 8-15 words",
  "summary": "2-3 sentence executive summary of the threat or development",
  "category": one of: ${cats.join(', ')},
  "severity": one of: "critical" | "high" | "medium" | "low",
  "date": ISO date string within the last 7 days before ${today},
  "content": "4-5 paragraph detailed article. Include technical details, affected systems, threat actor names, CVE numbers where applicable, and recommended mitigations.",
  "tags": ["tag1", "tag2", "tag3"],
  "source": "realistic news source name like 'CyberWatch', 'SecOps Weekly', 'ThreatPost Daily'",
  "tldr": "one sentence TL;DR for busy professionals"
}

Requirements:
- Mix severity levels (at least 2 critical, 3 high, 3 medium, 1 low)
- Reference real threat actor names (LockBit, Lazarus, Volt Typhoon, APT28 etc)
- Include plausible CVE IDs for vulnerability articles
- Vary categories across the ${count} articles
- Make content technically accurate and grounded in current cyber trends
- Return ONLY the valid JSON array, no markdown fences`;

  try {
    const result = await callOpenRouter(
      [{ role: 'user', content: prompt }],
      { maxTokens: 4000, temperature: 0.75 },
    );

    let raw = extractFinalAnswer(result.content);
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Find the JSON array bounds
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']');
    if (start !== -1 && end !== -1) raw = raw.slice(start, end + 1);

    const news = JSON.parse(raw);
    return NextResponse.json({ news, model: result.model, generatedAt: new Date().toISOString() });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate news' },
      { status: 500 },
    );
  }
}
