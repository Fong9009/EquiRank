import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailId } from '@/database/user';

export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get('email');
    const editUserId = req.nextUrl.searchParams.get('editUserId'); // the ID of the user being edited

    if (!email) return NextResponse.json({ available: false });

    const user = await getUserByEmailId(email);

    let available = false;

    if (!user) {
        // No user with this email exists
        available = true;
    } else if (editUserId && user.id === parseInt(editUserId)) {
        // The email belongs to the user we are editing
        available = true;
    } else {
        // The email exists and belongs to another user
        available = false;
    }

    return NextResponse.json({ available });
}