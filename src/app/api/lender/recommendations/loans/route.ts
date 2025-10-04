import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getActiveLoanRequests } from '@/database/loanRequest';
import { getLenderProfile } from '@/database/profile';
import { computeCompanyRisk, appetiteAcceptsBand } from '@/lib/risk';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.userType !== 'lender') {
      return NextResponse.json({ error: 'Only lenders can get recommendations' }, { status: 403 });
    }

    const lenderUserId = parseInt(session.user.id);
    const lenderProfile = await getLenderProfile(lenderUserId);
    if (!lenderProfile) {
      return NextResponse.json({ error: 'Lender profile not found' }, { status: 404 });
    }

    const allLoans = await getActiveLoanRequests();

    // Compute risk and score matches
    const recommendations: any[] = [];
    for (const loan of allLoans as any[]) {
      const companyId = loan.company_id as number | undefined;
      if (!companyId) continue;

      try {
        const risk = await computeCompanyRisk(companyId);

        // Filters
        const appetiteOk = appetiteAcceptsBand(lenderProfile.risk_appetite, risk.band);
        const amountOk = (
          (lenderProfile.min_loan_amount == null || Number(lenderProfile.min_loan_amount) <= Number(loan.amount_requested)) &&
          (lenderProfile.max_loan_amount == null || Number(lenderProfile.max_loan_amount) >= Number(loan.amount_requested))
        );
        let sectorOk = true;
        try {
          const sectors = typeof lenderProfile.target_industries === 'string' ? JSON.parse(lenderProfile.target_industries as any) : lenderProfile.target_industries;
          const industry = (loan as any).industry || (loan as any).company_name ? null : null; // industry may not be denormalized here
          if (Array.isArray(sectors) && sectors.length > 0 && industry) {
            sectorOk = sectors.includes(industry);
          }
        } catch { sectorOk = true; }

        if (!(appetiteOk && amountOk && sectorOk)) continue;

        // Score: higher for lower risk, and closeness to amount band center
        const appetiteScore = risk.band === 'low' ? 1 : risk.band === 'medium' ? 0.6 : 0.2;
        const minA = Number(lenderProfile.min_loan_amount ?? 0);
        const maxA = Number(lenderProfile.max_loan_amount ?? loan.amount_requested);
        const mid = minA && maxA ? (minA + maxA) / 2 : Number(loan.amount_requested);
        const amt = Number(loan.amount_requested);
        const amountScore = 1 - Math.min(1, Math.abs(amt - mid) / (mid || 1));
        const finalScore = 0.7 * appetiteScore + 0.3 * amountScore;

        recommendations.push({ ...loan, risk, match_score: Number(finalScore.toFixed(3)) });
      } catch {
        // skip loans that fail risk computation
      }
    }

    // Sort descending by match score, then by newest
    recommendations.sort((a, b) => {
      if (b.match_score !== a.match_score) return b.match_score - a.match_score;
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ total: recommendations.length, loans: recommendations.slice(0, 50) });
  } catch (error) {
    console.error('Error generating lender loan recommendations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


