import { NextRequest, NextResponse } from 'next/server';
import {updateEmail, updateUserPassword} from '@/database/user';
import { auth } from '@/lib/auth';
import bcrypt from "bcryptjs";

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
        const { newEmail } = body;
        if (!newEmail) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
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