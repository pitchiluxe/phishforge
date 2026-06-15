import type { AIProvider } from './organization';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description?: string;
  context_length?: number;
  is_free?: boolean;
  pricing?: {
    prompt: number;
    completion: number;
  };
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaModelPullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    is_moderated: boolean;
  };
}

export interface AIGenerateRequest {
  provider: AIProvider;
  model: string;
  system_prompt: string;
  user_prompt: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface AIGenerateResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latency_ms: number;
}

export interface SwitchProviderDto {
  provider: AIProvider;
  model?: string;
  ollama_base_url?: string;
}
