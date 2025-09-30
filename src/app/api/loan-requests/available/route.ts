import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveLoanRequests } from '@/database/loanRequest';
import { computeCompanyRisk } from '@/lib/risk';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.userType !== 'lender') {
      return NextResponse.json({ error: 'Only lenders can view available loan requests' }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const loanType = searchParams.get('loanType');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const riskBand = searchParams.get('riskBand'); // 'low' | 'medium' | 'high'

    // Get all active loan requests
    let loanRequests = await getActiveLoanRequests();

    // Apply filters
    if (status && status !== 'all') {
      loanRequests = loanRequests.filter(req => req.status === status);
    }

    if (loanType && loanType !== 'all') {
      loanRequests = loanRequests.filter(req => req.loan_type === loanType);
    }

    if (minAmount) {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) {
        loanRequests = loanRequests.filter(req => req.amount_requested >= min);
      }
    }

    if (maxAmount) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) {
        loanRequests = loanRequests.filter(req => req.amount_requested <= max);
      }
    }

    // Compute risk (band + score) for each request with a company context
    // Concurrency-limited enrichment to avoid DB connection spikes
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

    const enriched = await mapWithConcurrency(loanRequests as any[], 5, async (req: any) => {
      const companyId = (req as any).company_id as number | undefined;
      if (!companyId) return req;
      try {
        const risk = await computeCompanyRisk(companyId);
        return { ...req, risk };
      } catch {
        return req;
      }
    });

    // Optional risk band filtering
    let finalList: any[] = enriched;
    if (riskBand && ['low','medium','high'].includes(riskBand)) {
      finalList = enriched.filter((r: any) => r?.risk?.band === riskBand);
    }

    // Sort by creation date (newest first)
    finalList.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(finalList);

  } catch (error) {
    console.error('Error fetching available loan requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
