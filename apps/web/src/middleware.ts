import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const path = request.nextUrl.pathname;
  const isApi = path.startsWith('/api/');
  const isTracking = path.startsWith('/t/');

  if (isApi || isTracking) return response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip all auth logic if Supabase is not configured
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();

  const isAuth = path.startsWith('/login')
    || path.startsWith('/register')
    || path.startsWith('/forgot-password')
    || path.startsWith('/reset-password');

  const isRoot = path === '/';
  const isDashboard = path.startsWith('/dashboard');
  // The password-reset link signs the user into a temporary recovery session and
  // lands on /reset-password. Never bounce that page to the dashboard, or the user
  // could never actually set a new password.
  const isRecovery = path.startsWith('/reset-password');

  // Redirect logged-in users away from auth pages and root (except the reset page)
  if (session && (isAuth || isRoot) && !isRecovery) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from dashboard routes
  if (!session && isDashboard) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
