import { NextRequest, NextResponse } from 'next/server';
import { updateContactMessageStatus, deleteContactMessage } from '@/database/db';

// PATCH /api/admin/contact-messages/[id] - Update contact message status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messageId = parseInt(id);
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['new', 'read', 'replied'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be new, read, or replied' },
        { status: 400 }
      );
    }

    const success = await updateContactMessageStatus(messageId, status);
    if (!success) {
      return NextResponse.json(
        { error: 'Message not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Contact message status updated successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating contact message status:', error);
    return NextResponse.json(
      { error: 'Failed to update contact message status' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contact-messages/[id] - Delete contact message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messageId = parseInt(id);
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const success = await deleteContactMessage(messageId);
    if (!success) {
      return NextResponse.json(
        { error: 'Message not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Contact message deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact message' },
      { status: 500 }
    );
  }
}
