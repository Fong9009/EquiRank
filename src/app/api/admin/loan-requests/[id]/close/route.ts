import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLoanRequestById, closeLoanRequest } from '@/database/loanRequest';

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
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid loan request ID' }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    // Get the loan request to check if it exists and can be closed
    const loanRequest = await getLoanRequestById(id);
    if (!loanRequest) {
      return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
    }

    // Check if the request can be closed (only funded requests)
    if (loanRequest.status !== 'funded') {
      return NextResponse.json({ 
        error: 'Only funded loan requests can be closed' 
      }, { status: 400 });
    }

    // Close the loan request
    const success = await closeLoanRequest(id, parseInt(session.user.id), reason);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Loan request closed successfully' 
      });
    } else {
      return NextResponse.json({ error: 'Failed to close loan request' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error closing loan request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
