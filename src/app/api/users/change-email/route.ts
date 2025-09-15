import { NextRequest, NextResponse } from 'next/server';
import {updateEmail, getUserEmail} from '@/database/user';
import { auth } from '@/lib/auth';

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
        const { currentEmail, newEmail } = body;
        
        if (!currentEmail || !newEmail) {
            return NextResponse.json({ error: 'Current email and new email are required' }, { status: 400 });
        }

        // Get user's current email
        const userCurrentEmail = await getUserEmail(parseInt(session.user.id));
        if (!userCurrentEmail) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current email matches
        if (currentEmail.toLowerCase() !== userCurrentEmail.toLowerCase()) {
            return NextResponse.json({ error: 'Current email is incorrect' }, { status: 400 });
        }

        const success = await updateEmail(newEmail, parseInt(session.user.id));
        if (success) {
            return NextResponse.json({ message: 'Email updated successfully' });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}