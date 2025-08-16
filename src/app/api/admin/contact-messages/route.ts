import { NextRequest, NextResponse } from 'next/server';
import { getMessageStatus } from '@/database/contact';

// GET /api/admin/contact-messages - Get all contact messages that are not archived (admin only)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;

    try {
        const rows = await getMessageStatus(status);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contact messages' },
            { status: 500 }
        );
    }
}
