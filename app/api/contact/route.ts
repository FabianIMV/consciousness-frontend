import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import { CONTACT_EMAIL } from '@/lib/site';

const RECIPIENT = process.env.CONTACT_EMAIL || CONTACT_EMAIL;
const SENDER = process.env.CONTACT_FROM || 'Consciousness Networks <onboarding@resend.dev>';

const LIMITS = { name: 120, email: 200, subject: 120, message: 5000 } as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Submissions are interpolated into an HTML email, so every value is escaped. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Keeps header-injection sequences out of the subject line. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
  }

  const fields = {
    name: typeof payload.name === 'string' ? payload.name.trim() : '',
    email: typeof payload.email === 'string' ? payload.email.trim() : '',
    subject: typeof payload.subject === 'string' ? payload.subject.trim() : '',
    message: typeof payload.message === 'string' ? payload.message.trim() : '',
  };

  const missing = Object.entries(fields).filter(([, value]) => !value);
  if (missing.length) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const tooLong = Object.entries(fields).find(
    ([key, value]) => value.length > LIMITS[key as keyof typeof LIMITS]
  );
  if (tooLong) {
    return NextResponse.json({ error: `${tooLong[0]} is too long` }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(fields.email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY is not configured');
    return NextResponse.json({ error: 'Email service unavailable' }, { status: 503 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: SENDER,
      to: [RECIPIENT],
      reply_to: fields.email,
      subject: `[Contact] ${singleLine(fields.subject)} — ${singleLine(fields.name)}`,
      text: [
        `Name: ${fields.name}`,
        `Email: ${fields.email}`,
        `Topic: ${fields.subject}`,
        '',
        fields.message,
      ].join('\n'),
      html: `
        <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #14161a;">
          <h1 style="font-size: 18px; margin: 0 0 20px;">New contact form submission</h1>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #5a616b; width: 88px;">Name</td><td style="padding: 6px 0;">${escapeHtml(fields.name)}</td></tr>
            <tr><td style="padding: 6px 0; color: #5a616b;">Email</td><td style="padding: 6px 0;"><a href="mailto:${encodeURI(fields.email)}">${escapeHtml(fields.email)}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #5a616b;">Topic</td><td style="padding: 6px 0;">${escapeHtml(fields.subject)}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e3e3df; margin: 20px 0;" />
          <p style="line-height: 1.6; white-space: pre-wrap; margin: 0;">${escapeHtml(fields.message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error('[contact] Resend rejected the message:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[contact] Unexpected failure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
