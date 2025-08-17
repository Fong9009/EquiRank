import { NextRequest, NextResponse } from 'next/server';
import { getPendingApprovals } from '@/database/user';
import { auth } from '@/lib/auth';

// GET /api/admin/users/approval - Get users pending approval (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user || session.user.userType !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only count users that are not approved AND still active (i.e., not rejected), and not admins
        const rows = await getPendingApprovals();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}