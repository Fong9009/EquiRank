import { NextRequest, NextResponse } from 'next/server';
import { createContactMessage } from '@/database/contact';
import { checkRateLimit, STRICT_RATE_LIMIT, createRateLimitHeaders } from '@/lib/rateLimiter';

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = checkRateLimit(request, STRICT_RATE_LIMIT);
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { error: STRICT_RATE_LIMIT.message },
        { status: 429 }
      );
      
      // Add rate limit headers
      Object.entries(createRateLimitHeaders(request, STRICT_RATE_LIMIT)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    }

    const body = await request.json();
    const { name, email, subject, message, captchaToken } = body;

    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
          {error: "We're experiencing technical difficulties. Please try again later or contact us directly."}
      );
    }

    if (!captchaToken) {
      return NextResponse.json({ error: "Please complete the reCAPTCHA verification to prove you're human" }, { status: 400 });
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
          {error: "reCAPTCHA verification failed. Please try again."},
          {status: 400}
      );
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields: name, email, subject, and message' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
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
      { error: 'We\'re sorry, but we couldn\'t send your message right now. Please try again in a few moments, or contact us directly if the problem persists.' },
      { status: 500 }
    );
  }
}