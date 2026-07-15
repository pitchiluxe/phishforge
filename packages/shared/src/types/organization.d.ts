export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type AIProvider = 'openrouter' | 'ollama';
export type UserRole = 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';
export interface Organization {
    id: string;
    name: string;
    slug: string;
    domain?: string;
    logo_url?: string;
    plan: SubscriptionPlan;
    plan_expires_at?: string;
    stripe_customer_id?: string;
    monthly_simulation_limit: number;
    simulations_used_this_month: number;
    ai_provider: AIProvider;
    ai_model?: string;
    ollama_base_url?: string;
    openrouter_model?: string;
    webhook_url?: string;
    settings: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}
export interface User {
    id: string;
    organization_id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: UserRole;
    mfa_enabled: boolean;
    last_sign_in_at?: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}
export interface UpdateOrganizationDto {
    name?: string;
    domain?: string;
    ai_provider?: AIProvider;
    ai_model?: string;
    ollama_base_url?: string;
    openrouter_model?: string;
    webhook_url?: string;
    settings?: Record<string, unknown>;
}
