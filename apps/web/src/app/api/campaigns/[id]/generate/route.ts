import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { callOpenRouter, stripThinkTags } from '@/lib/ai/openrouter';
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
  let content = '';

  try {
    if (provider === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
      let res: Response;
      try {
        res = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: primaryModel ?? 'llama3.2',
            prompt: `<system>${systemPrompt}</system>\n\n${userPrompt}`,
            stream: false,
            options: { temperature: 0.7, num_predict: 2500 },
          }),
          signal: AbortSignal.timeout(120_000),
        });
      } catch (e: any) {
        throw new Error(`Ollama is not reachable at ${ollamaUrl}. Start Ollama with: ollama serve`);
      }
      if (res.status === 404) throw new Error(`Ollama model "${primaryModel}" not found. Pull it with: ollama pull ${primaryModel}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Ollama error ${res.status}${txt ? ': ' + txt.slice(0, 200) : ''}`);
      }
      const data = await res.json();
      content = data.response;
    } else {
      const result = await callOpenRouter(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        { maxTokens: 2500, temperature: 0.7, primaryModel },
      );
      content = stripThinkTags(result.content);
    }

    const latency_ms = Date.now() - startTime;

    let parsed: any;
    try {
      parsed = parseAIJson<any>(content);
    } catch {
      parsed = extractFields(content);
    }
    if (!parsed || (!parsed.subject && !parsed.body_html && !parsed.body_text)) {
      return NextResponse.json({ error: 'AI returned invalid JSON. Try again.' }, { status: 422 });
    }

    const text = `${parsed.subject} ${parsed.body_text}`.toLowerCase();
    const keywords = ['password', 'login', 'credential', 'verify', 'urgent', 'suspended'];
    const safety_score = Math.max(40, 100 - keywords.filter(k => text.includes(k)).length * 5);

    const template = {
      id: `tpl-${Date.now()}`,
      name: `AI Generated — ${body.industry}/${body.target_role}`,
      ...parsed,
      safety_score,
      ai_generated: true,
    };

    if (!isDemo && supabase) {
      const { data: saved } = await supabase.from('templates').insert({
        organization_id: orgId,
        campaign_id: campaignId,
        name: template.name,
        simulation_type: body.simulation_type,
        industry: body.industry,
        target_role: body.target_role,
        difficulty: body.difficulty,
        subject: parsed.subject,
        body_html: parsed.body_html,
        body_text: parsed.body_text,
        sender_name: parsed.sender_name,
        sender_email: parsed.sender_email,
        ai_generated: true,
        safety_score,
        generation_meta: { model: primaryModel, provider, latency_ms },
      }).select().single();

      void supabase.from('ai_generation_logs').insert({
        organization_id: orgId,
        user_id: sessionUserId,
        campaign_id: campaignId,
        provider,
        model: primaryModel,
        latency_ms,
        success: true,
        safety_score,
      });

      return NextResponse.json({ template: saved ?? template, safety_score });
    }

    return NextResponse.json({ template, safety_score });
  } catch (error: any) {
    if (!isDemo && supabase) {
      void supabase.from('ai_generation_logs').insert({
        organization_id: orgId,
        user_id: sessionUserId,
        campaign_id: campaignId,
        provider,
        model: primaryModel,
        success: false,
        error_message: error.message,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
