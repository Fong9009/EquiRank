import { NextRequest, NextResponse } from 'next/server';
import { markToken, verifyToken } from '@/database/password';
import { updateUserPassword, clearFailedLoginAttempt } from '@/database/user';
import { validatePassword, hashPassword } from '@/lib/security';
import { checkRateLimit, STRICT_RATE_LIMIT } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limit 
    const { allowed, remaining, resetTime } = checkRateLimit(request, STRICT_RATE_LIMIT);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests from this IP, please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': STRICT_RATE_LIMIT.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
            'Retry-After': Math.max(0, Math.ceil((resetTime - Date.now()) / 1000)).toString(),
          },
        }
      );
    }

    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid password', details: validation.errors },
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
    const hashedPassword = await hashPassword(newPassword);

    await updateUserPassword(hashedPassword, resetToken.user_id);
    await markToken(resetToken.id);

    // Clear failed login attempts and unlock account if it was locked
    await clearFailedLoginAttempt(resetToken.user_id);

    return new NextResponse(
      JSON.stringify({ message: 'Password has been reset successfully. You can now login with your new password.' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': STRICT_RATE_LIMIT.max.toString(),
          'X-RateLimit-Remaining': Math.max(0, remaining - 1).toString(),
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
      );
  }
}
