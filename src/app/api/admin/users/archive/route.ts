import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { archiveUser, getUserByIdAny } from '@/database/user';

// PATCH body: { userId: number, archived: boolean }
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).userType !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, archived } = await request.json();
    if (!userId || typeof archived !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Load target user and current user
    const target = await getUserByIdAny(userId);
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isSelf = String(userId) === String((session.user as any).id);
    const currentIsSuper = (session.user as any).isSuperAdmin === true;
    const targetIsAdmin = target.user_type === 'admin';
    const targetIsSuper = Boolean((target as any).is_super_admin);

    // Rules:
    // - No one can archive themselves
    if (isSelf) return NextResponse.json({ error: 'You cannot archive your own account' }, { status: 403 });
    // - Only super admin can archive admin accounts
    if (targetIsAdmin && !currentIsSuper) {
      return NextResponse.json({ error: 'Only Super Admin can archive admin accounts' }, { status: 403 });
    }
    if (targetIsSuper) {
      return NextResponse.json({ error: 'Super Admin accounts cannot be archived' }, { status: 403 });
    }

    const ok = await archiveUser(userId, archived);
    if (!ok) return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
    return NextResponse.json({ message: archived ? 'User archived' : 'User restored' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update user archive status' }, { status: 500 });
  }
}


