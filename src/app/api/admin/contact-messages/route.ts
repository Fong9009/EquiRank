import { NextRequest, NextResponse } from 'next/server';
import { getAllContactMessages, getContactMessagesByStatus } from '@/database/db';

// GET /api/admin/contact-messages - Get all contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'new' | 'read' | 'replied' | null;

    let messages;
    if (status && ['new', 'read', 'replied'].includes(status)) {
      messages = await getContactMessagesByStatus(status);
    } else {
      messages = await getAllContactMessages();
    }

    return NextResponse.json(messages, { status: 200 });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}
