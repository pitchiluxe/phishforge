import type { AIProvider } from './organization';

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
export type SimulationType = 'email' | 'sms' | 'voice' | 'landing_page' | 'attachment';

export interface CampaignStats {
  total_targets: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  submitted: number;
  reported: number;
}

export interface Campaign {
  id: string;
  organization_id: string;
  created_by: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  simulation_type: SimulationType;
  industry: string;
  target_role: string;
  difficulty: number;
  scheduled_at?: string;
  completed_at?: string;
  ai_provider?: AIProvider;
  ai_model?: string;
  ai_prompt?: string;
  settings: Record<string, unknown>;
  stats: CampaignStats;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  organization_id?: string;
  campaign_id?: string;
  name: string;
  description?: string;
  simulation_type: SimulationType;
  industry?: string;
  target_role?: string;
  difficulty?: number;
  subject?: string;
  body_html?: string;
  body_text?: string;
  sender_name?: string;
  sender_email?: string;
  landing_page_html?: string;
  attachment_type?: string;
  tags: string[];
  is_public: boolean;
  safety_score?: number;
  ai_generated: boolean;
  generation_meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GenerateCampaignDto {
  name: string;
  industry: string;
  target_role: string;
  simulation_type: SimulationType;
  difficulty?: number;
  ai_provider?: AIProvider;
  ai_model?: string;
  context?: string;
  use_knowledge_base?: boolean;
}

export interface GeneratedContent {
  subject: string;
  body_html: string;
  body_text: string;
  sender_name: string;
  sender_email: string;
  landing_page_html?: string;
  safety_score: number;
  generation_meta: {
    model: string;
    provider: AIProvider;
    prompt_tokens: number;
    completion_tokens: number;
    latency_ms: number;
  };
}

export interface CampaignTarget {
  id: string;
  campaign_id: string;
  organization_id: string;
  email: string;
  full_name?: string;
  department?: string;
  role?: string;
  tracking_token: string;
  events: TrackingEvent[];
  risk_score: number;
  created_at: string;
}

export interface TrackingEvent {
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'submitted' | 'reported';
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export const INDUSTRIES = [
  'technology', 'finance', 'healthcare', 'retail', 'manufacturing',
  'education', 'government', 'legal', 'real-estate', 'energy',
  'media', 'transportation', 'hospitality', 'nonprofit', 'general',
] as const;

export const TARGET_ROLES = [
  'employee', 'manager', 'executive', 'accountant', 'hr-specialist',
  'it-administrator', 'sales-representative', 'customer-service',
  'legal-counsel', 'c-suite',
] as const;
