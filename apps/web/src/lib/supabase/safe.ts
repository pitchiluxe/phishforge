import { createServerClient } from './server';

export async function getSafeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  if (!url || url.includes('placeholder')) return null;
  try {
    return await createServerClient();
  } catch {
    return null;
  }
}
