import { executeQuery } from './index';

export interface LoanRequest {
  id?: number;
  borrower_id: number;
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
  status: 'pending' | 'active' | 'funded' | 'closed' | 'expired';
  created_at?: Date;
  updated_at?: Date;
  expires_at?: Date;
}

export interface LoanRequestWithBorrower extends LoanRequest {
  borrower_name: string;
  borrower_company?: string;
  borrower_entity_type: 'company' | 'individual';
}

/**
 * Create a new loan request
 */
export async function createLoanRequest(request: Omit<LoanRequest, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
      const query = `
      INSERT INTO loan_requests (
        borrower_id, amount_requested, currency, 
        company_description, social_media_links, loan_purpose, 
        loan_type, status, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      request.borrower_id,
      request.amount_requested,
      request.currency,
      request.company_description || null,
      request.social_media_links ? JSON.stringify(request.social_media_links) : null,
      request.loan_purpose,
      request.loan_type,
      request.status,
      request.expires_at || null
    ];

  console.log('Executing query:', query);
  console.log('With params:', params);
  
  const result = await executeQuery<{ insertId: number }>(query, params);
  console.log('Query result:', result);
  
  return result[0]?.insertId || 0;
}

/**
 * Get a loan request by ID with borrower information
 */
export async function getLoanRequestById(id: number): Promise<(LoanRequest & { borrower_name: string; borrower_company?: string; borrower_entity_type: string }) | null> {
  const query = `
    SELECT lr.*, 
           CONCAT(u.first_name, ' ', u.last_name) as borrower_name,
           u.company as borrower_company,
           u.entity_type as borrower_entity_type
    FROM loan_requests lr
    JOIN users u ON lr.borrower_id = u.id
    WHERE lr.id = ?
  `;
  
  try {
    const result = await executeQuery<LoanRequest & { borrower_name: string; borrower_company?: string; borrower_entity_type: string }>(query, [id]);
    if (result.length === 0) return null;
    
    const row = result[0];
    return {
      ...row,
      social_media_links: row.social_media_links ? JSON.parse(row.social_media_links as any) : null
    };
  } catch (error) {
    console.error('Error fetching loan request by ID:', error);
    throw error;
  }
}

/**
 * Get all loan requests for a specific borrower
 */
export async function getLoanRequestsByBorrower(borrowerId: number): Promise<LoanRequest[]> {
  const query = 'SELECT * FROM loan_requests WHERE borrower_id = ? ORDER BY created_at DESC';
  const result = await executeQuery<LoanRequest>(query, [borrowerId]);
  
  return result.map(request => {
    if (request.social_media_links) {
      try {
        request.social_media_links = JSON.parse(request.social_media_links as any);
      } catch (e) {
        request.social_media_links = null;
      }
    }
    return request;
  });
}

/**
 * Get all active loan requests for lenders to browse
 */
export async function getActiveLoanRequests(): Promise<LoanRequestWithBorrower[]> {
  const query = `
    SELECT lr.*, 
           CONCAT(u.first_name, ' ', u.last_name) as borrower_name,
           u.company as borrower_company,
           u.entity_type as borrower_entity_type
    FROM loan_requests lr
    JOIN users u ON lr.borrower_id = u.id
    WHERE lr.status IN ('pending', 'active')
    AND (lr.expires_at IS NULL OR lr.expires_at > NOW())
    AND u.is_active = 1
    ORDER BY lr.created_at DESC
  `;
  
  const result = await executeQuery<LoanRequestWithBorrower>(query, []);
  
  return result.map(request => {
    if (request.social_media_links) {
      try {
        request.social_media_links = JSON.parse(request.social_media_links as any);
      } catch (e) {
        request.social_media_links = null;
      }
    }
    return request;
  });
}

/**
 * Update a loan request
 */
export async function updateLoanRequest(id: number, updates: Partial<LoanRequest>): Promise<boolean> {
  const allowedFields = [
    'amount_requested', 'currency', 'company_description',
    'social_media_links', 'loan_purpose', 'loan_type', 'status', 'expires_at'
  ];
  
  const setFields: string[] = [];
  const params: any[] = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      setFields.push(`${key} = ?`);
      if (key === 'social_media_links' && value) {
        params.push(JSON.stringify(value));
      } else {
        params.push(value);
      }
    }
  }
  
  if (setFields.length === 0) return false;
  
  setFields.push('updated_at = NOW()');
  params.push(id);
  
  const query = `UPDATE loan_requests SET ${setFields.join(', ')} WHERE id = ?`;
  const result = await executeQuery<{ affectedRows: number }>(query, params);
  
  return result[0]?.affectedRows > 0;
}

/**
 * Delete a loan request
 */
export async function deleteLoanRequest(id: number): Promise<boolean> {
  const query = 'DELETE FROM loan_requests WHERE id = ?';
  const result = await executeQuery<{ affectedRows: number }>(query, [id]);
  
  return result[0]?.affectedRows > 0;
}

/**
 * Get loan requests by status
 */
export async function getLoanRequestsByStatus(status: LoanRequest['status']): Promise<LoanRequest[]> {
  const query = 'SELECT * FROM loan_requests WHERE status = ? ORDER BY created_at DESC';
  const result = await executeQuery<LoanRequest>(query, [status]);
  
  return result.map(request => {
    if (request.social_media_links) {
      try {
        request.social_media_links = JSON.parse(request.social_media_links as any);
      } catch (e) {
        request.social_media_links = null;
      }
    }
    return request;
  });
}

/**
 * Get loan requests by loan type
 */
export async function getLoanRequestsByType(loanType: LoanRequest['loan_type']): Promise<LoanRequest[]> {
  const query = 'SELECT * FROM loan_requests WHERE loan_type = ? AND status IN ("pending", "active") ORDER BY created_at DESC';
  const result = await executeQuery<LoanRequest>(query, [loanType]);
  
  return result.map(request => {
    if (request.social_media_links) {
      try {
        request.social_media_links = JSON.parse(request.social_media_links as any);
      } catch (e) {
        request.social_media_links = null;
      }
    }
    return request;
  });
}

/**
 * Get loan requests within a price range
 */
export async function getLoanRequestsByAmountRange(minAmount: number, maxAmount: number, currency: string = 'USD'): Promise<LoanRequest[]> {
  const query = `
    SELECT * FROM loan_requests 
    WHERE amount_requested BETWEEN ? AND ? 
    AND currency = ? 
    AND status IN ("pending", "active")
    ORDER BY amount_requested ASC
  `;
  
  const result = await executeQuery<LoanRequest>(query, [minAmount, maxAmount, currency]);
  
  return result.map(request => {
    if (request.social_media_links) {
      try {
        request.social_media_links = JSON.parse(request.social_media_links as any);
      } catch (e) {
        request.social_media_links = null;
      }
    }
    return request;
  });
}


