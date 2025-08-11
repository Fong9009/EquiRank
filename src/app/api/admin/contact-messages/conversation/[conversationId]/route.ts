import { db } from '@/database/db';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

interface Params {
    params: {
        conversationId: string;
    };
}

// Function to delete an entire conversation thread
export async function DELETE(request: NextRequest, { params }: Params) {
    const { conversationId } = params;

    if (!conversationId) {
        return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    try {
        // First, check if the conversation exists
        const [messages] = await db.query<RowDataPacket[]>(
            'SELECT id FROM contact_messages WHERE conversation_id = ?',
            [conversationId]
        );

        if (messages.length === 0) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Delete all messages in the conversation
        const [result] = await db.query<any>(
            'DELETE FROM contact_messages WHERE conversation_id = ?',
            [conversationId]
        );

        if (result.affectedRows > 0) {
            return NextResponse.json({ message: `Conversation deleted successfully. ${result.affectedRows} messages removed.` });
        } else {
            return NextResponse.json({ error: 'No messages were deleted. The conversation might have already been removed.' }, { status: 404 });
        }
    } catch (error) {
        console.error('Failed to delete conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
