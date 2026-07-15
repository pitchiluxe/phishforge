import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { AIGenerateRequest, AIGenerateResponse, OpenRouterModel } from '@phishforge/shared';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly client: OpenAI;
  
  // Cache free models for 10 minutes to reduce API calls
  private cachedFreeModels: OpenRouterModel[] | null = null;
  private lastCacheTime = 0;
  private readonly CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
  
  // Preferred free models in order of preference (updated regularly)
  private readonly PREFERRED_FREE_MODELS = [
    'meta-llama/llama-3.2-90b-vision-instruct:free',
    'meta-llama/llama-3.1-70b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'gpt-3.5-turbo',
  ];

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

  /** Find the first working free model by testing each in order */
  async getWorkingFreeModel(): Promise<string> {
    this.logger.debug('Attempting to find a working free model...');

    for (const model of this.PREFERRED_FREE_MODELS) {
      try {
        this.logger.debug(`Testing model: ${model}`);
        
        // Quick test with a minimal request
        const response = await this.client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10,
        });

        this.logger.log(`✓ Found working free model: ${model}`);
        return model;
      } catch (error: any) {
        const errorMsg = error.message || error.code || 'Unknown error';
        if (error.status === 404 || errorMsg.includes('unavailable') || errorMsg.includes('404')) {
          this.logger.debug(`✗ Model ${model} not available: ${errorMsg}`);
          continue;
        }
        this.logger.warn(`⚠ Unexpected error testing ${model}: ${errorMsg}`);
        continue;
      }
    }

    // If no free model works, fall back to default
    const defaultModel = this.config.get('OPENROUTER_DEFAULT_MODEL', 'meta-llama/llama-3.1-8b-instruct:free');
    this.logger.warn(`No free model available, falling back to: ${defaultModel}`);
    return defaultModel;
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    this.logger.log('getAvailableModels called');
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${this.config.getOrThrow('OPENROUTER_API_KEY')}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      this.logger.log(`Fetched ${(data.data as OpenRouterModel[] ?? []).length} models from OpenRouter`);
      return (data.data as OpenRouterModel[]) ?? [];
    } catch (error: any) {
      this.logger.error(`Failed to fetch OpenRouter models: ${error.message}`);
      return [];
    }
  }

  /** Get free models with 10-minute caching to reduce API calls */
  async getFreeModels(skipCache = false): Promise<OpenRouterModel[]> {
    const now = Date.now();
    
    // Return cached if still valid and not skipped
    if (
      !skipCache &&
      this.cachedFreeModels &&
      (now - this.lastCacheTime) < this.CACHE_DURATION_MS
    ) {
      this.logger.debug(`Returning cached free models (${this.cachedFreeModels.length} models)`);
      return this.cachedFreeModels;
    }

    this.logger.debug('Fetching fresh free models from OpenRouter...');
    const models = await this.getAvailableModels();
    const freeModels = models.filter(
      (m) =>
        parseFloat(m.pricing?.prompt ?? '0') === 0 &&
        parseFloat(m.pricing?.completion ?? '0') === 0,
    );

    // Cache the results
    this.cachedFreeModels = freeModels;
    this.lastCacheTime = now;

    this.logger.log(`✓ Cached ${freeModels.length} free models from OpenRouter`);
    return freeModels;
  }

  /** Get free models sorted by preference (best models first) */
  async getBestFreeModels(): Promise<OpenRouterModel[]> {
    const allFree = await this.getFreeModels();
    
    // Sort by preferred order
    return allFree.sort((a, b) => {
      const aIdx = this.PREFERRED_FREE_MODELS.indexOf(a.id);
      const bIdx = this.PREFERRED_FREE_MODELS.indexOf(b.id);
      
      // Preferred models come first
      if (aIdx !== -1 && bIdx === -1) return -1;
      if (aIdx === -1 && bIdx !== -1) return 1;
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      
      // Then sort by context length (larger is better)
      return (b.context_length ?? 0) - (a.context_length ?? 0);
    });
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
