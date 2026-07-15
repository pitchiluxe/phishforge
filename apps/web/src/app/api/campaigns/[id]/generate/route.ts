import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { callAI, stripThinkTags } from '@/lib/ai/openrouter';
import { parseAIJson } from '@/lib/ai/json';

// Last-resort recovery when the model produced JSON we still can't parse (usually
// unescaped quotes inside body_html): pull the fields out with tolerant regexes.
function extractFields(raw: string): Record<string, string> | null {
  const grab = (key: string) => {
    const m = raw.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's'));
    return m ? m[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\') : undefined;
  };
  const subject = grab('subject');
  const body_html = grab('body_html');
  const body_text = grab('body_text');
  if (!subject && !body_html && !body_text) return null;
  return {
    subject: subject ?? 'Security Notice',
    sender_name: grab('sender_name') ?? 'IT Support',
    sender_email: grab('sender_email') ?? 'no-reply@company.com',
    body_html: body_html ?? body_text ?? '',
    body_text: body_text ?? (body_html ?? '').replace(/<[^>]+>/g, ''),
  };
}

// Curated simulation templates used when the AI provider is unavailable/rate-limited,
// so the campaign tab always produces usable, on-brand training content. Placeholders
// ({{employee_name}}, {{company_name}}, {{tracking_url}}) are filled at send time.
interface FallbackTemplate { subject: string; sender_name: string; sender_email: string; body_html: string; body_text: string }

const FALLBACK_TEMPLATES: { match: RegExp; t: FallbackTemplate }[] = [
  {
    match: /cred|password|login|account|mfa|verify|phish/i,
    t: {
      subject: '[Action Required] Your {{company_name}} password expires today',
      sender_name: '{{company_name}} IT Service Desk',
      sender_email: 'no-reply@it-servicedesk-alerts.com',
      body_html: "<div style='font-family:Segoe UI,Arial,sans-serif;color:#201f1e;font-size:14px'><p>Hi {{employee_name}},</p><p>Our records show the password for your <strong>{{company_name}}</strong> account will expire <strong>today</strong>. To keep access to your email and shared files, please confirm your password through the secure portal below.</p><p><a href='{{tracking_url}}' style='background:#0078d4;color:#ffffff;padding:10px 18px;border-radius:4px;text-decoration:none;display:inline-block'>Keep My Password</a></p><p style='color:#605e5c'>If this is not completed within 24 hours, your account may be temporarily suspended for security reasons.</p><p>Thank you,<br>{{company_name}} IT Service Desk</p></div>",
      body_text: 'Hi {{employee_name}},\n\nThe password for your {{company_name}} account will expire today. To keep access to your email and shared files, confirm your password via the secure portal: {{tracking_url}}\n\nIf this is not completed within 24 hours, your account may be temporarily suspended.\n\nThank you,\n{{company_name}} IT Service Desk',
    },
  },
  {
    match: /attach|invoice|payment|document|file|billing/i,
    t: {
      subject: 'Overdue invoice for {{company_name}} — 2nd notice',
      sender_name: 'Accounts Receivable',
      sender_email: 'billing@vendor-invoices-portal.com',
      body_html: "<div style='font-family:Arial,sans-serif;color:#222;font-size:14px'><p>Dear {{employee_name}},</p><p>Our records indicate an outstanding balance on the account for <strong>{{company_name}}</strong>. This is our second notice. Please review the attached statement and remit payment to avoid a service interruption.</p><p><a href='{{tracking_url}}' style='background:#b91c1c;color:#ffffff;padding:10px 18px;border-radius:4px;text-decoration:none;display:inline-block'>View Invoice</a></p><p style='color:#666'>If you believe this notice is in error, please contact our billing department.</p><p>Regards,<br>Accounts Receivable</p></div>",
      body_text: 'Dear {{employee_name}},\n\nThere is an outstanding balance on the account for {{company_name}}. This is our second notice. Please review the statement and remit payment to avoid a service interruption: {{tracking_url}}\n\nRegards,\nAccounts Receivable',
    },
  },
  {
    match: /hr|benefit|payroll|policy|survey|onboard/i,
    t: {
      subject: '{{company_name}} HR: Benefits enrollment closes Friday',
      sender_name: '{{company_name}} HR Team',
      sender_email: 'hr-notifications@company-benefits.com',
      body_html: "<div style='font-family:Arial,sans-serif;color:#222;font-size:14px'><p>Hi {{employee_name}},</p><p>Open enrollment for your {{company_name}} benefits closes this <strong>Friday</strong>. Employees who do not confirm their selections will keep last year's plan by default.</p><p><a href='{{tracking_url}}' style='background:#047857;color:#ffffff;padding:10px 18px;border-radius:4px;text-decoration:none;display:inline-block'>Review My Benefits</a></p><p style='color:#666'>This takes about two minutes to complete.</p><p>Thanks,<br>{{company_name}} HR Team</p></div>",
      body_text: "Hi {{employee_name}},\n\nOpen enrollment for your {{company_name}} benefits closes this Friday. Confirm your selections here: {{tracking_url}}\n\nThanks,\n{{company_name}} HR Team",
    },
  },
];

const GENERIC_FALLBACK: FallbackTemplate = {
  subject: 'Unusual sign-in to your {{company_name}} account',
  sender_name: 'Account Protection',
  sender_email: 'security-alert@account-protection.com',
  body_html: "<div style='font-family:Segoe UI,Arial,sans-serif;color:#201f1e;font-size:14px'><p>Hi {{employee_name}},</p><p>We detected a sign-in to your <strong>{{company_name}}</strong> account from a new device. If this was you, no action is needed. If you do not recognize this activity, please review your recent sessions now.</p><p><a href='{{tracking_url}}' style='background:#0078d4;color:#ffffff;padding:10px 18px;border-radius:4px;text-decoration:none;display:inline-block'>Review Activity</a></p><p style='color:#605e5c'>Protecting your account is important to us.</p><p>{{company_name}} Account Protection</p></div>",
  body_text: 'Hi {{employee_name}},\n\nWe detected a sign-in to your {{company_name}} account from a new device. If you do not recognize this activity, review your recent sessions: {{tracking_url}}\n\n{{company_name}} Account Protection',
};

function fallbackTemplate(simulationType?: string): FallbackTemplate {
  const key = simulationType ?? '';
  return FALLBACK_TEMPLATES.find(({ match }) => match.test(key))?.t ?? GENERIC_FALLBACK;
}

function isDemoOrPlaceholder() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return !url || url.includes('placeholder');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = await params;
  const body = await req.json();
  const isDemo = isDemoOrPlaceholder() || (await cookies()).get('pf_demo')?.value === '1';

  let orgId: string | undefined;
  let supabase: Awaited<ReturnType<typeof createServerClient>> | null = null;
  let sessionUserId: string | undefined;

  if (!isDemo) {
    supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    sessionUserId = session.user.id;

    const { data: user } = await supabase.from('users').select('organization_id, role').eq('id', session.user.id).single();
    orgId = user?.organization_id;

    if (!campaignId.startsWith('demo-')) {
      const { data: campaign } = await supabase.from('campaigns').select('id').eq('id', campaignId).eq('organization_id', orgId).single();
      if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
  }

  const provider = body.ai_provider ?? process.env.DEFAULT_AI_PROVIDER ?? 'openrouter';
  const primaryModel = body.ai_model ?? (
    provider === 'ollama'
      ? (process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2')
      : (process.env.OPENROUTER_DEFAULT_MODEL ?? undefined)
  );

  const systemPrompt = `You are PhishForge-AI. Generate realistic phishing simulation content for authorized security awareness training ONLY.

RULES:
- Use {{tracking_url}} for the clickable link
- Use {{employee_name}} for target name
- Use {{company_name}} for organization name
- Return ONLY valid JSON (no markdown fences, no extra text)
- In body_html, use SINGLE quotes for every HTML attribute (e.g. <a href='{{tracking_url}}'>) so the JSON stays valid
- Escape any double quotes inside string values as \\" and write newlines as \\n (never a raw line break)

OUTPUT FORMAT (exactly):
{"subject":"...","sender_name":"...","sender_email":"...","body_html":"...","body_text":"..."}`;

  const userPrompt = `Generate a phishing simulation:
Industry: ${body.industry}
Target role: ${body.target_role}
Simulation type: ${body.simulation_type}
Difficulty: ${body.difficulty}/5 (5 = most sophisticated)
${body.context ? `Context: ${body.context}` : ''}`;

  const startTime = Date.now();

  // Try AI first; on any failure (rate limit, no credits, refusal, bad JSON) fall
  // back to a curated template so the campaign tab always yields usable content.
  let content = '';
  let aiError: string | null = null;
  try {
    const result = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        maxTokens: 2500,
        temperature: 0.7,
        primaryModel,
        preferProvider: (provider as 'ollama' | 'openrouter' | 'auto') ?? 'auto',
      },
    );
    content = stripThinkTags(result.content);
  } catch (e: any) {
    aiError = e?.message ?? 'AI provider unavailable';
  }

  const latency_ms = Date.now() - startTime;

  // Parse the AI output when we have one.
  let parsed: any = null;
  if (!aiError) {
    try { parsed = parseAIJson<any>(content); } catch { parsed = extractFields(content); }
  }
  const usable = parsed && (parsed.subject || parsed.body_html || parsed.body_text);
  const usedFallback = !usable;
  if (usedFallback) parsed = fallbackTemplate(body.simulation_type);

  // Normalise so every field is present regardless of source.
  const fields = {
    subject: parsed.subject ?? 'Security Notice',
    sender_name: parsed.sender_name ?? 'IT Support',
    sender_email: parsed.sender_email ?? 'no-reply@company-alerts.com',
    body_html: parsed.body_html ?? parsed.body_text ?? '',
    body_text: parsed.body_text ?? String(parsed.body_html ?? '').replace(/<[^>]+>/g, ''),
  };

  const text = `${fields.subject} ${fields.body_text}`.toLowerCase();
  const keywords = ['password', 'login', 'credential', 'verify', 'urgent', 'suspended'];
  const safety_score = Math.max(40, 100 - keywords.filter(k => text.includes(k)).length * 5);

  const template = {
    id: `tpl-${Date.now()}`,
    name: `${usedFallback ? 'Curated' : 'AI Generated'} — ${body.industry}/${body.target_role}`,
    ...fields,
    safety_score,
    ai_generated: !usedFallback,
    fallback: usedFallback,
  };

  try {
    if (!isDemo && supabase) {
      const { data: saved } = await supabase.from('templates').insert({
        organization_id: orgId,
        campaign_id: campaignId,
        name: template.name,
        simulation_type: body.simulation_type,
        industry: body.industry,
        target_role: body.target_role,
        difficulty: body.difficulty,
        subject: fields.subject,
        body_html: fields.body_html,
        body_text: fields.body_text,
        sender_name: fields.sender_name,
        sender_email: fields.sender_email,
        ai_generated: !usedFallback,
        safety_score,
        generation_meta: { model: usedFallback ? 'curated-fallback' : primaryModel, provider, latency_ms, fallback: usedFallback },
      }).select().single();

      void supabase.from('ai_generation_logs').insert({
        organization_id: orgId,
        user_id: sessionUserId,
        campaign_id: campaignId,
        provider,
        model: usedFallback ? 'curated-fallback' : primaryModel,
        latency_ms,
        success: !usedFallback,
        error_message: aiError ?? undefined,
        safety_score,
      });

      return NextResponse.json({ template: saved ?? template, safety_score, fallback: usedFallback });
    }
  } catch {
    // Persisting failed — still return the generated template below.
  }

  return NextResponse.json({ template, safety_score, fallback: usedFallback });
}
