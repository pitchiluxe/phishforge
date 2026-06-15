export type PlanId = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  simulationsPerMonth: number;
  aiTokensPerMonth: number;
  seats: number;
  kbStorageGB: number;
  cyberLMRequestsPerDay: number; // -1 = unlimited
  aiTrainingPerMonth: number;    // -1 = unlimited
  classroomModules: number;      // -1 = unlimited
  apiAccess: boolean;
  customTemplates: boolean;
  webhooks: boolean;
  advancedAnalytics: boolean;
  threatIntelFull: boolean;
  customAiModel: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    simulationsPerMonth: 100,
    aiTokensPerMonth: 50_000,
    seats: 1,
    kbStorageGB: 0,
    cyberLMRequestsPerDay: 5,
    aiTrainingPerMonth: 5,
    classroomModules: 3,
    apiAccess: false,
    customTemplates: false,
    webhooks: false,
    advancedAnalytics: false,
    threatIntelFull: false,
    customAiModel: false,
  },
  pro: {
    simulationsPerMonth: 5_000,
    aiTokensPerMonth: 5_000_000,
    seats: 5,
    kbStorageGB: 10,
    cyberLMRequestsPerDay: -1,
    aiTrainingPerMonth: -1,
    classroomModules: -1,
    apiAccess: true,
    customTemplates: true,
    webhooks: true,
    advancedAnalytics: true,
    threatIntelFull: true,
    customAiModel: true,
  },
  enterprise: {
    simulationsPerMonth: -1,
    aiTokensPerMonth: -1,
    seats: -1,
    kbStorageGB: -1,
    cyberLMRequestsPerDay: -1,
    aiTrainingPerMonth: -1,
    classroomModules: -1,
    apiAccess: true,
    customTemplates: true,
    webhooks: true,
    advancedAnalytics: true,
    threatIntelFull: true,
    customAiModel: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[(plan as PlanId)] ?? PLAN_LIMITS.free;
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
