import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {getCompanyDetails, getBorrowerProfileId} from "@/database/companyValues";
import {getUserIdBorrower} from "@/database/profile";
import {getUserFullname} from "@/database/user";

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
            return NextResponse.json({ error: 'Invalid Company ID' }, { status: 400 });
        }

        //Getting Company Details
        const companyData = await getCompanyDetails(id);

        if(!companyData) {
            return NextResponse.json({ error: 'No Company Details Found' }, { status: 400 });
        }

        //Obtain Borrower Name
        const borrowerProfileId = await getBorrowerProfileId(id);

        if (!borrowerProfileId) {
            return NextResponse.json({ error: 'Borrower ID not found' }, { status: 400 });
        }

        const userId = await getUserIdBorrower(borrowerProfileId);

        if (!userId) {
            return NextResponse.json({ error: 'User ID Could not be found' }, { status: 400 });
        }

        const borrowerName = await getUserFullname(userId);

        if(!borrowerName){
            return NextResponse.json({ error: 'No Borrower Name Found' }, { status: 400 });
        }


        const { company_name, industry, company_description, company_instagram, company_facebook, revenue_range } = companyData;


        const responseData = {
            borrowerName,
            company_name,
            industry,
            company_description,
            company_instagram,
            company_facebook,
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
