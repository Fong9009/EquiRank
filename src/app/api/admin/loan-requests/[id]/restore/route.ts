import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLoanRequestById, restoreLoanRequest } from '@/database/loanRequest';

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

    // Get the loan request to check if it exists and can be restored
    const loanRequest = await getLoanRequestById(id);
    if (!loanRequest) {
      return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
    }

    // Check if the request can be restored (only closed requests)
    if (loanRequest.status !== 'closed') {
      return NextResponse.json({ 
        error: 'Only closed loan requests can be restored' 
      }, { status: 400 });
    }

    // Restore the loan request
    const success = await restoreLoanRequest(id);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Loan request restored successfully' 
      });
    } else {
      return NextResponse.json({ error: 'Failed to restore loan request' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error restoring loan request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
