import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { AIGenerateRequest, AIGenerateResponse, OpenRouterModel } from '@phishforge/shared';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.getOrThrow('OPENROUTER_API_KEY'),
      baseURL: this.config.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
      defaultHeaders: {
        'HTTP-Referer': this.config.get('OPENROUTER_SITE_URL', 'https://phishforge.ai'),
        'X-Title': this.config.get('OPENROUTER_SITE_NAME', 'PhishForge AI'),
      },
    });
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    const startTime = Date.now();

    try {
      const completion = await this.client.chat.completions.create({
        model: request.model,
        messages: [
          { role: 'system', content: request.system_prompt },
          { role: 'user', content: request.user_prompt },
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2048,
      });

      const latency_ms = Date.now() - startTime;
      const choice = completion.choices[0];

      return {
        content: choice.message.content ?? '',
        model: completion.model,
        provider: 'openrouter',
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens ?? 0,
          completion_tokens: completion.usage?.completion_tokens ?? 0,
          total_tokens: completion.usage?.total_tokens ?? 0,
        },
        latency_ms,
      };
    } catch (error: any) {
      this.logger.error(`OpenRouter generation failed: ${error.message}`, error.stack);
      throw new ServiceUnavailableException(`OpenRouter error: ${error.message}`);
    }
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${this.config.getOrThrow('OPENROUTER_API_KEY')}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return (data.data as OpenRouterModel[]) ?? [];
    } catch (error: any) {
      this.logger.error(`Failed to fetch OpenRouter models: ${error.message}`);
      return [];
    }
  }

  async getFreeModels(): Promise<OpenRouterModel[]> {
    const models = await this.getAvailableModels();
    return models.filter(
      (m) =>
        parseFloat(m.pricing?.prompt ?? '0') === 0 &&
        parseFloat(m.pricing?.completion ?? '0') === 0,
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      const models = await this.getAvailableModels();
      return models.length > 0;
    } catch {
      return false;
    }
  }
}
