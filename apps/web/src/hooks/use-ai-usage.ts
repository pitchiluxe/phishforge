'use client';

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'pf_ai_usage';
const MONTH_KEY = 'pf_ai_usage_month';

export interface UsageBreakdown {
  cyberlm: number;
  brain: number;
  training: number;
  classroom: number;
  campaign: number;
}

export interface AIUsage {
  totalTokens: number;
  breakdown: UsageBreakdown;
  month: string; // 'YYYY-MM'
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function emptyUsage(): AIUsage {
  return {
    totalTokens: 0,
    breakdown: { cyberlm: 0, brain: 0, training: 0, classroom: 0, campaign: 0 },
    month: currentMonth(),
  };
}

function readUsage(): AIUsage {
  if (typeof window === 'undefined') return emptyUsage();
  try {
    const month = currentMonth();
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedMonth = localStorage.getItem(MONTH_KEY);
    // Reset if month changed
    if (!stored || storedMonth !== month) return emptyUsage();
    return JSON.parse(stored) as AIUsage;
  } catch {
    return emptyUsage();
  }
}

function writeUsage(usage: AIUsage) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    localStorage.setItem(MONTH_KEY, usage.month);
  } catch {}
}

export function addTokenUsage(feature: keyof UsageBreakdown, tokens: number) {
  const current = readUsage();
  const month = currentMonth();
  const updated: AIUsage = {
    month,
    totalTokens: (month === current.month ? current.totalTokens : 0) + tokens,
    breakdown: {
      ...(month === current.month ? current.breakdown : { cyberlm: 0, brain: 0, training: 0, classroom: 0, campaign: 0 }),
      [feature]: ((month === current.month ? current.breakdown[feature] : 0) + tokens),
    },
  };
  writeUsage(updated);
  window.dispatchEvent(new CustomEvent('pf-usage-update', { detail: updated }));
}

export function useAIUsage() {
  const [usage, setUsage] = useState<AIUsage>(emptyUsage);

  useEffect(() => {
    setUsage(readUsage());
    const handler = (e: Event) => setUsage((e as CustomEvent<AIUsage>).detail);
    window.addEventListener('pf-usage-update', handler);
    return () => window.removeEventListener('pf-usage-update', handler);
  }, []);

  const reset = useCallback(() => {
    const fresh = emptyUsage();
    writeUsage(fresh);
    setUsage(fresh);
  }, []);

  return { usage, reset };
}
