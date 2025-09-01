import { NextRequest, NextResponse } from 'next/server';
import { updateUserPassword } from '@/database/user'; // your DB function
import { auth } from '@/lib/auth'; // your auth/session helper
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
        const { newPassword } = body;

        if (!newPassword) {
            return NextResponse.json({ message: 'Password is required' }, { status: 400 });
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
