import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { assignFunderToLoanRequest } from '@/database/loanRequest';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid loan request ID' }, { status: 400 });
    }

    const body = await request.json();
    const lenderId = parseInt(body?.lenderId);
    if (!lenderId || Number.isNaN(lenderId)) {
      return NextResponse.json({ error: 'Valid lenderId is required' }, { status: 400 });
    }

    const success = await assignFunderToLoanRequest(id, lenderId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to assign funder' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assigning funder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


