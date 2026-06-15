import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Response, Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AIService } from './ai.service';
import { OpenRouterService } from './openrouter.service';
import { OllamaService } from './ollama.service';
import type { Response as ExpressResponse } from 'express';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly openRouter: OpenRouterService,
    private readonly ollama: OllamaService,
  ) {}

  @Get('models/openrouter')
  @ApiOperation({ summary: 'List all available OpenRouter models' })
  async getOpenRouterModels() {
    return this.openRouter.getAvailableModels();
  }

  @Get('models/openrouter/free')
  @ApiOperation({ summary: 'List free OpenRouter models' })
  async getFreeModels() {
    return this.openRouter.getFreeModels();
  }

  @Get('models/ollama')
  @ApiOperation({ summary: 'List installed Ollama models' })
  async getOllamaModels(@CurrentUser('organization_id') orgId: string) {
    const { data: org } = await this.getOrgSettings(orgId);
    return this.ollama.listModels(org?.ollama_base_url);
  }

  @Post('models/ollama/pull')
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

  private async getOrgSettings(orgId: string) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    return supabase.from('organizations').select('ollama_base_url, ai_provider').eq('id', orgId).single();
  }
}
