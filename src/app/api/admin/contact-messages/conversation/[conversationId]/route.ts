import {getContactMessageId, updateContactMessageArchive, deleteContactViaConversationId} from '@/database/contact';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

interface Params {
    params: {
        conversationId: string;
    };
}

export async function PATCH(request: NextRequest, { params }: Params) {
    const awaitedParams = await params;
    const { conversationId } = awaitedParams;
    const body = await request.json().catch(() => ({}));
    const shouldBeArchived = body.archived;

    if (!conversationId) {
        return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }
    if (typeof shouldBeArchived !== 'boolean') {
        return NextResponse.json({ error: 'Invalid "archived" flag provided.'}, { status: 400 });
    }

    try {
        const message = await getContactMessageId(conversationId);

        if (message === null) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const result = await updateContactMessageArchive(shouldBeArchived, conversationId);
        if (result) {
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

export async function DELETE(request: NextRequest, { params }: Params) {
    const awaitedParams = await params;
    const { conversationId } = awaitedParams;

    try {
        const success = await deleteContactViaConversationId(conversationId);

        if (success) {
            return NextResponse.json({message: `Message successfully Deleted`}, {status: 200});
        } else {
            return NextResponse.json({message: 'Message Not Found For Deletion'}, {status: 404})
        }
    } catch (error) {
        console.error('Failed to delete message:', error);
        return NextResponse.json({message: 'Internal Server Issue'}, {status: 500})
    }
}