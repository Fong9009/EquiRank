import { NextRequest, NextResponse } from 'next/server';
import { getLoanCountById } from "@/database/loanRequest";
import { auth } from '@/lib/auth';
import {getBorrowerID} from "@/database/profile";
import { getBorrowerCompaniesCount} from "@/database/companyValues";

// GET /api/admin/users/approval - Get users pending approval (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user || session.user.userType !== 'borrower') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        //Obtains the borrowerID
        const userId = parseInt(session.user.id);
        const borrowerID = await getBorrowerID(userId);
        if(!borrowerID) {
            return NextResponse.json({ error: 'Borrower Profile Not Found' }, { status: 404 });
        }


        // Counts the Loan Requests made by the Borrower
        const loanCount = await getLoanCountById(userId);
        const companyCount = await getBorrowerCompaniesCount(borrowerID.id);
        console.log("LoanCount",loanCount);
        console.log("Company Count", companyCount);
        return NextResponse.json(loanCount);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}