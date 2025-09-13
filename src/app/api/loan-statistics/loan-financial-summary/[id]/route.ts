import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {getCompanyFinanceSummary} from "@/database/companyValues";
import {getCompanyId} from "@/database/loanRequest";

interface FinancialStatement {
    totalAssets: number;
    totalLiabilities: number;
    equity: number;
    grossProfit: number;
    ebitda: number;
}

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
        const financialData = await getCompanyFinanceSummary(companyID);


        if (!financialData) {
            return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
        }

        const statements = financialData.financial_summary.financialStatements as Record<string, FinancialStatement>;

        const combinedChartData = Object.entries(statements).map(([year, data]) => {
            const { raw: assetsRaw, display: assetsDisplay } = formatToUnits(data.totalAssets);
            const { raw: liabilitiesRaw, display: liabilitiesDisplay } = formatToUnits(data.totalLiabilities);
            const { raw: equityRaw, display: equityDisplay } = formatToUnits(data.equity);
            const { raw: grossRaw, display: grossDisplay } = formatToUnits(data.grossProfit);
            const { raw: ebitdaRaw, display: ebitdaDisplay } = formatToUnits(data.ebitda);

            return {
                year,
                totalAssets: assetsRaw,
                totalAssetsDisplay: assetsDisplay,
                totalLiabilities: liabilitiesRaw,
                totalLiabilitiesDisplay: liabilitiesDisplay,
                equity: equityRaw,
                equityDisplay: equityDisplay,
                grossProfit: grossRaw,
                grossDisplay: grossDisplay,
                ebitda: ebitdaRaw,
                ebitdaDisplay: ebitdaDisplay,
            };
        });

        console.log(combinedChartData);
        return NextResponse.json(combinedChartData);

    } catch (error) {
        console.error('Error fetching loan request:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

function formatToUnits(value: number): { raw: number; display: string } {
    if (value === null || value === undefined) return { raw: 0, display: "-" };

    const absVal = Math.abs(value);

    if (absVal >= 1_000_000_000_000) return { raw: value, display: (value / 1_000_000_000_000).toFixed(1) + "T" };
    if (absVal >= 1_000_000_000)     return { raw: value, display: (value / 1_000_000_000).toFixed(1) + "B" };
    if (absVal >= 1_000_000)         return { raw: value, display: (value / 1_000_000).toFixed(1) + "M" };
    if (absVal >= 1_000)             return { raw: value, display: (value / 1_000).toFixed(1) + "K" };

    return { raw: value, display: value.toString() };
}