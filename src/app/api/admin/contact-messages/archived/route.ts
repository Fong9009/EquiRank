import { NextRequest, NextResponse } from 'next/server';
import { getAllArchivedMessages } from '@/database/contact';
import { auth } from '@/lib/auth';

// GET /api/admin/contact-messages - Get all archived Contact Messages (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user || session.user.userType !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const rows = await getAllArchivedMessages();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching archived contact messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contact messages' },
            { status: 500 }
        );
    }
}