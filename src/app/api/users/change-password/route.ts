import { NextRequest, NextResponse } from 'next/server';
import { updateUserPassword, getUserPasswordHash } from '@/database/user'; // your DB function
import { auth } from '@/lib/auth'; // your auth/session helper
import { verifyPassword } from '@/lib/security';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
        }

        // Get user's current password hash
        const currentPasswordHash = await getUserPasswordHash(parseInt(session.user.id));
        if (!currentPasswordHash) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isCurrentPasswordValid = await verifyPassword(currentPassword, currentPasswordHash);
        if (!isCurrentPasswordValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const success = await updateUserPassword(hashedPassword, parseInt(session.user.id));
        if (success) {
            return NextResponse.json({ message: 'Password updated successfully' });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
