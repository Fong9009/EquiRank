import { NextRequest, NextResponse } from 'next/server';
import {markToken, verifyToken} from '@/database/password';
import { updateUserPassword, clearFailedLoginAttempt } from '@/database/user';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 12 characters long' },
        { status: 400 }
      );
    }

    // Check if token exists and is valid
    const tokenInQuestion = await verifyToken(token);

    if (!tokenInQuestion) {
      return NextResponse.json(
          {error: 'Invalid or expired reset token'},
          {status: 400}
      );
    }

    const resetToken = tokenInQuestion as any;

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await updateUserPassword(hashedPassword, resetToken.user_id);
    await markToken(resetToken.id);

    // Clear failed login attempts and unlock account if it was locked
    await clearFailedLoginAttempt(resetToken.user_id);

    return NextResponse.json(
      { message: 'Password has been reset successfully. You can now login with your new password.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
      );
  }
}
