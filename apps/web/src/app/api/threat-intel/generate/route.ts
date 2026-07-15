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
  let aiFailed = false;
  try {
    const result = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { maxTokens: 6000, temperature: 0.9 },
    );
    raw = result.content;
  } catch {
    aiFailed = true;
  }

  let threats: any[] = [];
  if (!aiFailed && raw) {
    try {
      const parsed = parseAIJson<unknown>(raw);
      threats = Array.isArray(parsed) ? parsed : ((parsed as { threats?: any[] })?.threats ?? []);
    } catch {
      threats = [];
    }
  }

  // Graceful fallback: if the AI provider is unavailable/rate-limited or returned
  // nothing usable, serve a curated threat set so the tab always has content.
  if (threats.length === 0) {
    const chosen = [...FALLBACK_THREATS].sort(() => Math.random() - 0.5).slice(0, count);
    const normalised = chosen.map((t, i) => ({
      id: `curated-${Date.now()}-${i}`,
      ...t,
      published_at: randomDate(30),
      isAI: false,
    }));
    return NextResponse.json({ threats: normalised, fallback: true });
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

// Curated fallback threats used when the AI provider is unavailable/rate-limited.
const FALLBACK_THREATS: { title: string; severity: string; category: string; description: string; industries: string[]; mitre: string }[] = [
  { title: 'LockBit-style affiliate deploys ransomware via unpatched VPN appliances', severity: 'critical', category: 'ransomware', description: 'An affiliate is exploiting unpatched edge VPN devices for initial access, then encrypting file shares and exfiltrating data ahead of encryption to pressure payment.', industries: ['healthcare', 'finance', 'manufacturing'], mitre: 'T1190, T1486' },
  { title: 'Volt Typhoon expands living-off-the-land activity in critical infrastructure', severity: 'high', category: 'apt', description: 'State-sponsored actors abuse built-in Windows tooling (wmic, netsh, PowerShell) and valid accounts to persist in telecom and energy networks while avoiding malware-based detection.', industries: ['energy', 'government', 'tech'], mitre: 'T1059, T1078' },
  { title: 'Adversary-in-the-middle phishing kit bypasses one-time-code MFA at scale', severity: 'high', category: 'phishing', description: 'A phishing-as-a-service kit proxies victims through a real-time reverse proxy, capturing live session cookies to defeat SMS and app-based MFA across major SaaS platforms.', industries: ['finance', 'saas', 'retail'], mitre: 'T1557, T1539' },
  { title: 'Infostealer surge via fake browser updates feeds account-takeover market', severity: 'medium', category: 'credential-theft', description: 'Infostealers delivered through malvertising and fake update prompts harvest saved passwords and cookies, which are resold and used to bypass MFA on corporate accounts.', industries: ['all'], mitre: 'T1555, T1539' },
  { title: 'Software supply-chain attack trojanizes a popular open-source package', severity: 'high', category: 'supply-chain', description: 'Attackers compromised a maintainer account and briefly published a backdoored release that exfiltrated CI secrets during installation before it was pulled.', industries: ['tech', 'saas'], mitre: 'T1195, T1552' },
  { title: 'Business email compromise targets finance teams with vendor-payment fraud', severity: 'high', category: 'bec', description: 'Threat actors impersonate executives and known vendors to redirect wire payments to attacker-controlled accounts, often after a period of mailbox reconnaissance.', industries: ['finance', 'manufacturing', 'retail'], mitre: 'T1566, T1534' },
  { title: 'Cloud storage misconfiguration exposes millions of customer records', severity: 'high', category: 'cloud-misconfiguration', description: 'A publicly readable object-storage bucket left exposed during a migration leaked PII for weeks; access logs show at least one external bulk download.', industries: ['tech', 'healthcare', 'retail'], mitre: 'T1530, T1078' },
  { title: 'Kerberoasting used for lateral movement in partial EDR deployments', severity: 'medium', category: 'lateral-movement', description: 'Adversaries request service tickets for accounts with weak passwords and crack them offline to escalate, favoring hosts where endpoint coverage is incomplete.', industries: ['finance', 'government', 'tech'], mitre: 'T1558, T1550' },
  { title: 'BYOVD attacks abuse signed vulnerable drivers to disable security tooling', severity: 'critical', category: 'edr-bypass', description: 'Bring-your-own-vulnerable-driver techniques load a legitimately signed but flawed driver to terminate or blind endpoint agents before deploying further payloads.', industries: ['all'], mitre: 'T1211, T1562' },
  { title: 'Zero-day in widely used web framework enables server-side request forgery', severity: 'medium', category: 'zero-day', description: 'A newly disclosed SSRF flaw lets attackers coerce servers into reaching internal cloud metadata endpoints, potentially exposing temporary credentials.', industries: ['tech', 'saas'], mitre: 'T1190, T1552' },
];
