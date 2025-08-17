import { NextRequest, NextResponse } from 'next/server';
import { createUser, emailExists, activeEmailExists, getUserByEmailAny, updateUser } from '@/database/user';
import { hashPassword, validatePassword, validateEmail } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, userType, entityType, company, phone, address } = body;

    // Input validation
    if (!email || !password || !firstName || !lastName || !userType || !entityType) {
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
        entity_type: entityType,
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
          entityType: entityType,
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

    // Entity type validation
    if (!['company', 'individual'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity type' },
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
      entityType,
      company,
      phone,
      address
    );

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId,
        userType,
        entityType,
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
