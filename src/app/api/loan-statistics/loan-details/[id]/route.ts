import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {getBorrowerId, getCompanyId, getLoanDetails} from "@/database/loanRequest";
import  {getCompanyDetails} from "@/database/companyValues";
import {getUserFullname} from "@/database/user";

//Used for Obtaining Loan Details and Company Details to be displayed for Loan Requests
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
            return NextResponse.json({ error: 'Invalid Loan ID' }, { status: 400 });
        }

        //Obtaining Loan Request Details
        const loanDetails = await getLoanDetails(id);

        if (!loanDetails) {
            return NextResponse.json({ error: 'No Loan Details Data Found' }, { status: 400 });
        }

        //Obtaining all the ID values
        const userId = await getBorrowerId(id);

        console.log(userId);
        if (!userId){
            return NextResponse.json({ error: 'No Borrower ID found' }, { status: 400 });
        }

        const companyId = await getCompanyId(id);
        if(!companyId) {
            return NextResponse.json({error: 'No Company ID Found'}, {status: 400});
        }

        //Obtaining Company Data
        const companyData = await getCompanyDetails(companyId);
        if (!companyData) {
            return NextResponse.json({ error: 'No Company Data Found' }, { status: 400 });
        }

        //Obtaining Borrower Name
        const borrowerName = await getUserFullname(userId);

        if(!borrowerName){
            return NextResponse.json({ error: 'No Borrower Name Found' }, { status: 400 });
        }

        const { company_name, industry, revenue_range } = companyData;

        const {amount_requested, currency, loan_purpose, loan_type} = loanDetails;

        const responseData = {
            borrowerName,
            amount_requested,
            currency,
            loan_purpose,
            loan_type: loan_type.charAt(0).toUpperCase() + loan_type.slice(1),
            company_name,
            industry,
            revenue_range,
        };

        return NextResponse.json(responseData, { status: 200 });


    } catch (error) {
        console.error('Error fetching loan request:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
