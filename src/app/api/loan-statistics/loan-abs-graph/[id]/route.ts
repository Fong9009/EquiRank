import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {getCompanyABS} from "@/database/companyValues";
import {getCompanyId} from "@/database/loanRequest";

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

        const companyID = await getCompanyId(id);

        if (!companyID) {
            // Handle the case where no company ID is found
            throw new Error('Company ID not found for this loan request');
            // or return an error response, depending on your context
        }
        const absRatiosRaw = await getCompanyABS(companyID);
        if (!absRatiosRaw) {
            return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
        }

        let absBenchmark;
        try {
            absBenchmark = JSON.parse(absRatiosRaw.abs_benchmark);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid ABS benchmark data format' }, { status: 400 });
        }
        return NextResponse.json(absBenchmark);

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
