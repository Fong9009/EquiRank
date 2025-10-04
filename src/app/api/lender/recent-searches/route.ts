import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {getLenderID} from "@/database/profile";
import {getAllSearches} from "@/database/recentSearches";
import { computeCompanyRisk } from '@/lib/risk';

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
                { error: 'Access denied. Only lenders can view recent searches.' },
                { status: 403 }
            );
        }
        const userId = parseInt(session.user.id);
        const lenderId = await getLenderID(userId);
        if(!lenderId){
            return NextResponse.json(
                { error: 'Lender ID Unavailable' },
                { status: 404 }
            );
        }

        const recentSearches = await getAllSearches(lenderId.id);
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

        const enriched = await mapWithConcurrency(recentSearches as any[], 5, async (loan: any) => {
            const companyId = loan.company_id as number | undefined;
            if (!companyId) return loan;
            try {
                const risk = await computeCompanyRisk(companyId);
                return { ...loan, risk };
            } catch {
                return loan;
            }
        });
        // Hide closed or expired items
        const visible = enriched.filter((l: any) => l.status !== 'closed' && l.status !== 'expired');
        return NextResponse.json(visible, { status: 200 });
    } catch (error) {
        console.error('Error fetching funded loans:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
