import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveLoanRequests } from '@/database/loanRequest';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.userType !== 'lender') {
      return NextResponse.json({ error: 'Only lenders can view available loan requests' }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const loanType = searchParams.get('loanType');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    // Get all active loan requests
    let loanRequests = await getActiveLoanRequests();

    // Apply filters
    if (status && status !== 'all') {
      loanRequests = loanRequests.filter(req => req.status === status);
    }

    if (loanType && loanType !== 'all') {
      loanRequests = loanRequests.filter(req => req.loan_type === loanType);
    }

    if (minAmount) {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) {
        loanRequests = loanRequests.filter(req => req.amount_requested >= min);
      }
    }

    if (maxAmount) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) {
        loanRequests = loanRequests.filter(req => req.amount_requested <= max);
      }
    }

    // Sort by creation date (newest first)
    loanRequests.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(loanRequests);

  } catch (error) {
    console.error('Error fetching available loan requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
