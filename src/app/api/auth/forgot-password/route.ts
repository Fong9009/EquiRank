import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/database/user';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';
import {deleteToken, insertToken} from "@/database/password";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    console.log('User lookup result:', user);

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing tokens for this user
    console.log('Deleting existing tokens for user:', user.id);
    await deleteToken(user.id);

    // Insert new token
    console.log('Inserting new token for user:', user.id, 'token:', token, 'expires:', expiresAt);
    const tokenId = await insertToken(user.id, token, expiresAt);
    console.log('Token inserted with ID:', tokenId);

    // Generate reset link
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Send email
    const emailSent = await sendPasswordResetEmail(
      user.email,
      `${user.first_name} ${user.last_name}`,
      resetLink
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, a password reset link has been sent.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
