import { NextRequest, NextResponse } from 'next/server';
import { approveUser, rejectUser, getUserById } from '@/database/db';
import { sendAccountApprovalEmail, sendAccountRejectionEmail } from '@/lib/email';

// POST /api/admin/approve - Approve or reject a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, reason } = body;

    // Validate required fields
    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, userId' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: approve or reject' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let success: boolean;
    let message: string;
    let emailSent = false;

    if (action === 'approve') {
      success = await approveUser(userId);
      message = 'User approved successfully';
      
      // Send approval email
      if (success) {
        emailSent = await sendAccountApprovalEmail(
          user.email, 
          `${user.first_name} ${user.last_name}`
        );
      }
    } else {
      success = await rejectUser(userId);
      message = 'User rejected successfully';
      
      // Send rejection email
      if (success) {
        emailSent = await sendAccountRejectionEmail(
          user.email, 
          `${user.first_name} ${user.last_name}`,
          reason
        );
      }
    }

    if (success) {
      return NextResponse.json(
        { 
          message,
          emailSent: emailSent ? 'Email notification sent' : 'Email notification failed'
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}
