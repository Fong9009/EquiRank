import { NextRequest, NextResponse } from 'next/server';
import { getFundedLoansByLender } from '@/database/loanRequest';
import { computeCompanyRisk } from '@/lib/risk';
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
        // Enrich with risk
        async function mapWithConcurrency<T, U>(items: T[], limit: number, mapper: (item: T, index: number) => Promise<U>): Promise<U[]> {
            const results: U[] = new Array(items.length) as any;
            let idx = 0;
            async function worker() {
                while (idx < items.length) {
                    const current = idx++;
                    results[current] = await mapper(items[current], current);
                }
            }
            const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
            await Promise.all(workers);
            return results;
        }

        const enriched = await mapWithConcurrency(fundedLoans as any[], 5, async (loan: any) => {
            const companyId = loan.company_id as number | undefined;
            if (!companyId) return loan;
            try {
                const risk = await computeCompanyRisk(companyId);
                return { ...loan, risk };
            } catch {
                return loan;
            }
        });
        
        return NextResponse.json(enriched, { status: 200 });
    } catch (error) {
        console.error('Error fetching funded loans:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
