import { NextResponse } from 'next/server';
import { getPendingApprovals } from '@/database/user';

// GET /api/admin/pending - Get users pending approval
export async function GET() {
  try {
    const pendingUsers = await getPendingApprovals();
    
    // Remove password hashes from response for security
    const safeUsers = pendingUsers.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });
    
    return NextResponse.json(safeUsers, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending approvals' },
      { status: 500 }
    );
  }
}
