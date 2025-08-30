import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createLoanRequest } from '@/database/loanRequest';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.userType !== 'borrower') {
      return NextResponse.json({ error: 'Only borrowers can create loan requests' }, { status: 403 });
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

    // If loan type is 'other', validate that other_loan_type is provided
    if (loan_type === 'other' && !other_loan_type) {
      return NextResponse.json({ 
        error: 'Please specify the loan type when selecting "other"' 
      }, { status: 400 });
    }

    // If loan type is 'other', validate that other_loan_type is not too long
    if (loan_type === 'other' && other_loan_type && other_loan_type.length > 50) {
      return NextResponse.json({ 
        error: 'Custom loan type must be 50 characters or less' 
      }, { status: 400 });
    }

    // Create loan request
    const loanRequestData = {
      borrower_id: parseInt(session.user.id),
      amount_requested: parseFloat(amount_requested),
      currency,
      company_description,
      loan_purpose,
      loan_type: loan_type === 'other' ? other_loan_type : loan_type,
      status: 'pending' as const,
      expires_at: expires_at ? new Date(expires_at) : undefined
    };

    console.log('Creating loan request with data:', loanRequestData);
    
    const loanRequestId = await createLoanRequest(loanRequestData);
    
    console.log('Loan request creation result:', loanRequestId);

    if (loanRequestId) {
      return NextResponse.json({ 
        success: true, 
        message: 'Loan request created successfully',
        loanRequestId 
      }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create loan request' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating loan request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can see all loan requests
    if (session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // For now, return empty array until we implement getAllLoanRequests
    return NextResponse.json([]);

  } catch (error) {
    console.error('Error fetching loan requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
