import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllLoanRequests } from '@/database/loanRequest';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Get all loan requests for admin view
    const loanRequests = await getAllLoanRequests();
    
    return NextResponse.json(loanRequests);

  } catch (error) {
    console.error('Error fetching loan requests for admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
