import { getCompanyCovenant, getCompanyABS, getCompanyFinanceSummary, getBorrowerProfileId } from '@/database/companyValues';
import { executeSingleQuery } from '@/database';
import { getUserIdBorrower, getBorrowerProfile } from '@/database/profile';
import { getRiskSettings } from '@/database/riskSettings';

export type RiskBand = 'low' | 'medium' | 'high';

export interface RiskDrivers {
    liquidityScore: number;
    solvencyScore: number;
    profitabilityScore: number;
    efficiencyScore: number;
}

export interface CompanyRisk {
    score: number; // 0-100
    band: RiskBand;
    drivers: RiskDrivers;
    components?: {
        covenantWeightedScore?: number;
        trendScore?: number;
        maturityScore?: number;
        absScore?: number;
        sizeScore?: number;
        scaleScore?: number;
    };
}

/**
 * Compute pass percentage given raw covenant ratios using same targets as radar graph
 */
function computeCovenantCategoryScores(covenantRatios: any, targetsOverride?: Record<string, number>): RiskDrivers {
    const t = (key: string, def: number) => {
        const v = targetsOverride?.[key];
        return typeof v === 'number' && Number.isFinite(v) ? v : def;
    };
    const metrics: Array<{ value: number | null; comparison: '>' | '<'; target: number; category: keyof RiskDrivers }>[] = [
        [
            { value: covenantRatios?.current_ratio ?? null, comparison: '>', target: t('current_ratio', 88), category: 'liquidityScore' },
            { value: covenantRatios?.quick_ratio ?? null, comparison: '>', target: t('quick_ratio', 1), category: 'liquidityScore' },
        ],
        [
            { value: covenantRatios?.debt_ratio ?? null, comparison: '>', target: t('debt_ratio', 40), category: 'solvencyScore' },
            { value: covenantRatios?.equity_ratio ?? null, comparison: '>', target: t('equity_ratio', 60), category: 'solvencyScore' },
            { value: covenantRatios?.quasi_equity_ratio ?? null, comparison: '>', target: t('quasi_equity_ratio', 15), category: 'solvencyScore' },
            { value: covenantRatios?.capitalisation_ratio ?? null, comparison: '>', target: t('capitalisation_ratio', 123), category: 'solvencyScore' },
            { value: covenantRatios?.interest_cover ?? null, comparison: '>', target: t('interest_cover', 3), category: 'solvencyScore' },
        ],
        [
            { value: covenantRatios?.receivables_turnover ?? null, comparison: '>', target: t('receivables_turnover', 2), category: 'efficiencyScore' },
            { value: covenantRatios?.inventory_turnover ?? null, comparison: '>', target: t('inventory_turnover', 2), category: 'efficiencyScore' },
            { value: covenantRatios?.creditors_turnover ?? null, comparison: '>', target: t('creditors_turnover', 2), category: 'efficiencyScore' },
            { value: covenantRatios?.avg_collection_period ?? null, comparison: '<', target: t('avg_collection_period', 30), category: 'efficiencyScore' },
            { value: covenantRatios?.avg_payment_period ?? null, comparison: '<', target: t('avg_payment_period', 45), category: 'efficiencyScore' },
            { value: covenantRatios?.inventory_turnover_days ?? null, comparison: '<', target: t('inventory_turnover_days', 50), category: 'efficiencyScore' },
            { value: covenantRatios?.operating_cycle ?? null, comparison: '<', target: t('operating_cycle', 30), category: 'efficiencyScore' },
        ],
        [
            { value: covenantRatios?.gross_profit_margin ?? null, comparison: '>', target: t('gross_profit_margin', 40), category: 'profitabilityScore' },
            { value: covenantRatios?.net_profit_margin ?? null, comparison: '>', target: t('net_profit_margin', 15), category: 'profitabilityScore' },
            { value: covenantRatios?.return_on_total_assets ?? null, comparison: '>', target: t('return_on_total_assets', 8), category: 'profitabilityScore' },
        ]
    ];

    const sums: Record<keyof RiskDrivers, { pass: number; total: number }> = {
        liquidityScore: { pass: 0, total: 0 },
        solvencyScore: { pass: 0, total: 0 },
        profitabilityScore: { pass: 0, total: 0 },
        efficiencyScore: { pass: 0, total: 0 }
    };

    function isPass(value: number | null, comparison: '>' | '<', target: number): boolean {
        if (value === null || value === undefined) return false;
        const numeric = Number(value);
        if (Number.isNaN(numeric)) return false;
        return comparison === '>' ? numeric > target : numeric < target;
    }

    metrics.forEach(group => {
        group.forEach(m => {
            sums[m.category].total += 1;
            if (isPass(m.value, m.comparison, m.target)) sums[m.category].pass += 1;
        });
    });

    const toPct = (x: { pass: number; total: number }) => x.total > 0 ? Math.round((x.pass / x.total) * 100) : 0;
    return {
        liquidityScore: toPct(sums.liquidityScore),
        solvencyScore: toPct(sums.solvencyScore),
        profitabilityScore: toPct(sums.profitabilityScore),
        efficiencyScore: toPct(sums.efficiencyScore)
    };
}

function bandFromScore(score: number): RiskBand {
    if (score >= 75) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
}

function clamp01(x: number): number {
    if (!Number.isFinite(x)) return 0;
    if (x < 0) return 0;
    if (x > 1) return 1;
    return x;
}

function normalizeCreditScore(creditScore: number): number {
    // Normalize FICO-like 300-850 to 0-100
    const pct = clamp01((Number(creditScore) - 300) / (850 - 300));
    return Math.round(pct * 100);
}

function normalizeYearsInBusiness(years: number): number {
    // Saturate at 10+ years = 100, 0 years = 0
    const pct = clamp01(Number(years) / 10);
    return Math.round(pct * 100);
}

function normalizeAnnualRevenue(revenue: number): number {
    // Log-scale normalize with soft cap at 50m => 100
    const r = Math.max(0, Number(revenue));
    const cap = 50_000_000;
    const pct = clamp01(Math.log10(1 + r) / Math.log10(1 + cap));
    return Math.round(pct * 100);
}

function normalizeEmployeeCount(count: number): number {
    // Saturate at 200 employees => 100
    const pct = clamp01(Number(count) / 200);
    return Math.round(pct * 100);
}

function revenueRangeToApprox(range: string): number {
    switch (range) {
        case '0-50k': return 25_000;
        case '50k-100k': return 75_000;
        case '100k-500k': return 300_000;
        case '500k-1m': return 750_000;
        case '1m-5m': return 3_000_000;
        case '5m-10m': return 7_000_000;
        case '10m-50m': return 25_000_000;
        case '50m+': return 60_000_000; // slightly above cap; will clamp to 100
        default: return 0;
    }
}

type FS = {
    netRevenue?: number;
    profitLoss?: number;
    ebitda?: number;
    totalAssets?: number;
    totalLiabilities?: number;
};

function computeFinancialSummaryTrendScore(statements: Record<string, FS>): number {
    try {
        // Sort years ascending
        const years = Object.keys(statements).sort();
        if (years.length < 2) return 50; // neutral if insufficient history

        const first = statements[years[0]] || {};
        const last = statements[years[years.length - 1]] || {};

        const rev0 = Number(first.netRevenue || 0);
        const rev1 = Number(last.netRevenue || 0);
        const pl0 = Number(first.profitLoss || 0);
        const pl1 = Number(last.profitLoss || 0);
        const assets1 = Number(last.totalAssets || 0);
        const liab1 = Number(last.totalLiabilities || 0);

        // Revenue growth component
        let growth = 0;
        if (rev0 > 0 && Number.isFinite(rev0) && Number.isFinite(rev1)) {
            growth = (rev1 - rev0) / rev0; // -1 .. inf
        }
        // Normalize: -50% => 0, 0% => 50, +50% => 75, +100% => 100 (cap)
        const growthPct = (() => {
            const g = growth;
            if (!Number.isFinite(g)) return 50;
            if (g <= -0.5) return 0;
            if (g >= 1) return 100;
            // Map [-0.5, 0] -> [0, 50], [0, 1] -> [50, 100]
            return g < 0 ? 50 * (1 + g / 0.5) : 50 + 50 * g;
        })();

        // Profit margin latest year
        const margin = rev1 > 0 ? pl1 / rev1 : 0;
        const marginPct = (() => {
            const m = margin;
            if (!Number.isFinite(m)) return 50;
            if (m <= 0) return 30; // penalize losses
            if (m >= 0.3) return 100; // 30%+ very strong
            return Math.round(30 + (m / 0.3) * 70);
        })();

        // Leverage snapshot (lower liabilities/assets is better)
        const leverage = assets1 > 0 ? liab1 / assets1 : 1;
        const leveragePct = (() => {
            const l = leverage;
            if (!Number.isFinite(l)) return 50;
            if (l >= 1) return 20; // liabilities >= assets is weak
            if (l <= 0.3) return 100;
            return Math.round(20 + (1 - l) * 80);
        })();

        // Weighted blend
        const score = Math.round(0.4 * growthPct + 0.4 * marginPct + 0.2 * leveragePct);
        return score;
    } catch {
        return 50;
    }
}

type AbsRow = { name?: string; benchmarkValue?: number; calculatedValue?: number };
function computeAbsAlignmentScore(rows: AbsRow[]): number {
    if (!Array.isArray(rows) || rows.length === 0) return 50;
    let acc = 0;
    let n = 0;
    for (const r of rows) {
        const b = Number(r?.benchmarkValue);
        const c = Number(r?.calculatedValue);
        if (!Number.isFinite(b) || !Number.isFinite(c)) continue;
        const denom = Math.max(1, Math.abs(b));
        const err = Math.abs(c - b) / denom; // relative error
        const score = Math.max(0, 1 - err); // 1 at exact match, decays with distance
        acc += score;
        n += 1;
    }
    if (n === 0) return 50;
    return Math.round((acc / n) * 100);
}

/**
 * Compute company risk using available company_values JSONs. Falls back gracefully
 * if some data is missing and uses what is present.
 */
export async function computeCompanyRisk(companyId: number): Promise<CompanyRisk> {
    // Load optional overrides from risk settings
    let overrides: any | null = null;
    try {
        const rec = await getRiskSettings();
        overrides = rec?.settings || null;
    } catch {}
    // Fetch covenant ratios (primary driver for now)
    const covenantRatiosRaw = await getCompanyCovenant(companyId);
    let covenantRatios: any = null;
    if (covenantRatiosRaw && covenantRatiosRaw.covenant_statistic) {
        const raw = covenantRatiosRaw.covenant_statistic;
        if (typeof raw === 'string') {
            try { covenantRatios = JSON.parse(raw); } catch { covenantRatios = null; }
        } else if (typeof raw === 'object') {
            covenantRatios = raw;
        }
    }

    // Financial summary (trend and structure)
    let trendScore = 0;
    let trendAvailable = false;
    try {
        const financial = await getCompanyFinanceSummary(companyId);
        const summary = typeof financial?.financial_summary === 'string'
            ? JSON.parse(financial.financial_summary)
            : financial?.financial_summary;
        if (summary?.financialStatements) {
            trendScore = computeFinancialSummaryTrendScore(summary.financialStatements);
            trendAvailable = true;
        }
    } catch {}

    // ABS benchmark alignment (optional)
    let absScore = 0;
    let absAvailable = false;
    try {
        const abs = await getCompanyABS(companyId);
        const parsed = typeof abs?.abs_benchmark === 'string' ? JSON.parse(abs.abs_benchmark) : abs?.abs_benchmark;
        if (Array.isArray(parsed)) {
            absScore = computeAbsAlignmentScore(parsed);
            absAvailable = parsed.length > 0;
        }
    } catch {}

    // Maturity/size/scale via borrower profile (no company_statistics dependency)
    let maturityScore = 0;
    let maturityAvailable = false;
    let sizeScore = 0; // annual revenue
    let sizeAvailable = false;
    let scaleScore = 0; // employee count
    let scaleAvailable = false;
    try {
        const borrowerProfileId = await getBorrowerProfileId(companyId);
        if (borrowerProfileId) {
            const userId = await getUserIdBorrower(borrowerProfileId);
            if (userId) {
                const bProfile = await getBorrowerProfile(userId);
                if (bProfile?.years_in_business != null) {
                    maturityScore = normalizeYearsInBusiness(bProfile.years_in_business);
                    maturityAvailable = true;
                }
                if (bProfile?.employee_count != null) {
                    scaleScore = normalizeEmployeeCount(Number(bProfile.employee_count));
                    scaleAvailable = true;
                }
                // size from revenue_range bracket
                if (bProfile?.revenue_range) {
                    const approx = revenueRangeToApprox(bProfile.revenue_range);
                    sizeScore = normalizeAnnualRevenue(approx);
                    sizeAvailable = true;
                }
            }
        }
    } catch {}

    const drivers = computeCovenantCategoryScores(covenantRatios || {}, overrides?.targets);
    // Weighted average: weight profitability and solvency slightly higher
    const covenantWeights = {
        liquidityScore: overrides?.weights?.covenant?.liquidity ?? 0.25,
        solvencyScore: overrides?.weights?.covenant?.solvency ?? 0.3,
        profitabilityScore: overrides?.weights?.covenant?.profitability ?? 0.3,
        efficiencyScore: overrides?.weights?.covenant?.efficiency ?? 0.15
    };
    const covenantWeightedScore = (
        drivers.liquidityScore * covenantWeights.liquidityScore +
        drivers.solvencyScore * covenantWeights.solvencyScore +
        drivers.profitabilityScore * covenantWeights.profitabilityScore +
        drivers.efficiencyScore * covenantWeights.efficiencyScore
    );

    // Combine components with dynamic re-weighting based on availability
    const componentWeights = {
        covenant: overrides?.weights?.components?.covenant ?? 0.50,
        trend: overrides?.weights?.components?.trend ?? 0.20,
        abs: overrides?.weights?.components?.abs ?? 0.10,
        maturity: overrides?.weights?.components?.maturity ?? 0.10,
        size: overrides?.weights?.components?.size ?? 0.05,
        scale: overrides?.weights?.components?.scale ?? 0.05
    } as const;
    const parts: Array<{ value: number; weight: number; enabled: boolean }> = [
        { value: covenantWeightedScore, weight: componentWeights.covenant, enabled: !!covenantRatios },
        { value: trendScore, weight: componentWeights.trend, enabled: trendAvailable },
        { value: absScore, weight: componentWeights.abs, enabled: absAvailable },
        { value: maturityScore, weight: componentWeights.maturity, enabled: maturityAvailable },
        { value: sizeScore, weight: componentWeights.size, enabled: sizeAvailable },
        { value: scaleScore, weight: componentWeights.scale, enabled: scaleAvailable }
    ];
    const totalWeight = parts.reduce((s, p) => s + (p.enabled ? p.weight : 0), 0);
    let combinedScore = 50;
    if (totalWeight > 0) {
        const weighted = parts.reduce((s, p) => s + (p.enabled ? p.value * p.weight : 0), 0);
        combinedScore = Math.round(weighted / totalWeight);
    }
    const band = bandFromScore(combinedScore);
    return {
        score: combinedScore,
        band,
        drivers,
        components: {
            covenantWeightedScore,
            trendScore,
            maturityScore,
            absScore,
            sizeScore,
            scaleScore
        }
    };
}

/**
 * Persist risk score into company_values if columns exist. No-op if not present.
 */
export async function upsertCompanyRisk(companyId: number, risk: CompanyRisk): Promise<void> {
    try {
        await executeSingleQuery(
            'UPDATE company_values SET risk_score = ?, risk_band = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [risk.score, risk.band, companyId]
        );
    } catch (e: any) {
        const msg = e?.sqlMessage || e?.message || '';
        if (!/Unknown column 'risk_score'|Unknown column 'risk_band'/i.test(msg)) {
            throw e;
        }
        // If columns don't exist yet, ignore silently
    }
}

export function appetiteAcceptsBand(appetite: string | null | undefined, band: RiskBand): boolean {
    if (!appetite) return false;
    if (appetite === 'conservative') return band === 'low';
    if (appetite === 'moderate') return band === 'low' || band === 'medium';
    if (appetite === 'aggressive') return true;
    return false;
}


