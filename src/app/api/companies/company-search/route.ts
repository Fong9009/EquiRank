import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {getAllCompanies, getCompanySearch} from '@/database/companyValues';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.userType !== 'lender') {
            return NextResponse.json({ error: 'Only lenders can view companies' }, { status: 403 });
        }

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const companyName = searchParams.get('companyName');

        const result = await getCompanySearch({
            companyName
        });

        return NextResponse.json({
            data: result.companies,
        });

    } catch (error) {
        console.error('Error fetching available companies:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
