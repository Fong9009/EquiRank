import { NextRequest, NextResponse } from 'next/server';
import { getFundedLoansByLender } from '@/database/loanRequest';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is a lender
        if (session.user.userType !== 'lender') {
            return NextResponse.json(
                { error: 'Access denied. Only lenders can view funded loans.' },
                { status: 403 }
            );
        }

        const lenderId = parseInt(session.user.id);
        
        // Get funded loans for this lender
        const fundedLoans = await getFundedLoansByLender(lenderId);
        
        return NextResponse.json(fundedLoans, { status: 200 });
    } catch (error) {
        console.error('Error fetching funded loans:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
