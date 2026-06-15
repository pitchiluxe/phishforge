import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

function isDemoOrPlaceholder() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return !url || url.includes('placeholder');
}

export async function GET() {
  let ollamaUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

  if (!isDemoOrPlaceholder()) {
    try {
      const supabase = await createServerClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: user } = await supabase.from('users').select('organization_id').eq('id', session.user.id).single();
        const { data: org } = await supabase.from('organizations').select('ollama_base_url').eq('id', user?.organization_id).single();
        if (org?.ollama_base_url) ollamaUrl = org.ollama_base_url;
      }
    } catch {}
  }

  const [openRouterStatus, ollamaStatus] = await Promise.allSettled([
    fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    }),
    fetch(`${ollamaUrl}/api/version`, { signal: AbortSignal.timeout(3000) }),
  ]);

  let ollamaVersion: string | null = null;
  if (ollamaStatus.status === 'fulfilled' && ollamaStatus.value.ok) {
    const data = await ollamaStatus.value.json();
    ollamaVersion = data.version ?? null;
  }

  return NextResponse.json({
    openrouter: {
      connected: openRouterStatus.status === 'fulfilled' && openRouterStatus.value.ok,
    },
    ollama: {
      connected: ollamaStatus.status === 'fulfilled' && ollamaStatus.value.ok,
      version: ollamaVersion,
      base_url: ollamaUrl,
    },
  });
}
