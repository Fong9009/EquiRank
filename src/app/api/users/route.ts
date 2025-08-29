import { NextRequest, NextResponse } from 'next/server';
import { createUser, emailExists, activeEmailExists, getUserByEmailAny, updateUser } from '@/database/user';
import { hashPassword, validatePassword, validateEmail } from '@/lib/security';
import { checkRateLimit, STRICT_RATE_LIMIT, createRateLimitHeaders } from '@/lib/rateLimiter';

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
    const { email, password, firstName, lastName, userType, company, phone, address, csrfToken, website, captchaToken } = body;

    // Honeypot check - if website field is filled, it's likely a bot
    if (website && website.trim() !== '') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA
    if (!captchaToken) {
      return NextResponse.json(
        { error: 'Please complete the reCAPTCHA verification to prove you\'re human' },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'We\'re experiencing technical difficulties. Please try again later or contact us directly.' },
        { status: 500 }
      );
    }

    // Verify reCAPTCHA with Google
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', captchaToken);

    const verifyRes = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }
    );

    const verifyCaptcha = await verifyRes.json();

    if (!verifyCaptcha.success) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // CSRF token validation
    const headerToken = request.headers.get('X-CSRF-Token');
    if (!csrfToken || !headerToken || csrfToken !== headerToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Input validation
    if (!email || !password || !firstName || !lastName || !userType || !company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Enhanced email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid email address',
          details: emailValidation.errors,
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    // Email uniqueness check among ACTIVE users only
    const emailInActiveUsers = await activeEmailExists(email);
    if (emailInActiveUsers) {
      return NextResponse.json(
        { 
          error: 'Email already registered',
          code: 'EMAIL_EXISTS',
          suggestion: 'Please use a different email address or try logging in instead'
        },
        { status: 409 }
      );
    }

    // If email exists but is inactive, reactivate instead of inserting
    const existsAny = await emailExists(email);
    if (existsAny && !emailInActiveUsers) {
      const hashedPassword = await hashPassword(password);
      const existing = await getUserByEmailAny(email);
      if (!existing) {
        return NextResponse.json(
          { error: 'Unexpected error retrieving existing user for reactivation' },
          { status: 500 }
        );
      }

      const updated = await updateUser(existing.id, {
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        entity_type: 'company', // All users are companies
        company,
        phone,
        address,
        is_active: true,
        is_approved: false,
      });

      if (!updated) {
        return NextResponse.json(
          { error: 'Failed to reactivate existing account' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          message: 'Account reactivated successfully',
          userId: existing.id,
          userType: userType,
          entityType: 'company', // All users are companies
          isApproved: false,
          email
        },
        { status: 200 }
      );
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // User type validation
    if (!['borrower', 'lender', 'admin'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }



    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = await createUser(
      email,
      hashedPassword,
      firstName,
      lastName,
      userType,
      'company', // All users are companies
      company,
      phone,
      address
    );

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId,
        userType,
        entityType: 'company', // All users are companies
        isApproved: false, // New users need admin approval
        email: email // Return email for confirmation
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('User creation error:', error);
    
    // Handle duplicate email error (fallback protection)
    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('email')) {
      return NextResponse.json(
        { 
          error: 'Email already exists',
          code: 'EMAIL_EXISTS',
          suggestion: 'Please use a different email address or try logging in instead'
        },
        { status: 409 }
      );
    }

    // Handle other database constraints
    if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATION') {
      if (error.message.includes('password_hash')) {
        return NextResponse.json(
          { error: 'Password validation failed' },
          { status: 400 }
        );
      }
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Check email availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Enhanced email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { 
          available: false,
          error: 'Invalid email format',
          details: emailValidation.errors,
          code: 'INVALID_FORMAT'
        },
        { status: 200 }
      );
    }

    // Check if email exists among active users
    const emailAlreadyExists = await activeEmailExists(email);
    
    return NextResponse.json({
      available: !emailAlreadyExists,
      email: email,
      message: emailAlreadyExists ? 'Email is already registered' : 'Email is available'
    }, { status: 200 });

  } catch (error) {
    console.error('Email availability check error:', error);
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    );
  }
}
