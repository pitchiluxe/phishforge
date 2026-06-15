import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { OpenRouterService } from './openrouter.service';
import { OllamaService } from './ollama.service';
import type {
  AIGenerateRequest,
  AIGenerateResponse,
  AIProvider,
  GenerateCampaignDto,
  GeneratedContent,
} from '@phishforge/shared';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
    private readonly openRouter: OpenRouterService,
    private readonly ollama: OllamaService,
  ) {}

  async generate(
    request: AIGenerateRequest,
    organizationId: string,
    userId?: string,
    campaignId?: string,
    ollamaBaseUrl?: string,
  ): Promise<AIGenerateResponse> {
    const startTime = Date.now();
    let result: AIGenerateResponse;
    let success = true;
    let errorMessage: string | undefined;

    try {
      if (request.provider === 'ollama') {
        result = await this.ollama.generate(request, ollamaBaseUrl);
      } else {
        result = await this.openRouter.generate(request);
      }
    } catch (error: any) {
      success = false;
      errorMessage = error.message;
      throw error;
    } finally {
      const latency = Date.now() - startTime;
      await this.supabase.db.from('ai_generation_logs').insert({
        organization_id: organizationId,
        user_id: userId,
        campaign_id: campaignId,
        provider: request.provider,
        model: request.model,
        prompt_tokens: result?.usage?.prompt_tokens,
        completion_tokens: result?.usage?.completion_tokens,
        total_tokens: result?.usage?.total_tokens,
        latency_ms: latency,
        success,
        error_message: errorMessage,
      });
    }

    return result!;
  }

  async generatePhishingContent(
    dto: GenerateCampaignDto,
    organizationId: string,
    userId: string,
    knowledgeContext?: string,
  ): Promise<GeneratedContent> {
    const { data: org } = await this.supabase.db
      .from('organizations')
      .select('ai_provider, ai_model, ollama_base_url, openrouter_model')
      .eq('id', organizationId)
      .single();

    const provider: AIProvider = dto.ai_provider ?? org?.ai_provider ?? 'openrouter';
    const model =
      dto.ai_model ??
      (provider === 'ollama'
        ? org?.ai_model ?? this.config.get('OLLAMA_DEFAULT_MODEL', 'llama3.2')
        : org?.openrouter_model ?? this.config.get('OPENROUTER_DEFAULT_MODEL', 'deepseek/deepseek-chat-v3-0324'));

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(dto, knowledgeContext);

    const startTime = Date.now();
    const response = await this.generate(
      { provider, model, system_prompt: systemPrompt, user_prompt: userPrompt, temperature: 0.7, max_tokens: 2048 },
      organizationId,
      userId,
      undefined,
      org?.ollama_base_url,
    );

    let parsed: any;
    try {
      const jsonMatch = response.content.match(/```json\n?([\s\S]*?)\n?```/) ?? [null, response.content];
      parsed = JSON.parse(jsonMatch[1] ?? response.content);
    } catch {
      throw new BadRequestException('AI returned invalid JSON. Try again.');
    }

    const safetyScore = this.computeSafetyScore(parsed);

    return {
      subject: parsed.subject ?? 'Urgent: Action Required',
      body_html: parsed.body_html ?? '<p>Content generation failed.</p>',
      body_text: parsed.body_text ?? 'Content generation failed.',
      sender_name: parsed.sender_name ?? 'IT Security Team',
      sender_email: parsed.sender_email ?? 'security@company.com',
      landing_page_html: parsed.landing_page_html,
      safety_score: safetyScore,
      generation_meta: {
        model: response.model,
        provider: response.provider,
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        latency_ms: response.latency_ms,
      },
    };
  }

  private buildSystemPrompt(): string {
    return `You are PhishForge-AI, an expert security awareness training assistant.
Your purpose is to generate REALISTIC phishing simulation content for AUTHORIZED internal security awareness training only.

Rules:
1. Always generate content that looks convincing but contains no real malware, credentials, or harmful links
2. Use {{tracking_url}} as a placeholder for the simulation landing page link
3. Use {{employee_name}} for the target employee's name
4. Use {{company_name}} for the organization name
5. Return ONLY valid JSON with no additional text

Output format:
\`\`\`json
{
  "subject": "Email subject line",
  "sender_name": "Display name for sender",
  "sender_email": "spoofed-email@domain.com",
  "body_html": "Full HTML email body with {{tracking_url}} and {{employee_name}}",
  "body_text": "Plain text version",
  "landing_page_html": "Optional HTML for the credential capture page (use {{tracking_url}} as form action)"
}
\`\`\``;
  }

  private buildUserPrompt(dto: GenerateCampaignDto, context?: string): string {
    return `Generate a phishing simulation with these parameters:
- Industry: ${dto.industry}
- Target Role: ${dto.target_role}
- Simulation Type: ${dto.simulation_type}
- Difficulty Level: ${dto.difficulty ?? 3}/5 (1=obvious, 5=highly sophisticated)
${dto.context ? `- Additional Context: ${dto.context}` : ''}
${context ? `- Company Knowledge Base Context:\n${context}` : ''}

Create a realistic, role-appropriate phishing scenario. Higher difficulty means more convincing and harder to detect.`;
  }

  private computeSafetyScore(content: any): number {
    let score = 100;
    const text = `${content.subject} ${content.body_text}`.toLowerCase();

    const suspiciousKeywords = ['password', 'login', 'credential', 'verify', 'urgent', 'suspended', 'account'];
    suspiciousKeywords.forEach((kw) => { if (text.includes(kw)) score -= 3; });

    if (!content.subject) score -= 20;
    if (!content.body_html) score -= 20;
    if (!content.sender_email?.includes('@')) score -= 10;

    return Math.max(0, Math.min(100, score));
  }
}
