import { executeQuery, executeSingleQuery } from './index';

export interface LoanCovenant {
    id: number; // Primary key
    loan_id: number; // Foreign key to loans table
    current_ratio: number | null;
    quick_ratio: number | null;
    debt_ratio: number | null;
    equity_ratio: number | null;
    quasi_equity_ratio: number | null;
    capitalisation_ratio: number | null;
    gross_profit_margin: number | null;
    net_profit_margin: number | null;
    return_on_total_assets: number | null;
    interest_cover: number | null;
    receivables_turnover: number | null;
    inventory_turnover: number | null;
    creditors_turnover: number | null;
    avg_collection_period: number | null;
    avg_payment_period: number | null;
    inventory_turnover_days: number | null;
    operating_cycle: number | null;
    dividend_ratio: boolean | null;
}

export async function getCovenantRatios(loan_id: number): Promise<LoanCovenant[]> {
    const query = `SELECT * FROM loan_covenant WHERE loan_id = ?`;
    const result = await executeQuery(query, [loan_id]);

    // Ensure result is an array
    return Array.isArray(result) ? (result as LoanCovenant[]) : [];
}
