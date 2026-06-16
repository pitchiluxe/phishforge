import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function isPlaceholder() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return !url || url.includes('placeholder');
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://phishforge.vercel.app';

function inviteEmailHtml(email: string, roleLabel: string, link: string) {
  return `
<div style="font-family:monospace;background:#080808;color:#c8ffd4;padding:40px;max-width:560px;margin:0 auto;border:1px solid rgba(0,255,65,0.2);border-radius:8px">
  <p style="margin:0 0 6px;color:#00ff41;font-size:20px;font-weight:700;letter-spacing:0.04em">PhishForge</p>
  <p style="margin:0 0 28px;color:rgba(0,255,65,0.35);font-size:12px">// AI-Powered Security Awareness Platform</p>

  <h2 style="margin:0 0 14px;color:#00ff41;font-size:16px;font-weight:700">You've been invited to join PhishForge</h2>

  <p style="margin:0 0 12px;color:#94a3b8;font-size:13px;line-height:1.7">
    A team administrator has invited you to the <strong style="color:#c8ffd4">PhishForge</strong> security awareness
    platform as a <strong style="color:#00ff41">${roleLabel}</strong>.
  </p>
  <p style="margin:0 0 28px;color:#94a3b8;font-size:13px;line-height:1.7">
    Click the button below to set your password and access your security training dashboard.
    This invite link expires in <strong style="color:#facc15">48 hours</strong>.
  </p>

  <a href="${link}"
     style="display:inline-block;background:#00ff41;color:#000;font-weight:700;font-size:13px;
            padding:12px 28px;border-radius:6px;text-decoration:none;letter-spacing:0.03em">
    Accept Invitation &rarr;
  </a>

  <hr style="border:none;border-top:1px solid rgba(0,255,65,0.1);margin:32px 0"/>

  <p style="margin:0 0 8px;color:#475569;font-size:11px;line-height:1.6">
    If the button doesn't work, copy this link into your browser:<br/>
    <a href="${link}" style="color:rgba(0,255,65,0.5);word-break:break-all">${link}</a>
  </p>
  <p style="margin:12px 0 0;color:#334155;font-size:11px">
    If you didn't expect this, you can safely ignore this email.
  </p>
</div>`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, role } = body as { email?: string; role?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  if (isPlaceholder()) {
    await new Promise(r => setTimeout(r, 600));
    return NextResponse.json({ ok: true, demo: true });
  }

  const roleLabels: Record<string, string> = {
    analyst: 'Security Analyst', manager: 'Team Manager',
    admin: 'Administrator', viewer: 'Viewer',
  };
  const roleLabel = roleLabels[role ?? 'analyst'] ?? (role ?? 'analyst');

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // If SMTP is configured, generate the link ourselves and send via Nodemailer
    if (smtpUser && smtpPass) {
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: 'invite',
        email,
        options: {
          data: { role: role ?? 'analyst' },
          redirectTo: `${APP_URL}/auth/accept-invite`,
        },
      });

      if (linkErr || !linkData?.properties?.action_link) {
        // generateLink failed — fall through to inviteUserByEmail below
      } else {
        const inviteLink = linkData.properties.action_link;
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"PhishForge" <${smtpUser}>`,
          to: email,
          subject: `You've been invited to PhishForge — ${roleLabel}`,
          html: inviteEmailHtml(email, roleLabel, inviteLink),
          text: `You've been invited to PhishForge as ${roleLabel}.\n\nAccept invitation: ${inviteLink}\n\nThis link expires in 48 hours.`,
        });

        return NextResponse.json({ ok: true, method: 'smtp', userId: linkData.user?.id });
      }
    }

    // Fallback: let Supabase send its own invite email
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role: role ?? 'analyst' },
      redirectTo: `${APP_URL}/auth/accept-invite`,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, method: 'supabase', userId: data.user?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send invite';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
