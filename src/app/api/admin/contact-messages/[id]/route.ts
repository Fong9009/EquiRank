import { NextRequest, NextResponse } from 'next/server';
import { getContactMessageById, updateContactMessageStatus, deleteContactMessage, createAdminReply } from '@/database/contact';
import { sendAdminReplyEmail } from '@/lib/email';

// GET /api/admin/contact-messages/[id] - Get a specific contact message
export async function GET(
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

    const message = await getContactMessageById(messageId);
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

// POST /api/admin/contact-messages/[id] - Reply to a contact message
export async function POST(
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
    const { adminReply, adminName } = body;

    if (!adminReply || !adminName) {
      return NextResponse.json(
        { error: 'Missing required fields: adminReply, adminName' },
        { status: 400 }
      );
    }

    // Get the original message
    const message = await getContactMessageById(messageId);
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Disallow replies to closed messages
    if (message.status === 'closed') {
      return NextResponse.json(
        { error: 'Cannot reply to a closed conversation' },
        { status: 400 }
      );
    }

    // Create admin reply in conversation thread
    const adminReplyId = await createAdminReply(
      message.conversation_id,
      adminName,
      'admin@equirank.com', // Admin email
      `Re: ${message.subject}`,
      adminReply,
      messageId
    );

    // Send email reply
    const emailSent = await sendAdminReplyEmail(
      message.email,
      message.name,
      adminReply,
      message.subject,
      message.message
    );

    // Update original message status to 'replied'
    const updateSuccess = await updateContactMessageStatus(messageId, 'replied');

    if (emailSent && updateSuccess) {
      return NextResponse.json({
        message: 'Reply sent successfully',
        emailSent: true
      });
    } else if (!emailSent) {
      return NextResponse.json({
        message: 'Reply sent but email delivery failed',
        emailSent: false
      });
    } else {
      return NextResponse.json({
        message: 'Email sent but failed to update message status',
        emailSent: true
      });
    }

  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    );
  }
}

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
