import { executeQuery, executeSingleQuery } from './index';

export interface RecentSearches {
    id?: number;
    lender_id?: number;
    loan_request_id?: number;
    last_search?: Date;
}

export interface LoanRequest {
    id?: number;
    borrower_id: number;
    company_id?: number;
    amount_requested: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'CNY';
    company_description?: string;
    social_media_links?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
        website?: string;
    } | null;
    loan_purpose: string;
    loan_type: 'equipment' | 'expansion' | 'working_capital' | 'inventory' | 'real_estate' | 'startup' | 'other';
    status: 'pending' | 'funded' | 'closed' | 'expired';
    original_status?: string;
    closed_by?: number;
    closed_at?: Date;
    closed_reason?: string;
    created_at?: Date;
    updated_at?: Date;
    expires_at?: Date;
}

export interface LoanRequestWithBorrower extends LoanRequest {
    borrower_name: string;
    borrower_company?: string;
    funded_by?: number;
    funded_at?: Date;
    funded_by_name?: string;
}

export async function getAllSearches(lenderId:number) : Promise<LoanRequestWithBorrower[]> {
    const query = `
        SELECT
            lr.*,
            u.first_name AS borrower_name,
            u.company AS borrower_company,
            lr.funded_by,
            lr.funded_at,
            lender.first_name AS funded_by_name,
            cv.company_name,
            rs.last_search
        FROM recent_searches rs
                 JOIN loan_requests lr
                      ON rs.loan_request_id = lr.id
                 JOIN users u
                      ON lr.borrower_id = u.id
                 LEFT JOIN users lender
                           ON lr.funded_by = lender.id
                 LEFT JOIN company_values cv
                           ON lr.company_id = cv.id
        WHERE rs.lender_id = ?
        ORDER BY rs.last_search DESC;
  `;

    return await executeQuery<LoanRequestWithBorrower>(query, [lenderId]);
}

export async function insertRecentSearch(lenderId: number, loanRequestId: number): Promise<{success: boolean, insertId?: number, error?: string}> {
    try {
        // Check if the loan request ID already exists for this lender
        const existanceResult = await existanceSearch(lenderId, loanRequestId);
        if (existanceResult.length > 0) {
            return { success: true};
        }

        // Count existing recent searches for this lender
        const countResult = await countRecentSearches(lenderId);
        const currentCount = countResult[0].count;

        // If already 4 searches, remove the oldest one
        if (currentCount >= 4) {
            await removeOldestSearch(lenderId);
        }

        // Insert the new recent search
        const insertResult = await insertNewSearch(lenderId, loanRequestId);
        if(insertResult) {
            return { success: true};
        } else {
            return {success: false};
        }

    } catch (error) {
        console.error('Error inserting recent search:', error);
        return {
            success: false,
        };
    }
}

// Checks if the loan request is already in the recent search
export async function existanceSearch(lenderId: number, loanRequestId: number): Promise<Array<{id: number}>> {
    const query = `
        SELECT id FROM recent_searches
        WHERE lender_id = ? AND loan_request_id = ?
    `;
    const result = await executeQuery(query, [lenderId, loanRequestId]);
    return result;
}

// Checks if the count is 4 or more
export async function countRecentSearches(lenderId: number): Promise<Array<{count: number}>> {
    const query = `
        SELECT COUNT(*) as count FROM recent_searches
        WHERE lender_id = ?
    `;
    const result = await executeQuery(query, [lenderId]);
    return result;
}

// Removes the oldest search out of the 3
export async function removeOldestSearch(lenderId: number): Promise<boolean> {
    const selectQuery = `
        SELECT id FROM recent_searches 
        WHERE lender_id = ? 
        ORDER BY last_search ASC 
        LIMIT 1
    `;
    const oldestRecords = await executeSingleQuery(selectQuery, [lenderId]);

    if (oldestRecords.length === 0) {
        return oldestRecords.affectedRows > 0;
    }

    const deleteQuery = `DELETE FROM recent_searches WHERE id = ?`;
    const result = await executeSingleQuery(deleteQuery, [oldestRecords[0].id]);
    return result.affectedRows > 0;
}

// Inserts new search into the recent search table
export async function insertNewSearch(lenderId: number, loanRequestId: number): Promise<boolean> {
    const query = `
        INSERT INTO recent_searches (lender_id, loan_request_id, last_search)
        VALUES (?, ?, NOW())
    `;
    const result = await executeSingleQuery(query, [lenderId, loanRequestId]);
    return  result.affectedRows > 0;
}