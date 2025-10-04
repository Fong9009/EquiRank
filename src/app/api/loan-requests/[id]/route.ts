import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLoanRequestById,deleteLoanRequest, updateLoanRequest } from '@/database/loanRequest';
import { computeCompanyRisk } from '@/lib/risk';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid loan request ID' }, { status: 400 });
    }

    const loanRequest = await getLoanRequestById(id);
    console.log("LOAN_REQUEST", loanRequest);
    if (!loanRequest) {
      return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
    }

    // Access control logic
    if (session.user.userType === 'borrower') {
      // Borrowers can only view their own requests
      if (loanRequest.borrower_id !== parseInt(session.user.id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (session.user.userType === 'lender') {
      // Lenders can view pending requests or their own funded requests
      if (loanRequest.status === 'pending') {
        // Allow viewing pending requests for funding consideration
      } else if (loanRequest.status === 'funded' && loanRequest.funded_by === parseInt(session.user.id)) {
        // Allow lenders to view their own funded requests
      } else {
        return NextResponse.json({ error: 'Loan request not available for funding' }, { status: 403 });
      }
    } else if (session.user.userType !== 'admin') {
      // Only borrowers, lenders, and admins can access
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    let risk: any = null;
    const companyId = (loanRequest as any).company_id as number | undefined;
    if (companyId) {
      try { risk = await computeCompanyRisk(companyId); } catch {}
    }

    return NextResponse.json({ ...loanRequest, risk });

  } catch (error) {
    console.error('Error fetching loan request:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check if it's a database connection error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Database error code:', (error as any).code);
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid loan request ID' }, { status: 400 });
    }

    // Get the existing loan request
    const existingRequest = await getLoanRequestById(id);
    if (!existingRequest) {
      return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
    }

    // Access control: only borrowers can edit their own pending requests
    if (session.user.userType === 'borrower') {
      if (existingRequest.borrower_id !== parseInt(session.user.id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      if (existingRequest.status !== 'pending') {
        return NextResponse.json({ error: 'Only pending requests can be edited' }, { status: 400 });
      }
    } else if (session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
        amount_requested,
        currency,
        company_description,
        loan_purpose,
        loan_type,
        other_loan_type,
        expires_at
    } = body;

    // Validate required fields
    if (!amount_requested || !currency || !loan_purpose || !loan_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: amount_requested, currency, loan_purpose, loan_type' 
      }, { status: 400 });
    }

    // Validate amount
    if (amount_requested <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'];
    if (!validCurrencies.includes(currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    // Validate loan type
    const validLoanTypes = ['equipment', 'expansion', 'working_capital', 'inventory', 'real_estate', 'startup', 'other'];
    if (!validLoanTypes.includes(loan_type)) {
      return NextResponse.json({ error: 'Invalid loan type' }, { status: 400 });
    }

    console.log("Test")
    // Update loan request
    const updateData = {
      amount_requested: parseFloat(amount_requested),
      currency,
      company_description,
      loan_purpose,
      loan_type: loan_type === 'other' ? other_loan_type : loan_type,
      expires_at: expires_at ? new Date(expires_at) : undefined
    };

    const success = await updateLoanRequest(id, updateData);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Loan request updated successfully' 
      });
    } else {
      return NextResponse.json({ error: 'Failed to update loan request' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error updating loan request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid loan request ID' }, { status: 400 });
    }

    // Get the existing loan request
    const existingRequest = await getLoanRequestById(id);
    if (!existingRequest) {
      return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
    }

    // Access control: only borrowers can delete their own pending or closed requests
    if (session.user.userType === 'borrower') {
      if (existingRequest.borrower_id !== parseInt(session.user.id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      if (!['pending', 'closed'].includes(existingRequest.status)) {
        return NextResponse.json({ error: 'Only pending or closed requests can be deleted' }, { status: 400 });
      }
    } else if (session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const success = await deleteLoanRequest(id);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Loan request deleted successfully' 
      });
    } else {
      return NextResponse.json({ error: 'Failed to delete loan request' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error deleting loan request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
