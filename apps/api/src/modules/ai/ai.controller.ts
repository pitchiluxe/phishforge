import {
  Controller, Get, Post, Delete, Put, Body, Param, Query, UseGuards, Response, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PublicJwtAuthGuard } from '../../common/guards/public-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AIService } from './ai.service';
import { OpenRouterService } from './openrouter.service';
import { OllamaService } from './ollama.service';
import { ModelPreferencesService } from './model-preferences.service';
import type { Response as ExpressResponse } from 'express';

@ApiTags('ai')
@Controller('v1/ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly openRouter: OpenRouterService,
    private readonly ollama: OllamaService,
    private readonly modelPreferences: ModelPreferencesService,
  ) {}

  @Get('health-check')
  @ApiOperation({ summary: 'AI module health check - no auth' })
  async aiHealthCheck() {
    return { status: 'ok', message: 'AI module is healthy' };
  }

  @Get('models/openrouter')
  @Public()
  @ApiOperation({ summary: 'List all available OpenRouter models' })
  async getOpenRouterModels() {
    console.log('DEBUG: getOpenRouterModels was called!');
    return this.openRouter.getAvailableModels();
  }

  @Get('models/openrouter/free')
  @Public()
  @ApiOperation({ summary: 'List free OpenRouter models' })
  async getFreeModels() {
    return this.openRouter.getFreeModels();
  }

  @Get('models/openrouter/free/best')
  @Public()
  @ApiOperation({ summary: 'List free OpenRouter models sorted by preference' })
  async getBestFreeModels() {
    const models = await this.openRouter.getBestFreeModels();
    return {
      models,
      count: models.length,
      message: `Found ${models.length} free models ranked by preference`,
    };
  }

  @Get('models/openrouter/working-free')
  @Public()
  @ApiOperation({ summary: 'Find the best working free OpenRouter model' })
  async getWorkingFreeModel() {
    const model = await this.openRouter.getWorkingFreeModel();
    return { model, message: `Using free model: ${model}` };
  }

  @Get('models/ollama')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List installed Ollama models' })
  async getOllamaModels(@CurrentUser('organization_id') orgId: string) {
    const { data: org } = await this.getOrgSettings(orgId);
    return this.ollama.listModels(org?.ollama_base_url);
  }

  @Post('models/ollama/pull')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pull an Ollama model (streaming)' })
  async pullOllamaModel(
    @Body('model') model: string,
    @CurrentUser('organization_id') orgId: string,
    @Res() res: ExpressResponse,
  ) {
    const { data: org } = await this.getOrgSettings(orgId);
    const stream = await this.ollama.pullModel(model, org?.ollama_base_url);

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value));
    }

    res.end();
  }

  @Delete('models/ollama/:model')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an Ollama model' })
  async deleteOllamaModel(
    @Param('model') model: string,
    @CurrentUser('organization_id') orgId: string,
  ) {
    const { data: org } = await this.getOrgSettings(orgId);
    await this.ollama.deleteModel(model, org?.ollama_base_url);
    return { success: true, message: `Model ${model} deleted` };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check AI provider connectivity status' })
  async getStatus(@CurrentUser('organization_id') orgId: string) {
    const { data: org } = await this.getOrgSettings(orgId);
    const [openRouterOk, ollamaOk, ollamaVersion] = await Promise.all([
      this.openRouter.testConnection(),
      this.ollama.testConnection(org?.ollama_base_url),
      this.ollama.getVersion(org?.ollama_base_url),
    ]);

    return {
      openrouter: { connected: openRouterOk },
      ollama: { connected: ollamaOk, version: ollamaVersion, base_url: org?.ollama_base_url },
    };
  }

  // ─── Model Preferences Management ──────────────────────────────────

  @Get('models/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get model preferences for organization' })
  async getModelPreferences(@CurrentUser('organization_id') orgId: string) {
    const models = await this.modelPreferences.getOrgModels(orgId);
    return { models, count: models.length };
  }

  @Get('models/preferences/enabled')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enabled models only' })
  async getEnabledModels(@CurrentUser('organization_id') orgId: string) {
    const models = await this.modelPreferences.getEnabledModels(orgId);
    return { models, count: models.length };
  }

  @Post('models/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set model preference' })
  async setModelPreference(
    @CurrentUser('organization_id') orgId: string,
    @Body() body: { model_name: string; is_enabled?: boolean; priority_order?: number },
  ) {
    const preference = await this.modelPreferences.setModelPreference(
      orgId,
      body.model_name,
      body.is_enabled ?? true,
      body.priority_order ?? 0,
    );
    return preference;
  }

  @Delete('models/preferences/:modelName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete model preference' })
  async deleteModelPreference(
    @CurrentUser('organization_id') orgId: string,
    @Param('modelName') modelName: string,
  ) {
    await this.modelPreferences.deleteModelPreference(orgId, modelName);
    return { success: true, message: `Deleted model preference for ${modelName}` };
  }

  @Put('models/preferences/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update multiple model preferences' })
  async updateModelPreferencesBatch(
    @CurrentUser('organization_id') orgId: string,
    @Body() body: { updates: Array<{ model_name: string; is_enabled?: boolean; priority_order?: number }> },
  ) {
    const updated = await this.modelPreferences.updateModelPreferencesBatch(orgId, body.updates);
    return { updated, count: updated.length };
  }

  @Post('models/preferences/default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set preferred default model' })
  async setPreferredModel(
    @CurrentUser('organization_id') orgId: string,
    @Body() body: { model_name: string },
  ) {
    await this.modelPreferences.setPreferredModel(orgId, body.model_name);
    return { success: true, message: `Set preferred model to ${body.model_name}` };
  }

  @Post('models/preferences/auto-select')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle auto-select model feature' })
  async setAutoSelectModel(
    @CurrentUser('organization_id') orgId: string,
    @Body() body: { enabled: boolean },
  ) {
    await this.modelPreferences.setAutoSelectModel(orgId, body.enabled);
    return { success: true, message: `Auto-select ${body.enabled ? 'enabled' : 'disabled'}` };
  }

  private async getOrgSettings(orgId: string) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    return supabase.from('organizations').select('ollama_base_url, ai_provider').eq('id', orgId).single();
  }
}
