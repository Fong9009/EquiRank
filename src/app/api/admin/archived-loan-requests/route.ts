import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getArchivedLoanRequests } from '@/database/loanRequest';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Get archived loan requests
    const archivedRequests = await getArchivedLoanRequests();
    
    return NextResponse.json(archivedRequests);

  } catch (error) {
    console.error('Error fetching archived loan requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
