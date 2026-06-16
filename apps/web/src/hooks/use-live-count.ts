'use client';
import { useEffect, useState } from 'react';

export function useLiveCount() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const isPlaceholder = !url || url.includes('placeholder') || url.includes('your-project');

    if (isPlaceholder) {
      setCount(Math.floor(Math.random() * 5) + 1);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ch: any = null;

    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      ch = supabase.channel('pf_presence', {
        config: { presence: { key: crypto.randomUUID() } },
      });
      ch.on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState();
        setCount(Math.max(1, Object.keys(state).length));
      }).subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') await ch.track({ online_at: new Date().toISOString() });
      });
    });

    return () => {
      if (ch) {
        import('@/lib/supabase/client').then(({ createClient }) =>
          createClient().removeChannel(ch),
        );
      }
    };
  }, []);

  return count;
}
