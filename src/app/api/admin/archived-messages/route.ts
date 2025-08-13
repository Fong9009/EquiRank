import { getAllArchivedMessages} from '@/database/contact';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

// GET /api/admin/archived-messages - Get all archived contact messages
export async function GET(request: NextRequest) {
    try {
        const rows = await getAllArchivedMessages();

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching archived messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch archived messages' },
            { status: 500 }
        );
    }
}
