import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteUserById, getUserByIdAny } from '@/database/user';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).userType !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });

    const target = await getUserByIdAny(userId);
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isSelf = String(userId) === String((session.user as any).id);
    const currentIsSuper = (session.user as any).isSuperAdmin === true;
    const targetIsAdmin = target.user_type === 'admin';
    const targetIsSuper = Boolean((target as any).is_super_admin);

    // No one can delete themselves
    if (isSelf) return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 403 });
    // Only super admin can delete admin accounts
    if (targetIsAdmin && !currentIsSuper) {
      return NextResponse.json({ error: 'Only Super Admin can delete admin accounts' }, { status: 403 });
    }
    if (targetIsSuper) {
      return NextResponse.json({ error: 'Super Admin accounts cannot be deleted' }, { status: 403 });
    }

    const ok = await deleteUserById(userId);
    if (!ok) return NextResponse.json({ error: 'User not found or delete failed' }, { status: 404 });
    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}


