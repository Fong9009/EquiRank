import { NextRequest, NextResponse } from 'next/server';
import { createContactMessage } from '@/database/db';

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, captchaToken } = body;

    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
          {error: "Missing reCAPTCHA Cannot Verify"}
      );
    }

    /*Recaptcha Verification*/
    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append('response', captchaToken);

    const verifyRes = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: "POST",
          headers: {"Content-Type": "application/x-www-form-urlencoded"},
          body: params.toString(),
        }
    );

    const verifyCaptcha = await verifyRes.json();

    if(!verifyCaptcha.success) {
      return NextResponse.json(
          {error: "Invalid captcha"},
          {status: 400}
      );
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, subject, message' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Store the contact message
    const messageId = await createContactMessage(name, email, subject, message);

    return NextResponse.json(
      {
        message: 'Contact message submitted successfully',
        messageId: messageId
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact message' },
      { status: 500 }
    );
  }
}
