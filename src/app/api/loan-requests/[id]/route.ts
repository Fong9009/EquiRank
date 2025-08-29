import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLoanRequestById } from '@/database/loanRequest';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only lenders and admins can view loan request details
    if (session.user.userType !== 'lender' && session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid loan request ID' }, { status: 400 });
    }

    const loanRequest = await getLoanRequestById(id);
    
    if (!loanRequest) {
      return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
    }

    // For lenders, only show active/pending requests
    if (session.user.userType === 'lender' && !['pending', 'active'].includes(loanRequest.status)) {
      return NextResponse.json({ error: 'Loan request not available for funding' }, { status: 403 });
    }

    return NextResponse.json(loanRequest);

  } catch (error) {
    console.error('Error fetching loan request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
