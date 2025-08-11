import db from '@/database/db';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

interface Params {
    params: {
        conversationId: string;
    };
}

export async function PATCH(request: NextRequest, { params }: Params) {
    const { conversationId } = params;
    const body = await request.json().catch(() => ({}));
    const shouldBeArchived = body.archived;

    if (!conversationId) {
        return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }
    
    if (typeof shouldBeArchived !== 'boolean') {
        return NextResponse.json({ error: 'Invalid "archived" flag provided.' }, { status: 400 });
    }

    try {
        const [messages] = await db.query<RowDataPacket[]>(
            'SELECT id FROM contact_messages WHERE conversation_id = ?',
            [conversationId]
        );

        if (messages.length === 0) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const [result] = await db.query<any>(
            'UPDATE contact_messages SET archived = ? WHERE conversation_id = ?',
            [shouldBeArchived, conversationId]
        );

        if (result.affectedRows > 0) {
            const action = shouldBeArchived ? 'archived' : 'restored';
            return NextResponse.json({ message: `Conversation ${action} successfully.` });
        } else {
            return NextResponse.json({ error: 'No messages were updated.' }, { status: 404 });
        }
    } catch (error) {
        console.error('Failed to update conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
