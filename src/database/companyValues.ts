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

interface GetCompaniesParams {
    companyName?: string | null;
    companyOwner?: string | null;
    revenueRange?: string | null;
    page: number;
    limit: number;
}

interface CompaniesResult {
    companies: (CompanyValues & { borrower_name: string })[];
    total: number;
}

export async function getAllCompaniesById(borrowerId: number): Promise<CompanyValues[]> {
    const query = 'SELECT id, company_name FROM company_values WHERE borrower_id = ?';
    const results: CompanyValues[] = await executeQuery(query, [borrowerId]);
    return results;
}

export async function getCompanyCovenant(id: number): Promise<any> {
    const query = 'SELECT covenant_statistic FROM company_values WHERE id = ?';
    const results = await executeQuery(query, [id]);

    return results.length > 0 ? results[0] : null;
}

export async function getCompanyABS(id: number): Promise<any> {
    const query = 'SELECT abs_benchmark FROM company_values WHERE id = ?';
    const results = await executeQuery(query, [id]);

    return results.length > 0 ? results[0] : null;
}

export async function getCompanyFinanceSummary(id: number): Promise<any> {
    const query = 'SELECT financial_summary FROM company_values WHERE id = ?';
    const results = await executeQuery(query, [id]);

    return results.length > 0 ? results[0] : null;
}

export async function getAllCompanies(params: GetCompaniesParams): Promise<CompaniesResult> {
    const { companyName, companyOwner, revenueRange, page, limit } = params;
    const offset = (page - 1) * limit;

    // Build dynamic WHERE conditions
    const conditions: string[] = [];
    const queryParams: any[] = [];

    if (companyName) {
        conditions.push(`cv.company_name LIKE ?`);
        queryParams.push(`%${companyName}%`);
    }

    if (companyOwner) {
        // For MySQL, we need to be more careful with CONCAT in WHERE clauses
        conditions.push(`(CONCAT(u.first_name, ' ', u.last_name) LIKE ?)`);
        queryParams.push(`%${companyOwner}%`);
    }

    if (revenueRange) {
        conditions.push(`cv.revenue_range = ?`);
        queryParams.push(revenueRange);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    console.log(whereClause);
    // Count query for total records
    const countQuery = `
        SELECT COUNT(*) as total
        FROM company_values cv
        INNER JOIN borrower_profiles bp ON cv.borrower_id = bp.id
        INNER JOIN users u ON bp.user_id = u.id
        ${whereClause}
    `;

    // Data query with pagination
    const dataQuery = `
        SELECT 
            cv.id,
            cv.company_name,
            cv.industry,
            cv.revenue_range,
            CONCAT(u.first_name, ' ', u.last_name) AS borrower_name
        FROM company_values cv
        INNER JOIN borrower_profiles bp ON cv.borrower_id = bp.id
        INNER JOIN users u ON bp.user_id = u.id
        ${whereClause}
        ORDER BY cv.company_name
        LIMIT ${limit} OFFSET ${offset}
    `;

    // Execute both queries
    const [countResult, dataResult] = await Promise.all([
        executeQuery(countQuery, queryParams),
        executeQuery(dataQuery, [...queryParams])
    ]);

    return {
        companies: dataResult as (CompanyValues & { borrower_name: string })[],
        total: parseInt(countResult[0].total)
    };
}

export async function getCompanySearch(params: GetCompaniesParams): Promise<CompaniesResult> {
    const { companyName } = params;

    const conditions: string[] = [];
    const queryParams: any[] = [];

    if (companyName) {
        conditions.push(`cv.company_name LIKE ?`);
        queryParams.push(`%${companyName}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Data query with pagination
    const dataQuery = `
        SELECT 
            cv.id,
            cv.company_name,
            cv.industry,
            cv.revenue_range,
            CONCAT(u.first_name, ' ', u.last_name) AS borrower_name
        FROM company_values cv
        INNER JOIN borrower_profiles bp ON cv.borrower_id = bp.id
        INNER JOIN users u ON bp.user_id = u.id
        ${whereClause}
        ORDER BY cv.company_name
        LIMIT 5
    `;

    // Execute both queries
    const [dataResult] = await Promise.all([
        executeQuery(dataQuery, [...queryParams])
    ]);


    return {
        companies: dataResult as (CompanyValues & { borrower_name: string })[],
    };
}

export async function companyCheck(companyId: number): Promise<any> {
    const query = 'SELECT * FROM company_values WHERE id = ?';
    const results = await executeSingleQuery(query, [companyId]);
    return results.length > 0 ? results[0] : null;
}

export async function getCompanyName(companyId: number): Promise<any> {
    const query = 'SELECT company_name FROM company_values WHERE id = ?';
    const results = await executeSingleQuery(query, [companyId]);
    return results.length > 0 ? results[0] : null;
}

export async function  getBorrowerCompaniesCount(borrowerId: number): Promise<number> {
    try {
        // Use alias for predictable property name
        const query = `SELECT COUNT(*) as company_count FROM company_values WHERE borrower_id = ?`;
        const result = await executeSingleQuery(query, [borrowerId]);

        // Access the aliased property
        return Number(result[0]?.company_count) || 0;
    } catch (error) {
        console.error('Error obtaining Loan Request Count', error);
        return 0;
    }
}