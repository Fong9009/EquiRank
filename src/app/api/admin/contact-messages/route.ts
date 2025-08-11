import { NextRequest, NextResponse } from 'next/server';
import db, { getAllContactMessages, getContactMessagesByStatus } from '@/database/db';
import { RowDataPacket } from 'mysql2';

// GET /api/admin/contact-messages - Get all contact messages (admin only)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    try {
        let query = 'SELECT * FROM contact_messages WHERE archived = FALSE';
        const params: (string | boolean)[] = [];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query<RowDataPacket[]>(query, params);
        
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contact messages' },
            { status: 500 }
        );
    }
}
