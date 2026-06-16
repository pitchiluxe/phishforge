import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractFinalAnswer } from '@/lib/ai/openrouter';

const RECENT_TOPICS = [
  'AI-powered social engineering and deepfake attacks in 2025',
  'Post-quantum cryptography migration strategies',
  'GenAI data leakage risks in enterprise copilots',
  'Browser-in-the-Browser (BitB) phishing technique',
  'GitHub Actions supply chain security',
  'Cloud CNAPP and CIEM security in multi-cloud environments',
  'Passkeys and FIDO2 enterprise deployment guide',
  'LLM jailbreaking and prompt injection in enterprise AI',
  'Cybersecurity mesh architecture (CSMA) implementation',
  'Operational Technology (OT/ICS) cyber threats 2025',
  'API security in microservices: gRPC and GraphQL risks',
  'Insider threat detection with UEBA and behavioral analytics',
  'Ransomware negotiation and incident response playbook',
  'Mobile device attack surface — iOS and Android 2025 threats',
  'Extended Detection and Response (XDR) vs SIEM vs SOAR',
  'DNS security: DoH, DoT, and DNS-over-HTTPS hijacking',
  'Social media reconnaissance and OSINT attack techniques',
  'Secure coding in AI-generated code — GitHub Copilot risks',
  'Cloud storage misconfigurations: S3, Azure Blob, GCS data exposure',
  'Adversarial AI — evading ML-based security controls',
  // CrowdStrike / EDR topics
  'CrowdStrike Falcon Sensor architecture and tamper protection',
  'BYOVD attacks bypassing EDR kernel defenses in 2025',
  'CrowdStrike Falcon Identity Threat Protection and Kerberoasting detection',
  'EDR telemetry evasion: process hollowing and direct syscall techniques',
  'CrowdStrike RTR (Real Time Response) for live endpoint forensics',
];

const SYSTEM_PROMPT = `You are a senior cybersecurity writer creating articles for PhishForge's knowledge base — a professional security awareness training platform used by enterprise security teams.

Write a comprehensive, authoritative cybersecurity article in Markdown. Follow this EXACT structure:

## [Article Title]

[2-3 sentence lead paragraph explaining the topic's importance]

---

### [Section 1 — Context/Background]

[Content with specific statistics, real incidents, or technical details]

---

### [Section 2 — Technical Details / Attack Techniques]

[Include code examples, commands, or attack flows using \`\`\`code blocks\`\`\` where appropriate]
[Use tables where comparing multiple items]

---

### [Section 3 — Detection]

[Specific detection signals, log queries, or monitoring approaches]

---

### [Section 4 — Defensive Controls]

[Actionable, specific defenses — not generic advice]

---

### [Section 5 — Key Takeaways]

[3-5 bullet points]

REQUIREMENTS:
- Write for security professionals (SOC analysts, pentesters, security engineers)
- Include specific tools, frameworks, CVEs, or vendor names where relevant
- Use realistic examples — real threat groups, real incidents (post-2023)
- Markdown formatting: ## for h2, ### for h3, #### for h4
- Tables for comparisons, code blocks for commands/queries
- Minimum 800 words
- Focus on 2024–2025 relevance — NOT outdated content`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const topic: string = body.topic || RECENT_TOPICS[Math.floor(Math.random() * RECENT_TOPICS.length)];
    const category: string = body.category || 'Threat Intelligence';

    const provider = process.env.DEFAULT_AI_PROVIDER ?? 'openrouter';

    const userPrompt = `Write a comprehensive cybersecurity knowledge base article about: **${topic}**

Category: ${category}
Date context: June 2025 — focus on current threats, recent incidents, and 2025-relevant guidance.

Return ONLY the Markdown article content. Do not add any preamble or explanation outside the article itself.`;

    let content = '';
    let modelUsed = '';

    if (provider === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
      const ollamaModel = process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2';
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
          options: { temperature: 0.7, num_predict: 2000 },
        }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) throw new Error(`Ollama error ${res.status}`);
      const data = await res.json();
      content = data.message?.content ?? '';
      modelUsed = ollamaModel;
    } else {
      const result = await callOpenRouter(
        [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        { maxTokens: 2000, temperature: 0.7 },
      );
      content = result.content;
      modelUsed = result.model;
    }

    content = extractFinalAnswer(content);

    const titleMatch = content.match(/^##\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : topic;

    const bodyAfterTitle = content.replace(/^##\s+.+\n+/, '').replace(/---\n/g, '').trim();
    const firstPara = bodyAfterTitle.split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('-'));
    const summary = firstPara ? firstPara.slice(0, 200) : `AI-generated article about ${topic}`;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const wordCount = content.split(/\s+/).length;
    const readingMinutes = Math.max(5, Math.round(wordCount / 200));

    const article = {
      id: `kb-ai-gen-${Date.now()}`,
      slug,
      title,
      summary,
      content,
      category,
      tags: [topic.split(' ').slice(0, 3).join(' '), '2025', 'AI-generated'],
      difficulty: 'INTERMEDIATE' as const,
      readingMinutes,
      source: `AI-Generated — ${modelUsed} — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    };

    return NextResponse.json({ article, model: modelUsed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
