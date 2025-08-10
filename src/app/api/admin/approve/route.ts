import { NextRequest, NextResponse } from 'next/server';
import { approveUser, rejectUser, getUserById } from '@/database/db';

// POST /api/admin/approve - Approve or reject a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;

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

    if (action === 'approve') {
      success = await approveUser(userId);
      message = 'User approved successfully';
    } else {
      success = await rejectUser(userId);
      message = 'User rejected successfully';
    }

    if (success) {
      return NextResponse.json(
        { message },
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
