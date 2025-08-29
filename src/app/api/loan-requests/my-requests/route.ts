import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLoanRequestsByBorrower } from '@/database/loanRequest';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.userType !== 'borrower') {
      return NextResponse.json({ error: 'Only borrowers can view their loan requests' }, { status: 403 });
    }

    const loanRequests = await getLoanRequestsByBorrower(parseInt(session.user.id));
    
    return NextResponse.json(loanRequests);

  } catch (error) {
    console.error('Error fetching borrower loan requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
