import { executeQuery, executeSingleQuery } from './index';

export interface CompanyValues {
    id: number;
    borrower_id: number;
    created_at: Date;
    updated_at: Date;
    company_name?: string;
    industry?: string;
    revenue_range?:string;
    covenant_statistic?: {
        debt_ratio?: number;
        quick_ratio?: number;
        equity_ratio?: number;
        current_ratio?: number;
        dividend_ratio?: number;
        interest_cover?: number;
        operating_cycle?: number;
        net_profit_margin?: number;
        avg_payment_period?: number;
        creditors_turnover?: number;
        inventory_turnover?: number;
        quasi_equity_ratio?: number;
        gross_profit_margin?: number;
        capitalisation_ratio?: number;
        receivables_turnover?: number;
        avg_collection_period?: number;
        return_on_total_assets?: number;
        inventory_turnover_days?: number;
    }
}

export async function getAllCompaniesById(borrowerId: number): Promise<CompanyValues[]> {
    const query = 'SELECT id, company_name FROM company_values WHERE borrower_id = ?';
    const results: CompanyValues[] = await executeQuery(query, [borrowerId]);
    return results;
}