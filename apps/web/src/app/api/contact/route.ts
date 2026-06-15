import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { name, email, company, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'name, email, and message are required' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"PhishForge Contact" <${process.env.SMTP_USER}>`,
    to: 'erickomari243@gmail.com',
    replyTo: email,
    subject: `[PhishForge] New message from ${name}${company ? ` @ ${company}` : ''}`,
    text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || '—'}\n\n${message}`,
    html: `
      <div style="font-family:monospace;background:#080808;color:#c8ffd4;padding:32px;border-radius:4px;border:1px solid rgba(0,255,65,0.2)">
        <p style="color:#00ff41;font-size:14px;margin:0 0 24px">// PhishForge contact form submission</p>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 0;color:#00ff41;opacity:0.6;font-size:12px;width:100px">NAME</td><td style="padding:6px 0;font-size:13px">${name}</td></tr>
          <tr><td style="padding:6px 0;color:#00ff41;opacity:0.6;font-size:12px">EMAIL</td><td style="padding:6px 0;font-size:13px"><a href="mailto:${email}" style="color:#00ff41">${email}</a></td></tr>
          <tr><td style="padding:6px 0;color:#00ff41;opacity:0.6;font-size:12px">COMPANY</td><td style="padding:6px 0;font-size:13px">${company || '—'}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid rgba(0,255,65,0.15);margin:20px 0"/>
        <p style="font-size:13px;line-height:1.7;white-space:pre-wrap">${message.replace(/</g, '&lt;')}</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
