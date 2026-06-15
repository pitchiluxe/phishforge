import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('pf_demo', '1', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 h
    sameSite: 'lax',
  });
  return res;
}
