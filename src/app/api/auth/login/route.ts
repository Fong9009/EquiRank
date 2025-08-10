import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/database/db';

// POST /api/auth/login - User login with approval check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
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

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account has been deactivated. Please contact support.' },
        { status: 401 }
      );
    }

    // Check if user is approved (except for admins)
    if (user.user_type !== 'admin' && !user.is_approved) {
      return NextResponse.json(
        { error: 'Your account is pending admin approval. You will receive an email once approved.' },
        { status: 401 }
      );
    }

    // Check password (TODO: implement proper password hashing)
    if (user.password_hash !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Login successful
    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
          entityType: user.entity_type,
          company: user.company
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Failed to process login' },
      { status: 500 }
    );
  }
}
