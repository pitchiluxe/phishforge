import { NextRequest, NextResponse } from 'next/server';

const TO = 'erickomari243@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const { name, email, company, message } = body;
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'name, email, and message are required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // No email service configured — log and acknowledge gracefully
      console.log('[contact] no RESEND_API_KEY set — message received but not emailed:', { name, email, company, message });
      return NextResponse.json({ success: true });
    }

    const html = `
      <div style="font-family:monospace;background:#080808;color:#c8ffd4;padding:32px;border-radius:4px;border:1px solid rgba(0,255,65,0.2)">
        <p style="color:#00ff41;font-size:14px;margin:0 0 24px">// PhishForge contact form submission</p>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 0;color:#00ff41;opacity:0.6;font-size:12px;width:100px">NAME</td><td style="padding:6px 0;font-size:13px">${name}</td></tr>
          <tr><td style="padding:6px 0;color:#00ff41;opacity:0.6;font-size:12px">EMAIL</td><td style="padding:6px 0;font-size:13px"><a href="mailto:${email}" style="color:#00ff41">${email}</a></td></tr>
          <tr><td style="padding:6px 0;color:#00ff41;opacity:0.6;font-size:12px">COMPANY</td><td style="padding:6px 0;font-size:13px">${company || '—'}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid rgba(0,255,65,0.15);margin:20px 0"/>
        <p style="font-size:13px;line-height:1.7;white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PhishForge Contact <onboarding@resend.dev>',
        to: [TO],
        reply_to: email,
        subject: `[PhishForge] New message from ${name}${company ? ` @ ${company}` : ''}`,
        html,
        text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || '—'}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[contact] Resend error:', err);
      return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact] unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
