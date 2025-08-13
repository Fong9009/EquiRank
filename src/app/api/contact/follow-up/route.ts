import { NextRequest, NextResponse } from 'next/server';
import { getConversationThread, createContactMessage } from '@/database/contact';
import { sendFollowUpEmail } from '@/lib/email';

// POST /api/contact/follow-up - User follows up on existing conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, name, email, message } = body;

    if (!conversationId || !name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, name, email, message' },
        { status: 400 }
      );
    }

    // Verify the conversation exists
    const conversation = await getConversationThread(conversationId);
    if (!conversation || conversation.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get the original subject from the first message
    const originalSubject = conversation[0].subject;

    // Create follow-up message in the same conversation
    const followUpId = await createContactMessage(
      name,
      email,
      `Re: ${originalSubject}`,
      message
    );

    // Send notification email to admin about the follow-up
    const emailSent = await sendFollowUpEmail(
      conversationId,
      name,
      email,
      message,
      originalSubject
    );

    if (followUpId) {
      return NextResponse.json({
        message: 'Follow-up message sent successfully',
        followUpId,
        emailSent
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create follow-up message' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending follow-up:', error);
    return NextResponse.json(
      { error: 'Failed to send follow-up message' },
      { status: 500 }
    );
  }
}
