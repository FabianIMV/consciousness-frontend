import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const RECIPIENT = 'contact@consciousnessnetworks.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: 'Consciousness Networks <onboarding@resend.dev>',
      to: [RECIPIENT],
      replyTo: email,
      subject: `[Contact] ${subject} — ${name}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1F2937; font-size: 20px; margin-bottom: 16px;">New contact form submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6B7280; width: 100px;">Name</td><td style="padding: 8px 0; color: #1F2937;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280;">Email</td><td style="padding: 8px 0; color: #1F2937;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280;">Topic</td><td style="padding: 8px 0; color: #1F2937;">${subject}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="color: #4B5563; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Contact route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
