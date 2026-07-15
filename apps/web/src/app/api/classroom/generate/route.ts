import { NextRequest, NextResponse } from 'next/server';
import { callAI, callOpenRouter, extractFinalAnswer } from '@/lib/ai/openrouter';

async function getAvailableModels(): Promise<string[]> {
  try {
    // Try to fetch from API (cached list of free models)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/ai/models/openrouter/free/best`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN || ''}`,
        },
      }
    ).catch(() => null);

    if (res?.ok) {
      const data = await res.json();
      return (data.models || []).map((m: any) => m.id);
    }
  } catch (err) {
    console.warn('Failed to fetch dynamic model list:', err);
  }

  // Fallback to the reliable free Llama 3.1 8B model
  return [
    'meta-llama/llama-3.1-8b-instruct:free',
  ];
}

const COURSE_TOPICS = [
  'Advanced Phishing Attack Techniques 2025',
  'Zero Trust Architecture Implementation',
  'Cloud Security & CNAPP Fundamentals',
  'Ransomware Defense & Incident Response',
  'Identity & Access Management Hardening',
  'Supply Chain Attack Detection',
  'AI-Powered Social Engineering Defenses',
  'Kubernetes & Container Security',
  'SOC Operations & Threat Hunting',
  'OWASP Top 10 Web Application Security',
  'Network Forensics & Packet Analysis',
  'Insider Threat Detection & UEBA',
  'Red Team Tactics & MITRE ATT&CK',
  'Secure DevOps & CI/CD Security',
  'Mobile Security & MDM Policies',
  'OT/ICS Cybersecurity Fundamentals',
  'Post-Quantum Cryptography Migration',
  'API Security & OAuth 2.0 Hardening',
  'Dark Web Intelligence & OSINT',
  'Email Security & Anti-Spoofing (DKIM/SPF/DMARC)',
  // CrowdStrike / Falcon / EDR
  'CrowdStrike Falcon Sensor Deployment & Hardening',
  'EDR Evasion Techniques & Falcon Counter-Measures',
  'CrowdStrike Falcon Identity Threat Protection',
  'CrowdStrike RTR (Real Time Response) for Incident Responders',
  'BYOVD Attacks & CrowdStrike Kernel Defense',
  'CrowdStrike Falcon for Cloud & Container Security',
  'EDR Telemetry Analysis with CrowdStrike Insight',
  'Detecting EDR Tampering with CrowdStrike OverWatch',
];

const LAB_TOPICS = [
  'Phishing Email Header Analysis',
  'Malware Sandbox Analysis with Any.run',
  'Active Directory Enumeration Defense',
  'SIEM Log Correlation with Splunk',
  'Docker Container Escape Prevention',
  'Burp Suite Web Application Testing',
  'Wireshark Traffic Analysis',
  'AWS IAM Privilege Escalation Defense',
  'Linux Privilege Escalation Hardening',
  'Windows Registry Forensics',
  'Python-based Threat Intelligence Automation',
  'Velociraptor Digital Forensics',
  'PowerShell Security & Script Block Logging',
  'Zero-Day Vulnerability Triage',
  'Honeypot Deployment & Monitoring',
  // CrowdStrike / Falcon / EDR labs
  'CrowdStrike Falcon Sensor Tamper Detection Lab',
  'BYOVD Attack Simulation & Falcon Defense Lab',
  'Falcon RTR Forensic Investigation Lab',
  'EDR Process Hollowing Detection with Falcon',
  'CrowdStrike Falcon for Cloud Container Escape Lab',
  'Kerberoasting Detection using Falcon Identity Protection',
  'CrowdStrike OverWatch Alert Triage Lab',
];

function extractJSON(text: string): any {
  let cleaned = extractFinalAnswer(text);
  
  // Strip backticks (Ollama wraps responses in markdown: ```json ... ```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`/g, '');
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');
  
  let jsonStr = jsonMatch[0];
  
  // Fix unescaped newlines/tabs in JSON strings (common issue from LLM outputs)
  // This handles cases like: "description": "Line 1\nLine 2" (unescaped newline)
  // by escaping them: "description": "Line 1\\nLine 2"
  jsonStr = jsonStr.replace(/("[^"\\]*(?:\\.[^"\\]*)*")/g, (match) => {
    // Inside quoted strings, escape unescaped control characters
    return match
      .replace(/\n/g, '\\n')     // Actual newline → \n
      .replace(/\r/g, '\\r')     // Actual carriage return → \r
      .replace(/\t/g, '\\t')     // Actual tab → \t
      .replace(/\f/g, '\\f')     // Actual form feed → \f
      .replace(/\b/g, '\\b');    // Actual backspace → \b
  });
  
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    // Provide better error context for JSON parsing failures
    const preview = jsonStr.slice(0, 250).replace(/\n/g, '\\n');
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`JSON parse failed: ${msg}. Preview: ${preview}...`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const type: 'course' | 'lab' = body.type ?? 'course';
    const providedTopic: string | undefined = body.topic;

    // Fetch dynamic model list from backend (falls back to defaults)
    const modelList = await getAvailableModels();

    if (type === 'lab') {
      const topic = providedTopic ?? LAB_TOPICS[Math.floor(Math.random() * LAB_TOPICS.length)];

      const systemPrompt = `You are a senior cybersecurity trainer creating hands-on lab exercises for enterprise security professionals. Generate realistic, technically accurate lab exercises grounded in 2025 threat landscape. Always respond with valid JSON only.`;

      const userPrompt = `Generate a standalone cybersecurity lab exercise about: "${topic}"

Return ONLY valid JSON matching this exact schema:
{
  "id": "ai-lab-<slug>",
  "title": "<lab title>",
  "description": "<2 sentence description>",
  "category": "<one of: Network Security, Endpoint Security, Cloud Security, Malware Analysis, Incident Response, Web Security, Identity Security, Forensics, Threat Hunting, Social Engineering>",
  "difficulty": "<beginner|intermediate|advanced>",
  "estimatedMin": <number 20-60>,
  "xpReward": <number 100-300>,
  "accentColor": "<hex color>",
  "scenario": "<3-4 sentence realistic incident scenario>",
  "tasks": ["<task 1>", "<task 2>", "<task 3>", "<task 4>", "<task 5>"],
  "tools": ["<tool 1>", "<tool 2>", "<tool 3>"],
  "keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "labPrompt": "<detailed lab exercise question, 2-3 paragraphs, asking the trainee to analyze the scenario and provide a comprehensive incident response>",
  "tags": ["<tag 1>", "<tag 2>", "<tag 3>"]
}`;

      const result = await callAI(
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        { maxTokens: 2000, temperature: 0.8, modelList, preferProvider: 'auto' },
      );
      const lab = extractJSON(result.content);
      lab.id = lab.id ?? `ai-lab-${Date.now()}`;
      lab.accentColor = lab.accentColor ?? '#00ff41';

      return NextResponse.json({ lab, model: result.model });
    }

    // type === 'course'
    const topic = providedTopic ?? COURSE_TOPICS[Math.floor(Math.random() * COURSE_TOPICS.length)];
    const difficulty = body.difficulty ?? (['beginner', 'intermediate', 'advanced'] as const)[Math.floor(Math.random() * 3)];

    const systemPrompt = `You are a senior cybersecurity curriculum designer creating enterprise training courses for PhishForge, a security awareness platform. Generate technically accurate, engaging course content grounded in 2025 threat intelligence. Always respond with valid JSON only.`;

    const userPrompt = `Generate a cybersecurity training course about: "${topic}"
Difficulty: ${difficulty}

Return ONLY valid JSON matching this exact schema:
{
  "id": "ai-course-<slug>",
  "title": "<course title>",
  "description": "<2-3 sentence course description>",
  "difficulty": "${difficulty}",
  "accentColor": "<hex color like #00ff41 or #60a5fa or #a78bfa or #f87171 or #facc15>",
  "estimatedHours": <number 1-4>,
  "modules": [
    {
      "id": "mod-1",
      "title": "<module title>",
      "type": "LESSON",
      "durationMin": <15-30>,
      "xpReward": <50-150>,
      "content": "<full lesson text, use markdown: ## headings, - bullet points, > blockquotes, **bold**. Minimum 300 words covering the topic in depth with real examples, techniques, and 2025-specific threat data>"
    },
    {
      "id": "mod-2",
      "title": "<lab title>",
      "type": "LAB",
      "durationMin": <20-35>,
      "xpReward": <100-200>,
      "labPrompt": "<detailed lab scenario and exercise question, 2+ paragraphs>",
      "labKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"]
    },
    {
      "id": "mod-3",
      "title": "<simulation title>",
      "type": "SIMULATION",
      "durationMin": <20-40>,
      "xpReward": <150-250>,
      "scenarioContext": "<2-3 sentence scenario setup for a live AI attack simulation>"
    },
    {
      "id": "mod-4",
      "title": "<second lesson title>",
      "type": "LESSON",
      "durationMin": <15-25>,
      "xpReward": <75-125>,
      "content": "<full lesson text with markdown, minimum 250 words>"
    },
    {
      "id": "mod-5",
      "title": "<final lab title>",
      "type": "LAB",
      "durationMin": <25-40>,
      "xpReward": <150-250>,
      "labPrompt": "<advanced capstone lab prompt, 2+ paragraphs>",
      "labKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>", "<keyword 6>"]
    }
  ]
}`;

    const result = await callAI(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      { maxTokens: 3000, temperature: 0.8, modelList, preferProvider: 'auto' },
    );
    const course = extractJSON(result.content);
    course.id = course.id ?? `ai-course-${Date.now()}`;
    course.accentColor = course.accentColor ?? '#00ff41';

    return NextResponse.json({ course, model: result.model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Generation failed';
    console.error('[classroom/generate]', msg, err);
    return NextResponse.json(
      { 
        error: msg,
        details: err instanceof Error ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}
