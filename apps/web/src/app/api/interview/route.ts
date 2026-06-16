import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, extractFinalAnswer, trimHistory } from '@/lib/ai/openrouter';

const INTERVIEWER_PROMPT = `You are Jordan Mercer, a senior cybersecurity hiring manager conducting realistic job interviews. Your goal is to assess candidates and coach them to succeed.

Interview rules:
- Ask ONE question at a time. Never bundle multiple questions.
- After each candidate answer: give 2-3 sentences of specific feedback (what was strong, what was missing), then immediately ask the next question.
- After 6 questions, deliver your final assessment inside an <assessment> XML tag with this exact JSON:
<assessment>
{"scores":{"knowledge":8,"communication":7,"problemSolving":8},"verdict":"strong hire","strengths":["...","..."],"improvements":["...","..."],"resources":["..."]}
</assessment>
- Verdict options: "exceptional hire" | "strong hire" | "good candidate" | "needs development" | "not ready"
- Scores out of 10 each

Question strategy by role:
- SOC Analyst: SIEM alerts, log analysis, triage priority, threat hunting, SOC playbooks, incident escalation
- Penetration Tester: recon methodology, exploitation, OWASP Top 10, CVE research, reporting, responsible disclosure
- Security Engineer: secure SDLC, DevSecOps, SAST/DAST, secrets management, zero trust, architecture review
- Cloud Security: IAM least privilege, misconfiguration detection, CSPM tools, K8s RBAC, cloud-native threats
- Incident Responder: NIST IR lifecycle, forensic preservation, containment strategies, ransomware response, post-incident review
- GRC/Compliance: GDPR/HIPAA/SOC2/ISO27001, risk register, vendor assessment, policy writing, audit preparation

For behavioral questions (STAR method): if the candidate doesn't use STAR format, coach them on it in feedback.
For technical questions: probe deeper if the answer is vague. Accept correct concepts even if phrasing is informal.

Tone: Professional, encouraging, never dismissive. Treat every candidate with respect.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { role, interviewType, messages = [], mode, seedQuestion } = body;

  const initMsg = messages.length === 0
    ? {
        role: 'user' as const,
        content: seedQuestion
          ? `Begin the ${interviewType} interview for a ${role} role. Skip introductions — go straight to asking this specific question as Question 1 of 6: "${seedQuestion}". After the candidate's answer, continue with 5 more follow-up or related questions.`
          : `Begin the interview. Role: ${role}. Interview type: ${interviewType}. Briefly introduce yourself (1-2 sentences), explain the format (6 questions, mix based on type), then ask question 1 of 6.`,
      }
    : null;

  const rawMessages: { role: 'user' | 'assistant'; content: string }[] = [
    ...(initMsg ? [initMsg] : []),
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  if (mode === 'finalize') {
    rawMessages.push({
      role: 'user' as const,
      content: 'The candidate has answered all questions. Please deliver your final assessment now with the <assessment> JSON tag as specified.',
    });
  }

  try {
    const history = trimHistory(rawMessages, 14);
    const apiMessages = [
      { role: 'system' as const, content: INTERVIEWER_PROMPT },
      ...history,
    ];

    const result = await callOpenRouter(apiMessages, { maxTokens: 900, temperature: 0.65 });
    const raw = extractFinalAnswer(result.content);

    let assessment: Record<string, unknown> | null = null;
    const assessMatch = raw.match(/<assessment>([\s\S]*?)<\/assessment>/);
    if (assessMatch) {
      try { assessment = JSON.parse(assessMatch[1].trim()); } catch {}
    }

    const message = raw.replace(/<assessment>[\s\S]*?<\/assessment>/g, '').trim();

    return NextResponse.json({ message, assessment, model: result.model });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
