import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLoanRequestById } from '@/database/loanRequest';
import { executeQuery } from '@/database';
import { computeCompanyRisk, appetiteAcceptsBand } from '@/lib/risk';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ loanRequestId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { loanRequestId } = await params;
        const id = parseInt(loanRequestId);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid loan request ID' }, { status: 400 });
        }

        const loan = await getLoanRequestById(id);
        if (!loan) {
            return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
        }

        const companyId = loan.company_id as unknown as number | undefined;
        let riskBand: 'low' | 'medium' | 'high' = 'high';
        if (companyId) {
            const risk = await computeCompanyRisk(companyId);
            riskBand = risk.band;
        }

        // Fetch eligible lenders by appetite, sector, and amount range
        const minAmount = Number(loan.amount_requested || 0);
        const industry = (loan as any).industry || null; // may be null unless denormalized

        // Join lender_profiles with users to ensure active/approved
        const lenders = await executeQuery<any>(
            `SELECT lp.*, u.first_name, u.last_name, u.company
             FROM lender_profiles lp
             JOIN users u ON lp.user_id = u.id
             WHERE u.is_active = 1 AND u.is_approved = 1`
        );

        const filtered = (lenders || []).filter((l: any) => {
            const appetiteOk = appetiteAcceptsBand(l?.risk_appetite, riskBand);
            const amountOk = (
                (l.min_loan_amount == null || Number(l.min_loan_amount) <= minAmount) &&
                (l.max_loan_amount == null || Number(l.max_loan_amount) >= minAmount)
            );
            let sectorOk = true;
            try {
                const sectors = typeof l.target_industries === 'string' ? JSON.parse(l.target_industries) : l.target_industries;
                if (Array.isArray(sectors) && sectors.length > 0 && industry) {
                    sectorOk = sectors.includes(industry);
                }
            } catch { sectorOk = true; }
            return appetiteOk && amountOk && sectorOk;
        });

        return NextResponse.json({
            riskBand,
            totalCandidates: filtered.length,
            lenders: filtered.slice(0, 25)
        });
    } catch (error) {
        console.error('Error recommending lenders:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


