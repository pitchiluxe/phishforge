import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { parseAIJson } from '@/lib/ai/json';

const SYSTEM_PROMPT = `You are a senior cybersecurity hiring manager generating realistic interview questions.
Return ONLY a JSON array — no markdown fences, no explanation, no preamble.

Each element must have exactly these fields:
{
  "question": "Full question text",
  "type": "technical" | "behavioral",
  "difficulty": "entry" | "mid" | "senior",
  "category": "Short category label (e.g. Threat Hunting, IAM Design, Incident Response)",
  "tip": "What a strong answer covers: [specific tools, frameworks, approaches]"
}

Rules:
- Questions must reflect real 2024-2025 hiring practices at top security teams (Google, Microsoft, FAANG, Big4, financial institutions)
- Technical questions must be scenario-based and reference actual tools, CVEs, protocols, or frameworks — never generic "explain what X is" questions
- Behavioral questions must surface real competencies under pressure, ethical judgment, or cross-team communication
- Mix difficulty: roughly 30% entry, 40% mid, 30% senior
- Tips must name the specific frameworks, tools, or structured approaches the interviewer expects (not generic advice)
- Every question must be unique — no duplicates or near-duplicates`;

export async function POST(req: NextRequest) {
  try {
    const { role, interviewType, count = 8 } = await req.json();
    if (!role) return NextResponse.json({ error: 'role is required' }, { status: 400 });

    const typeGuide = interviewType === 'technical'
      ? 'All questions must be technical — hands-on, scenario-based, tool-specific.'
      : interviewType === 'behavioral'
      ? 'All questions must be behavioral — STAR-format compatible, revealing soft skills and judgment.'
      : 'Mix roughly 60% technical and 40% behavioral questions.';

    const roleGuides: Record<string, string> = {
      'SOC Analyst': 'SIEM platforms (Splunk/Sentinel), alert triage methodologies, threat hunting, log analysis, MITRE ATT&CK mapping, incident escalation procedures, DLP alerts, EDR tools',
      'Penetration Tester': 'recon and enumeration, web app exploitation (OWASP Top 10), Active Directory attacks (Kerberoasting, Pass-the-Hash), reporting methodology, CVE research, responsible disclosure, red team TTPs',
      'Security Engineer': 'secure SDLC, SAST/DAST tooling (Semgrep, Veracode, Burp), secrets management (HashiCorp Vault), CI/CD security, zero trust architecture, threat modeling (STRIDE), dependency scanning',
      'Cloud Security': 'AWS/Azure/GCP IAM, CSPM tools (Prisma, Wiz, Lacework), K8s RBAC, misconfigurations, CloudTrail analysis, data perimeter controls, container security, service mesh security',
      'Incident Responder': 'NIST IR lifecycle phases, forensic evidence preservation (chain of custody), memory forensics (Volatility), ransomware containment, log analysis under time pressure, crisis communication',
      'GRC / Compliance': 'GDPR Article 32/33/34, SOC2 Trust Service Criteria, ISO 27001 Annex A controls, risk register management, vendor risk assessment, audit evidence collection, control gap analysis',
    };

    const userPrompt = `Generate ${count} interview questions for a ${role} position.
${typeGuide}
Role-specific focus areas: ${roleGuides[role] ?? role}

Return the JSON array directly.`;

    const result = await callOpenRouter(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      { maxTokens: 2500, temperature: 0.75 },
    );

    const parsedQ = parseAIJson<unknown>(result.content);
    const questions: unknown[] = Array.isArray(parsedQ)
      ? parsedQ
      : ((parsedQ as { questions?: unknown[] })?.questions ?? []);

    if (!Array.isArray(questions) || questions.length === 0) throw new Error('Expected array from model');

    return NextResponse.json({ questions, model: result.model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate questions';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
