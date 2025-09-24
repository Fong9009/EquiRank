import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllCompanies } from '@/database/companyValues';

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
        const companyOwner = searchParams.get('companyOwner');
        const revenueRange = searchParams.get('revenueRange');
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Cap at 100

        const result = await getAllCompanies({
            companyName,
            companyOwner,
            revenueRange: revenueRange === 'all' ? null : revenueRange,
            page,
            limit
        });

        const totalPages = Math.ceil((result.total ?? 0) / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            data: result.companies,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.error('Error fetching available companies:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
