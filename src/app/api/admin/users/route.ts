import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, getUsersByType } from '@/database/user';
import { auth } from '@/lib/auth';

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if ((session.user as any).userType !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('type');

    let users;
    if (userType && ['borrower', 'lender', 'admin'].includes(userType)) {
      users = await getUsersByType(userType as any);
    } else {
      users = await getAllUsers();
    }

    // Remove password hashes from response for security
    const safeUsers = users.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json(safeUsers, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST not allowed for this endpoint
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
