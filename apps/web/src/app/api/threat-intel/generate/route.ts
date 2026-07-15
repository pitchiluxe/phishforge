import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { parseAIJson } from '@/lib/ai/json';

function randomDate(daysAgo: number) {
  const d = new Date(Date.now() - Math.floor(Math.random() * daysAgo) * 86400000);
  return d.toISOString();
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const count: number = Math.min(body.count ?? 35, 40);

  const systemPrompt = `You are a cybersecurity threat intelligence analyst. Generate realistic, technically accurate threat intelligence reports for security teams.`;

  const userPrompt = `Generate exactly ${count} unique cybersecurity threat intelligence items as a JSON array. Each item must have this exact shape:
{"title":"string (max 80 chars)","severity":"critical|high|medium|low","category":"string","description":"2-3 sentences of technical detail","industries":["string"],"mitre":"T1xxx, T1xxx"}

Rules:
- Mix severities: ~20% critical, ~35% high, ~30% medium, ~15% low
- Mix categories: ransomware, apt, phishing, bec, supply-chain, cloud-misconfiguration, social-engineering, credential-theft, malware, insider-threat, web-attack, ai-threat, zero-day, lateral-movement, edr-bypass, edr-tampering
- Mix industries: finance, healthcare, tech, government, retail, energy, education, manufacturing, saas
- Reference real 2025-2026 threat actors (LockBit 4.0, Volt Typhoon, Scattered Spider, Midnight Blizzard, FIN7, Lazarus Group, etc.)
- Include real CVEs, MITRE ATT&CK technique IDs, and tool names
- Make descriptions technically specific, not generic
- IMPORTANT: At least 4 items must be specifically about CrowdStrike Falcon Sensor, CrowdStrike EDR, CrowdStrike Falcon Identity Protection, or CrowdStrike RTR (Real Time Response). Cover topics like: BYOVD attacks bypassing Falcon, Falcon sensor tampering, EDR telemetry evasion against CrowdStrike, Falcon content-update pipeline risks, container escape gaps in Falcon for Cloud, Kerberoasting in partial Falcon deployments, process hollowing defeating Falcon hooks, insider abuse of Falcon RTR sessions.
- Return ONLY the JSON array — no markdown fences, no preamble`;

  let raw = '';
  try {
    const result = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { maxTokens: 6000, temperature: 0.9 },
    );
    raw = result.content;
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'All models failed' }, { status: 500 });
  }

  if (!raw) {
    return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });
  }

  let threats: any[] = [];
  try {
    const parsed = parseAIJson<unknown>(raw);
    threats = Array.isArray(parsed) ? parsed : ((parsed as { threats?: any[] })?.threats ?? []);
    if (threats.length === 0) throw new Error('empty');
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON', raw: raw.slice(0, 300) }, { status: 422 });
  }

  // Normalise and add server-side fields
  const normalised = threats.slice(0, count).map((t: any, i: number) => ({
    id: `ai-${Date.now()}-${i}`,
    title: String(t.title ?? '').slice(0, 120),
    severity: ['critical', 'high', 'medium', 'low'].includes(t.severity) ? t.severity : 'medium',
    category: String(t.category ?? 'threat'),
    description: String(t.description ?? ''),
    industries: Array.isArray(t.industries) ? t.industries : ['all'],
    mitre: String(t.mitre ?? ''),
    published_at: randomDate(60),
    isAI: true,
  }));

  return NextResponse.json({ threats: normalised });
}
