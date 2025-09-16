import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {getCompanyCovenant} from "@/database/companyValues";
import {getCompanyId} from "@/database/loanRequest";
//import { getCovenantRatios } from '@/database/loanStatistics';

type MetricRaw = {
    value: number | null;
    comparison: string; // '>' or '<'
    target: number;
    category: string;
};

interface MetricInfo {
    label: string;
    description: string;
    color: string;
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
        const covenantRatiosRaw = await getCompanyCovenant(companyID);

        const covenantObjectRatios = covenantRatiosRaw.covenant_statistic;

        if (!covenantObjectRatios) {
            return NextResponse.json({ error: 'Loan request not found' }, { status: 404 });
        }
        let covenantRatios;
        try {
            if (typeof covenantObjectRatios === 'string') {
                covenantRatios = JSON.parse(covenantObjectRatios);
            } else if (typeof covenantObjectRatios === 'object') {
                covenantRatios = covenantObjectRatios;
            } else {
                throw new Error('Unexpected covenant ratios format');
            }
        } catch (error) {
            console.error('Error processing covenant ratios:', error);
            return NextResponse.json({ error: 'Invalid covenant data format' }, { status: 500 });
        }

        const rawMetrics: MetricRaw[] = [
            { value: covenantRatios?.current_ratio, comparison: '>', target: 88, category: 'Liquidity' },
            { value: covenantRatios?.quick_ratio, comparison: '>', target: 1, category: 'Liquidity' },

            { value: covenantRatios?.debt_ratio, comparison: '>', target: 40, category: 'Solvency' },
            { value: covenantRatios?.equity_ratio, comparison: '>', target: 60, category: 'Solvency' },
            { value: covenantRatios?.quasi_equity_ratio, comparison: '>', target: 15, category: 'Solvency' },
            { value: covenantRatios?.capitalisation_ratio, comparison: '>', target: 123, category: 'Solvency' },
            { value: covenantRatios?.interest_cover, comparison: '>', target: 3, category: 'Solvency' },

            { value: covenantRatios?.receivables_turnover, comparison: '>', target: 2, category: 'Efficiency & Working-Capital' },
            { value: covenantRatios?.inventory_turnover, comparison: '>', target: 2, category: 'Efficiency & Working-Capital' },
            { value: covenantRatios?.creditors_turnover, comparison: '>', target: 2, category: 'Efficiency & Working-Capital' },
            { value: covenantRatios?.avg_collection_period, comparison: '<', target: 30, category: 'Efficiency & Working-Capital' },
            { value: covenantRatios?.avg_payment_period, comparison: '<', target: 45, category: 'Efficiency & Working-Capital' },
            { value: covenantRatios?.inventory_turnover_days, comparison: '<', target: 50, category: 'Efficiency & Working-Capital' },
            { value: covenantRatios?.operating_cycle, comparison: '<', target: 30, category: 'Efficiency & Working-Capital' },

            { value: covenantRatios?.gross_profit_margin, comparison: '>', target: 40, category: 'Profitability' },
            { value: covenantRatios?.net_profit_margin, comparison: '>', target: 15, category: 'Profitability' },
            { value: covenantRatios?.return_on_total_assets, comparison: '>', target: 8, category: 'Profitability' },
        ];

        const grouped: Record<string, { passes: number; total: number }> = {};

        rawMetrics.forEach(metric => {
            const cat = metric.category;
            if (!grouped[cat]) grouped[cat] = { passes: 0, total: 0 };
            grouped[cat].total += 1;
            if (isPass(metric)) grouped[cat].passes += 1;
            //console.log(grouped);
        });


// Convert to final data array
        const data = Object.entries(grouped).map(([category, { passes, total }]) => ({
            category,
            value: Math.round((passes / total) * 100), // percentage
        }));

        const dataWithDescriptions = data.map(metric => {
            const info = getMetricInfo(metric.category, metric.value);
            return {
                ...metric,
                description: info.description,
                color: info.color, // optional, if you want to color the radar points
            };
        });

        return NextResponse.json(dataWithDescriptions);

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

function isPass(metric: MetricRaw): boolean {
    const val = Number(metric.value); // convert string to number
    if (isNaN(val)) return false;
    if (metric.comparison === '>') return val > metric.target;
    if (metric.comparison === '<') return val < metric.target;
    if (metric.comparison === 'TRUE') return Boolean(val); // for dividend ratio
    return false;
}

function getMetricInfo(category: string, value: number): MetricInfo {
    let color = '';
    let description = '';

    // Determine color based on value
    if (value === 0) {
        color = 'red';
    } else if (value > 0 && value < 50) {
        color = 'orange'; // for 0 < x < 50%
    } else if (value >= 50 && value <= 70) {
        color = 'amber';
    } else {
        color = 'green';
    }

    // Determine description based on category and value
    switch (category) {
        case 'Liquidity':
            description =
                value === 0
                    ? 'This indicates the company is unable to pay its bills.'
                    : value < 50
                        ? 'This indicates the company struggles to pay its bills.'
                        : value <= 70
                            ? 'This indicates the company can pay bills but with caution.'
                            : 'This indicates the company can comfortably pay its bills.';
            break;

        case 'Solvency':
            description =
                value === 0
                    ? 'This indicates the company is highly leveraged and cannot sustain debt.'
                    : value < 50
                        ? 'This indicates the company has moderate debt risk.'
                        : value <= 70
                            ? 'This indicates the company is fairly stable with its debt.'
                            : 'This indicates the company can sustain its debt over time.';
            break;

        case 'Profitability':
            description =
                value === 0
                    ? 'This indicates the company is not generating profit.'
                    : value < 50
                        ? 'This indicates the Profitability is low and may indicate a struggle to find buyers.'
                        : value <= 70
                            ? 'This indicates the company is moderately profitable.'
                            : 'This indicates the company is highly profitable.';
            break;

        case 'Efficiency & Working-Capital':
            description =
                value === 0
                    ? 'This indicates the company poorly manages receivables and payables.'
                    : value < 50
                        ? 'This indicates the Efficiency is below average.'
                        : value <= 70
                            ? 'This indicates efficiency is decent but can improve.'
                            : 'This indicates the company manages working capital efficiently.';
            break;

        default:
            description = '';
    }

    return { label: category, description, color };
}