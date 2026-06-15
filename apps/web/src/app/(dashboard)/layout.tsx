import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Demo mode: pf_demo cookie set by /api/demo-login — skip Supabase auth
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('pf_demo')?.value === '1';

  if (!isDemo) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (isPlaceholder) {
      // Demo mode but no demo session — must go through /login first
      redirect('/login');
    } else {
      const supabase = await createServerClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) redirect('/login');
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}
