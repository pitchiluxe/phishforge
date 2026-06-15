import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AIGenerateRequest, AIGenerateResponse, OllamaModel } from '@phishforge/shared';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);

  constructor(private readonly config: ConfigService) {}

  private getBaseUrl(customUrl?: string): string {
    return customUrl ?? this.config.get('OLLAMA_BASE_URL', 'http://localhost:11434');
  }

  async generate(request: AIGenerateRequest, ollamaBaseUrl?: string): Promise<AIGenerateResponse> {
    const baseUrl = this.getBaseUrl(ollamaBaseUrl);
    const startTime = Date.now();

    const prompt = `<system>${request.system_prompt}</system>\n\n${request.user_prompt}`;

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model,
          prompt,
          stream: false,
          options: {
            temperature: request.temperature ?? 0.7,
            num_predict: request.max_tokens ?? 2048,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama returned ${response.status}: ${error}`);
      }

      const data = await response.json();
      const latency_ms = Date.now() - startTime;

      return {
        content: data.response ?? '',
        model: request.model,
        provider: 'ollama',
        usage: {
          prompt_tokens: data.prompt_eval_count ?? 0,
          completion_tokens: data.eval_count ?? 0,
          total_tokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
        },
        latency_ms,
      };
    } catch (error: any) {
      this.logger.error(`Ollama generation failed: ${error.message}`);
      throw new ServiceUnavailableException(`Ollama error: ${error.message}`);
    }
  }

  async listModels(ollamaBaseUrl?: string): Promise<OllamaModel[]> {
    const baseUrl = this.getBaseUrl(ollamaBaseUrl);
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.models ?? [];
    } catch (error: any) {
      this.logger.error(`Failed to list Ollama models: ${error.message}`);
      return [];
    }
  }

  async pullModel(model: string, ollamaBaseUrl?: string): Promise<ReadableStream> {
    const baseUrl = this.getBaseUrl(ollamaBaseUrl);
    const response = await fetch(`${baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model, stream: true }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`Failed to pull model ${model}`);
    }

    return response.body!;
  }

  async deleteModel(model: string, ollamaBaseUrl?: string): Promise<void> {
    const baseUrl = this.getBaseUrl(ollamaBaseUrl);
    const response = await fetch(`${baseUrl}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`Failed to delete model ${model}`);
    }
  }

  async getModelInfo(model: string, ollamaBaseUrl?: string): Promise<Record<string, unknown>> {
    const baseUrl = this.getBaseUrl(ollamaBaseUrl);
    const response = await fetch(`${baseUrl}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model }),
    });

    if (!response.ok) throw new Error(`Model ${model} not found`);
    return response.json();
  }

  async testConnection(ollamaBaseUrl?: string): Promise<boolean> {
    try {
      const baseUrl = this.getBaseUrl(ollamaBaseUrl);
      const response = await fetch(`${baseUrl}/api/version`, { signal: AbortSignal.timeout(3000) });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getVersion(ollamaBaseUrl?: string): Promise<string | null> {
    try {
      const baseUrl = this.getBaseUrl(ollamaBaseUrl);
      const response = await fetch(`${baseUrl}/api/version`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.version ?? null;
    } catch {
      return null;
    }
  }
}
