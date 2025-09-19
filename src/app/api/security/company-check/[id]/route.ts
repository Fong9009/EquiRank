import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { companyCheck } from '@/database/companyValues';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.userType !== 'lender') {
            return NextResponse.json({ error: 'Only lenders can view companies' }, { status: 403 });
        }

        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid Company ID' }, { status: 400 });
        }

        const companyExistance = await companyCheck(id);
        if(!companyExistance) {
            return NextResponse.json(false);
        } else {
            return NextResponse.json(true);
        }


    } catch (error) {
        console.error('Error fetching companies', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
