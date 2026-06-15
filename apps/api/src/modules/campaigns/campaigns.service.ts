import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { AIService } from '../ai/ai.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import type { GenerateCampaignDto } from '@phishforge/shared';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly aiService: AIService,
    private readonly knowledge: KnowledgeService,
  ) {}

  async findAll(orgId: string, filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const offset = (page - 1) * limit;

    let query = this.supabase.db
      .from('campaigns')
      .select('*, users!created_by(full_name, email)', { count: 'exact' })
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.status) query = query.eq('status', filters.status);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    return { data: data ?? [], total: count ?? 0, page, limit };
  }

  async findOne(id: string, orgId: string) {
    const { data, error } = await this.supabase.db
      .from('campaigns')
      .select('*, templates(*), campaign_targets(count)')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error || !data) throw new NotFoundException(`Campaign ${id} not found`);
    return data;
  }

  async create(dto: Partial<GenerateCampaignDto> & { name: string }, orgId: string, userId: string) {
    const { data: org } = await this.supabase.db
      .from('organizations')
      .select('simulations_used_this_month, monthly_simulation_limit')
      .eq('id', orgId)
      .single();

    if (org && org.simulations_used_this_month >= org.monthly_simulation_limit) {
      throw new ForbiddenException('Monthly simulation limit reached. Upgrade your plan.');
    }

    const { data, error } = await this.supabase.db
      .from('campaigns')
      .insert({
        organization_id: orgId,
        created_by: userId,
        ...dto,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async generateContent(campaignId: string, dto: GenerateCampaignDto, orgId: string, userId: string) {
    await this.findOne(campaignId, orgId);

    let knowledgeContext: string | undefined;
    if (dto.use_knowledge_base) {
      const results = await this.knowledge.search(
        `${dto.industry} ${dto.target_role} phishing email`,
        orgId,
        5,
      );
      if (results.length > 0) {
        knowledgeContext = results.map((r) => r.text).join('\n\n');
      }
    }

    const content = await this.aiService.generatePhishingContent(dto, orgId, userId, knowledgeContext);

    const { data: template } = await this.supabase.db
      .from('templates')
      .insert({
        organization_id: orgId,
        campaign_id: campaignId,
        name: `Generated - ${dto.industry} - ${dto.target_role}`,
        simulation_type: dto.simulation_type,
        industry: dto.industry,
        target_role: dto.target_role,
        difficulty: dto.difficulty,
        subject: content.subject,
        body_html: content.body_html,
        body_text: content.body_text,
        sender_name: content.sender_name,
        sender_email: content.sender_email,
        landing_page_html: content.landing_page_html,
        ai_generated: true,
        safety_score: content.safety_score,
        generation_meta: content.generation_meta,
      })
      .select()
      .single();

    await this.supabase.db
      .from('campaigns')
      .update({ ai_provider: dto.ai_provider, ai_model: dto.ai_model })
      .eq('id', campaignId);

    return { template, safety_score: content.safety_score };
  }

  async updateStatus(id: string, status: string, orgId: string) {
    const campaign = await this.findOne(id, orgId);

    const { data, error } = await this.supabase.db
      .from('campaigns')
      .update({ status, ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}) })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string, orgId: string) {
    await this.findOne(id, orgId);
    const { error } = await this.supabase.db
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);
    if (error) throw new Error(error.message);
    return { success: true };
  }
}
