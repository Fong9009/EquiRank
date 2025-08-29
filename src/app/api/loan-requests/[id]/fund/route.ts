import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLoanRequestById, updateLoanRequest } from '@/database/loanRequest';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.userType !== 'lender') {
      return NextResponse.json({ error: 'Only lenders can fund loan requests' }, { status: 403 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid loan request ID' }, { status: 400 });
    }

    const body = await request.json();
    const { lender_id, funded_amount, currency } = body;

    // Validate required fields
    if (!lender_id || !funded_amount || !currency) {
      return NextResponse.json({ 
        error: 'Missing required fields: lender_id, funded_amount, currency' 
      }, { status: 400 });
    }

    // Validate amount
    if (funded_amount <= 0) {
      return NextResponse.json({ error: 'Funded amount must be greater than 0' }, { status: 400 });
    }

    // Get the loan request
    const loanRequest = await getLoanRequestById(id);
    
    if (!loanRequest) {
      return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
    }

    // Check if loan request is available for funding
    if (loanRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Loan request is not available for funding' 
      }, { status: 400 });
    }

    // Check if the funded amount matches the requested amount
    if (funded_amount !== loanRequest.amount_requested) {
      return NextResponse.json({ 
        error: 'Funded amount must match the requested amount' 
      }, { status: 400 });
    }

    // Check if the currency matches
    if (currency !== loanRequest.currency) {
      return NextResponse.json({ 
        error: 'Currency must match the requested currency' 
      }, { status: 400 });
    }

    // Update the loan request status to funded
    const updateResult = await updateLoanRequest(id, {
      status: 'funded',
      // You could add additional fields here like:
      // funded_at: new Date(),
      // lender_id: lender_id,
      // funded_amount: funded_amount
    });

    if (!updateResult) {
      return NextResponse.json({ error: 'Failed to update loan request' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Loan request funded successfully',
      loanRequestId: id
    }, { status: 200 });

  } catch (error) {
    console.error('Error funding loan request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
