import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { parseAIJson } from '@/lib/ai/json';

const ALL_CATS = ['Ransomware', 'Zero-Day', 'APT', 'Phishing', 'Data Breach', 'Cloud Security', 'Vulnerability', 'Nation-State', 'Malware', 'AI Security', 'Supply Chain', 'Incident Response'];

// Curated synthetic fallback so the feed is never empty when the AI provider is
// slow/unavailable or returns unparseable output. Clearly labelled as awareness
// content in the UI. Dates are filled in relative to "now" at request time.
interface NewsItem {
  id: string; title: string; summary: string; category: string; severity: string;
  date: string; content: string; tags: string[]; source: string; tldr: string;
}

const FALLBACK_SEEDS: Omit<NewsItem, 'id' | 'date'>[] = [
  {
    title: 'LockBit-Style Affiliate Deploys Fresh Ransomware Against Healthcare Providers',
    category: 'Ransomware', severity: 'critical', source: 'CyberWatch',
    tldr: 'A ransomware affiliate is encrypting hospital file shares after phishing-based initial access — patch VPNs and enforce MFA now.',
    summary: 'A ransomware affiliate group is targeting regional healthcare providers, encrypting file shares and threatening to leak patient data. Initial access has been traced to phished VPN credentials and unpatched edge devices.',
    content: 'Security teams at several regional hospital networks report a coordinated ransomware campaign encrypting shared drives and clinical systems.\n\nInvestigators link initial access to phished VPN credentials reused across accounts without multi-factor authentication, followed by rapid lateral movement to backup servers.\n\nThe operators exfiltrate data before encryption and post victims to a leak site to pressure payment.\n\nRecommended mitigations: enforce phishing-resistant MFA on all remote access, isolate and test offline backups, patch internet-facing appliances, and monitor for mass file-rename activity.',
    tags: ['ransomware', 'healthcare', 'mfa'],
  },
  {
    title: 'Critical Zero-Day in Widely Used Edge VPN Appliance Exploited in the Wild',
    category: 'Zero-Day', severity: 'critical', source: 'ThreatPost Daily',
    tldr: 'An unauthenticated RCE zero-day in a popular VPN appliance is under active exploitation — apply the vendor hotfix immediately.',
    summary: 'An unauthenticated remote code execution flaw in a popular VPN gateway is being exploited to drop web shells. A vendor hotfix is available and should be applied immediately.',
    content: 'A newly disclosed vulnerability (tracked as CVE-2026-XXXXX) allows unauthenticated attackers to run code on a widely deployed VPN appliance.\n\nThreat actors are chaining the flaw to install web shells and harvest session tokens, enabling persistent access even after patching.\n\nOrganizations should apply the emergency hotfix, rotate all credentials and session secrets, and hunt for unexpected files in the appliance web root.\n\nNetwork defenders are advised to review VPN logs for anomalous authentication and to treat any pre-patch compromise as a full incident.',
    tags: ['zero-day', 'vpn', 'rce'],
  },
  {
    title: 'Nation-State Group Volt Typhoon Expands Living-off-the-Land Campaign',
    category: 'APT', severity: 'high', source: 'SecOps Weekly',
    tldr: 'A state-sponsored actor is abusing built-in Windows tools to stay hidden in critical infrastructure networks — audit LOLBin usage.',
    summary: 'A state-sponsored actor continues to target critical infrastructure using living-off-the-land techniques that evade traditional detection, relying on built-in system tools rather than malware.',
    content: 'Analysts report continued activity from a nation-state group focused on critical infrastructure and telecommunications.\n\nThe actor favors living-off-the-land binaries such as wmic, netsh, and PowerShell to avoid dropping detectable malware, blending in with normal administrative activity.\n\nPersistence is achieved through compromised edge devices and valid accounts, making detection dependent on behavioral analytics rather than signatures.\n\nDefenders should baseline normal admin tooling, enable command-line and PowerShell script-block logging, and alert on unusual parent-child process chains.',
    tags: ['apt', 'critical-infrastructure', 'lolbins'],
  },
  {
    title: 'Large-Scale Phishing Kit Bypasses MFA Using Real-Time Proxy',
    category: 'Phishing', severity: 'high', source: 'CyberWatch',
    tldr: 'An adversary-in-the-middle phishing kit is stealing live session tokens to defeat MFA — move to phishing-resistant authentication.',
    summary: 'A phishing-as-a-service kit is using adversary-in-the-middle proxies to capture live session tokens, defeating one-time-code MFA across major SaaS platforms.',
    content: 'A widely distributed phishing kit is enabling low-skill actors to bypass multi-factor authentication at scale.\n\nBy proxying victims through a real-time reverse proxy, the kit relays credentials and captures the resulting session cookie, sidestepping SMS and app-based one-time codes.\n\nStolen sessions are replayed against corporate email and SSO portals within minutes.\n\nOrganizations should adopt phishing-resistant authentication (FIDO2/passkeys), enforce conditional access, and shorten session lifetimes for sensitive applications.',
    tags: ['phishing', 'aitm', 'session-hijacking'],
  },
  {
    title: 'Misconfigured Cloud Storage Exposes Millions of Customer Records',
    category: 'Data Breach', severity: 'high', source: 'SecOps Weekly',
    tldr: 'A public cloud bucket leaked millions of records — enforce least-privilege and enable storage-level access logging.',
    summary: 'A publicly accessible cloud storage bucket exposed millions of customer records for weeks before discovery, underscoring persistent misconfiguration risk.',
    content: 'Researchers discovered an unsecured cloud storage bucket containing millions of customer records, including names, contact details, and partial payment data.\n\nThe bucket had been left publicly readable during a migration and remained exposed for several weeks.\n\nAccess logs indicate at least one external download of the full dataset, potentially triggering breach-notification obligations.\n\nOrganizations should enforce least-privilege IAM, enable bucket-level access logging and public-access blocks, and continuously scan cloud estates for misconfigurations.',
    tags: ['data-breach', 'cloud', 'misconfiguration'],
  },
  {
    title: 'High-Severity Vulnerability in Popular Web Framework Enables SSRF',
    category: 'Vulnerability', severity: 'medium', source: 'ThreatPost Daily',
    tldr: 'A server-side request forgery flaw in a common web framework can reach internal metadata endpoints — patch and add egress controls.',
    summary: 'A newly patched flaw in a widely used web framework allows server-side request forgery, potentially exposing internal cloud metadata endpoints.',
    content: 'Maintainers of a popular web framework released a fix for a server-side request forgery vulnerability affecting several recent versions.\n\nExploitation could let an attacker coerce the server into requesting internal resources, including cloud instance metadata services that issue temporary credentials.\n\nWhile no widespread exploitation has been confirmed, proof-of-concept code is public.\n\nTeams should upgrade to the patched release, restrict outbound requests from application servers, and require IMDSv2-style protections on cloud metadata endpoints.',
    tags: ['vulnerability', 'ssrf', 'web'],
  },
  {
    title: 'Infostealer Malware Surges Through Cracked Software and Fake Updates',
    category: 'Malware', severity: 'medium', source: 'CyberWatch',
    tldr: 'Infostealers spread via pirated software and fake browser updates are fueling account takeovers — block known loaders and rotate saved credentials.',
    summary: 'Infostealer malware distributed via cracked software and fake browser updates is harvesting saved passwords and session tokens, feeding a growing credential-resale market.',
    content: 'Infostealer families continue to spread through pirated applications, malicious ads, and fake browser-update prompts.\n\nOnce executed, the malware exfiltrates saved browser passwords, cookies, and cryptocurrency wallet data, which is then sold on criminal marketplaces.\n\nStolen session cookies are increasingly used to bypass MFA on corporate accounts.\n\nDefenders should block known loader domains, restrict software installation, deploy EDR with credential-theft detection, and force credential and session resets for affected users.',
    tags: ['malware', 'infostealer', 'credential-theft'],
  },
  {
    title: 'Software Supply-Chain Attack Targets Popular Open-Source Package',
    category: 'Supply Chain', severity: 'high', source: 'SecOps Weekly',
    tldr: 'A trojanized update to a widely used open-source package briefly shipped a backdoor — audit dependencies and pin versions.',
    summary: 'Attackers compromised the publishing pipeline of a widely used open-source package and briefly shipped a backdoored version to downstream projects.',
    content: 'A popular open-source package was briefly compromised after attackers gained access to a maintainer publishing account.\n\nThe malicious release attempted to exfiltrate environment variables and CI secrets during installation before it was pulled.\n\nDownstream projects that auto-updated within the exposure window may have leaked build credentials.\n\nTeams should pin dependency versions, verify package integrity with lockfiles and signatures, rotate any exposed CI secrets, and monitor for anomalous outbound traffic during builds.',
    tags: ['supply-chain', 'open-source', 'ci-cd'],
  },
  {
    title: 'AI Coding Assistants Found Leaking Secrets Through Prompt Injection',
    category: 'AI Security', severity: 'low', source: 'ThreatPost Daily',
    tldr: 'Indirect prompt injection can trick AI dev assistants into exposing repository secrets — sanitize untrusted context and scope tokens.',
    summary: 'Researchers demonstrated indirect prompt-injection attacks that coax AI coding assistants into revealing repository secrets embedded in their context.',
    content: 'Security researchers demonstrated that AI coding assistants can be manipulated through indirect prompt injection hidden in source files or issue text.\n\nWhen the assistant ingests attacker-controlled content, crafted instructions can cause it to disclose secrets present in its context or suggest insecure code.\n\nWhile impact depends on integration design, the findings highlight the risk of feeding untrusted data to LLM tools.\n\nMitigations include sanitizing untrusted inputs, scoping tokens narrowly, keeping secrets out of prompts, and reviewing AI-suggested changes before merging.',
    tags: ['ai-security', 'prompt-injection', 'llm'],
  },
];

function fallbackNews(cats: string[], count: number): NewsItem[] {
  const now = Date.now();
  const pool = FALLBACK_SEEDS.filter((s) => cats.includes(s.category));
  const chosen = (pool.length ? pool : FALLBACK_SEEDS)
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
  return chosen.map((s, i) => ({
    ...s,
    id: `news-fallback-${i + 1}`,
    date: new Date(now - (i + 1) * 18 * 3600 * 1000).toISOString(),
  }));
}

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

    const parsed = parseAIJson<unknown>(result.content);
    // Accept either a bare array or an object wrapping the array.
    const news = Array.isArray(parsed)
      ? parsed
      : ((parsed as { news?: unknown[]; articles?: unknown[] })?.news
        ?? (parsed as { articles?: unknown[] })?.articles
        ?? []);
    if (!Array.isArray(news) || news.length === 0) {
      throw new Error('AI returned no articles');
    }
    return NextResponse.json({ news, model: result.model, generatedAt: new Date().toISOString() });
  } catch {
    // Never leave the feed empty — serve the curated fallback so the tab always works.
    const news = fallbackNews(cats, count);
    return NextResponse.json({ news, model: 'curated-fallback', generatedAt: new Date().toISOString(), fallback: true });
  }
}
