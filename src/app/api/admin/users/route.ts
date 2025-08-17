import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, getUsersByType, createAdminUser } from '@/database/user';
import { hashPassword } from '@/lib/security';
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
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super admin can create admin users
    if ((session.user as any).isSuperAdmin !== true) {
      return NextResponse.json({ error: 'Forbidden: Super Admin required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const adminId = await createAdminUser(email, passwordHash, firstName, lastName, 'company', undefined, phone);

    return NextResponse.json({ message: 'Admin user created', userId: adminId }, { status: 201 });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
