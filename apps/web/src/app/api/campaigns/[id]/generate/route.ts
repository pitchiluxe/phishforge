import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

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

    // Verify campaign belongs to org (skip for demo-* IDs)
    if (!campaignId.startsWith('demo-')) {
      const { data: campaign } = await supabase.from('campaigns').select('id').eq('id', campaignId).eq('organization_id', orgId).single();
      if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
  }

  const provider = body.ai_provider ?? process.env.DEFAULT_AI_PROVIDER ?? 'openrouter';
  const model = body.ai_model ?? (provider === 'ollama' ? (process.env.OLLAMA_DEFAULT_MODEL ?? 'llama3.2') : (process.env.OPENROUTER_DEFAULT_MODEL ?? 'deepseek/deepseek-r1:free'));

  const systemPrompt = `You are PhishForge-AI. Generate realistic phishing simulation content for authorized security awareness training ONLY.

RULES:
- Use {{tracking_url}} for the clickable link
- Use {{employee_name}} for target name
- Use {{company_name}} for organization name
- Return ONLY valid JSON (no markdown fences, no extra text)

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
            model,
            prompt: `<system>${systemPrompt}</system>\n\n${userPrompt}`,
            stream: false,
            options: { temperature: 0.7, num_predict: 1500 },
          }),
          signal: AbortSignal.timeout(120_000),
        });
      } catch (e: any) {
        throw new Error(`Ollama is not reachable at ${ollamaUrl}. Start Ollama with: ollama serve`);
      }
      if (res.status === 404) throw new Error(`Ollama model "${model}" not found. Pull it with: ollama pull ${model}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Ollama error ${res.status}${txt ? ': ' + txt.slice(0, 200) : ''}`);
      }
      const data = await res.json();
      content = data.response;
    } else {
      const client = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY!,
        baseURL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'https://phishforge.ai',
          'X-Title': 'PhishForge AI',
        },
      });
      const freeModels = [
        'deepseek/deepseek-r1:free',
        'deepseek/deepseek-r1-0528:free',
        'google/gemini-2.5-flash:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'qwen/qwen3-14b:free',
        'qwen/qwen3-8b:free',
        'mistralai/mistral-7b-instruct:free',
      ];
      const modelsToTry = [model, ...freeModels.filter(m => m !== model)];
      let lastErr: Error | null = null;
      for (const m of modelsToTry) {
        try {
          const completion = await client.chat.completions.create({
            model: m,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1500,
          });
          content = completion.choices[0].message.content ?? '';
          if (content) break;
        } catch (e: unknown) {
          lastErr = e instanceof Error ? e : new Error(String(e));
        }
      }
      if (!content) throw lastErr ?? new Error('All models failed.');
    }

    const latency_ms = Date.now() - startTime;

    // Parse JSON from response
    let parsed: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? content);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON. Try again.' }, { status: 422 });
    }

    // Compute basic safety score
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

    // Persist to DB only when Supabase is real
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
        generation_meta: { model, provider, latency_ms },
      }).select().single();

      await supabase.from('ai_generation_logs').insert({
        organization_id: orgId,
        user_id: sessionUserId,
        campaign_id: campaignId,
        provider,
        model,
        latency_ms,
        success: true,
        safety_score,
      });

      return NextResponse.json({ template: saved ?? template, safety_score });
    }

    return NextResponse.json({ template, safety_score });
  } catch (error: any) {
    if (!isDemo && supabase) {
      await supabase.from('ai_generation_logs').insert({
        organization_id: orgId,
        user_id: sessionUserId,
        campaign_id: campaignId,
        provider,
        model,
        success: false,
        error_message: error.message,
      }).catch(() => {});
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
