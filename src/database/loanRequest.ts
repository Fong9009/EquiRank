import { executeQuery, executeSingleQuery } from './index';

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
  loan_type: string;
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

/**
 * Create a new loan request
 */
export async function createLoanRequest(request: Omit<LoanRequest, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
      const query = `
      INSERT INTO loan_requests (
        borrower_id, company_id, amount_requested, currency, company_description,
        loan_purpose, 
        loan_type, status, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      request.borrower_id,
      request.company_id || null,
      request.amount_requested,
      request.currency,
      request.company_description || null,
      request.loan_purpose,
      request.loan_type,
      request.status,
      request.expires_at || null
    ];

  // for INSERT statements, we need to use executeSingleQuery to get the ResultSetHeader
  const result = await executeSingleQuery(query, params);
  
  return result.insertId || 0;
}

export async function getCompanyId(id: number): Promise<number | null> {
  const query = 'SELECT company_id FROM loan_requests WHERE id = ?';
  const results = await executeQuery(query, [id]);

  // Return the company_id, or null if not found
  return results.length > 0 ? results[0].company_id : null;
}

/**
 * Get a loan request by ID with borrower information
 */
export async function getLoanRequestById(id: number): Promise<(LoanRequest & { borrower_name: string; borrower_company?: string; website?: string; linkedin?: string; funded_by?: number; funded_at?: Date; funded_by_name?: string; other_loan_type?: string; }) | null> {
  const query = `
    SELECT lr.*,
           CONCAT(u.first_name, ' ', u.last_name) AS borrower_name,
           u.company AS borrower_company,
           cv.company_name AS company_name,
           lr.funded_by,
           lr.funded_at,
           CONCAT(lender.first_name, ' ', lender.last_name) as funded_by_name
    FROM loan_requests lr
           JOIN users u ON lr.borrower_id = u.id
           LEFT JOIN company_values cv ON lr.company_id = cv.id
           LEFT JOIN users lender ON lr.funded_by = lender.id
    WHERE lr.id = ?
  `;
  
  try {
    const result = await executeQuery<LoanRequest & { borrower_name: string; borrower_company?: string; website?: string; linkedin?: string; funded_by?: number; funded_at?: Date; funded_by_name?: string }>(query, [id]);
    
    if (result.length === 0) {
      return null;
    }
    
    const row = result[0];
    
    const socialMediaLinks = {
      linkedin: '',
      twitter: '', 
      facebook: '', 
      instagram: '',
      website: ''
    };

    const loanTypes = [
      "working_capital",
      "equipment",
      "expansion",
      "inventory",
      "real_estate",
      "startup",
    ];

    const loanRequestJson = {
      ...row,
      loan_type:
          row.loan_type && ! loanTypes.includes(row.loan_type)
              ? "other"
              : row.loan_type,
      other_loan_type:
          row.loan_type && ! loanTypes.includes(row.loan_type)
              ? row.loan_type
              : '',
      social_media_links: socialMediaLinks
    };

    
    return loanRequestJson;
    
  } catch (error) {
    console.error('Error in getLoanRequestById for ID:', id, error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

/**
 * Get all loan requests for a specific borrower
 */
export async function getLoanRequestsByBorrower(borrowerId: number): Promise<LoanRequest[]> {
  const query = `
    SELECT
      lr.*,
      u.company AS borrower_company,
      cv.company_name AS company_name,
      lr.funded_by,
      lr.funded_at,
      CONCAT(lender.first_name, ' ', lender.last_name) as funded_by_name
    FROM loan_requests lr
           JOIN users u ON lr.borrower_id = u.id
           LEFT JOIN company_values cv ON lr.company_id = cv.id
           LEFT JOIN users lender ON lr.funded_by = lender.id
    WHERE lr.borrower_id = ?
    ORDER BY lr.created_at DESC
  `;
  const result = await executeQuery<LoanRequest & { borrower_company?: string; funded_by?: number; funded_at?: Date; funded_by_name?: string }>(query, [borrowerId]);
  
  return result.map(request => {
    // Create social media links from user profile
    const socialMediaLinks = {
      linkedin: '',
      twitter: '', // Not stored in user profile yet
      facebook: '', // Not stored in user profile yet
      instagram: '', // Not stored in user profile yet
      website: ''
    };
    
    request.social_media_links = socialMediaLinks;
    // Add borrower_company to the request object
    (request as any).borrower_company = (request as any).borrower_company || null;
    return request;
  });
}

/**
 * Get all active loan requests for lenders to browse
 */
export async function getActiveLoanRequests(): Promise<LoanRequestWithBorrower[]> {
  const query = `
    SELECT lr.*,
           CONCAT(u.first_name, ' ', u.last_name) AS borrower_name,
           u.company AS borrower_company,
           bp.website,
           bp.linkedin,
           cv.company_name AS company_name
    FROM loan_requests lr
           JOIN users u ON lr.borrower_id = u.id
           LEFT JOIN borrower_profiles bp ON u.id = bp.user_id
           LEFT JOIN company_values cv ON lr.company_id = cv.id
    WHERE lr.status = 'pending'
      AND (lr.expires_at IS NULL OR lr.expires_at > NOW())
      AND u.is_active = 1
    ORDER BY lr.created_at DESC
  `;
  
  const result = await executeQuery<LoanRequestWithBorrower>(query, []);
  
  return result.map(request => {
    if (request.social_media_links) {
      try {
        // Handle case where it's already an object or "[object Object]"
        if (typeof request.social_media_links === 'object') {
          // Already parsed, keep as is
        } else if (typeof request.social_media_links === 'string') {
          if (request.social_media_links === '[object Object]') {
            request.social_media_links = {
              linkedin: '',
              twitter: '',
              facebook: '',
              instagram: '',
              website: ''
            };
          } else {
            request.social_media_links = JSON.parse(request.social_media_links);
          }
        }
      } catch (e) {
        request.social_media_links = {
          linkedin: '',
          twitter: '',
          facebook: '',
          instagram: '',
          website: ''
        };
      }
    } else {
      request.social_media_links = {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: '',
        website: ''
      };
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
    'loan_purpose', 'loan_type', 'status', 'expires_at'
  ];
  
  const setFields: string[] = [];
  const params: any[] = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      setFields.push(`${key} = ?`);
      params.push(value);
    }
  }
  
  if (setFields.length === 0) return false;
  
  setFields.push('updated_at = NOW()');
  params.push(id);
  
  const query = `UPDATE loan_requests SET ${setFields.join(', ')} WHERE id = ?`;
  const result = await executeSingleQuery(query, params);
  
  return result.affectedRows > 0;
}

/**
 * Close a loan request (admin action)
 */
export async function closeLoanRequest(id: number, adminId: number, reason?: string): Promise<boolean> {
  // First get the current status to store as original_status
  const currentRequest = await getLoanRequestById(id);
  if (!currentRequest) return false;
  const query = `
    UPDATE loan_requests 
    SET status = 'closed', original_status = ?, closed_by = ?, closed_at = NOW(), closed_reason = ?, updated_at = NOW()
    WHERE id = ? AND status IN ('pending', 'funded')
  `;
  
  const result = await executeSingleQuery(query, [currentRequest.status, adminId, reason || null, id]);
  return result.affectedRows > 0;
}

/**
 * Restore a closed loan request (admin action)
 */
export async function restoreLoanRequest(id: number): Promise<boolean> {
  const query = `
    UPDATE loan_requests 
    SET status = 'pending', closed_by = NULL, closed_at = NULL, closed_reason = NULL, updated_at = NOW()
    WHERE id = ? AND status = 'closed'
  `;
  
  const result = await executeSingleQuery(query, [id]);
  return result.affectedRows > 0;
}

/**
 * Delete a loan request
 */
export async function deleteLoanRequest(id: number): Promise<boolean> {
  const query = 'DELETE FROM loan_requests WHERE id = ?';
  const result = await executeSingleQuery(query, [id]);
  return result.affectedRows > 0;
}

/**
 * Get loan requests by status
 */
export async function getLoanRequestsByStatus(status: LoanRequest['status']): Promise<LoanRequest[]> {
  const query = `
    SELECT lr.*, bp.website, bp.linkedin
    FROM loan_requests lr
    JOIN users u ON lr.borrower_id = u.id
    LEFT JOIN borrower_profiles bp ON u.id = bp.user_id
    WHERE lr.status = ?
    ORDER BY lr.created_at DESC
  `;
  const result = await executeQuery<LoanRequest & { website?: string; linkedin?: string }>(query, [status]);
  
  return result.map(request => {
    const socialMediaLinks = {
      linkedin: (request as any).linkedin || '',
      twitter: '', 
      facebook: '', 
      instagram: '',
      website: (request as any).website || ''
    };
    
    request.social_media_links = socialMediaLinks;
    return request;
  });
}

/**
 * Get loan requests by loan type
 */
export async function getLoanRequestsByType(loanType: LoanRequest['loan_type']): Promise<LoanRequest[]> {
  const query = `
    SELECT lr.*, bp.website, bp.linkedin
    FROM loan_requests lr
    JOIN users u ON lr.borrower_id = u.id
    LEFT JOIN borrower_profiles bp ON u.id = bp.user_id
    WHERE lr.loan_type = ? AND lr.status = "pending"
    ORDER BY lr.created_at DESC
  `;
  const result = await executeQuery<LoanRequest & { website?: string; linkedin?: string }>(query, [loanType]);
  
  return result.map(request => {
    const socialMediaLinks = {
      linkedin: (request as any).linkedin || '',
      twitter: '', 
      facebook: '', 
      instagram: '',
      website: (request as any).website || ''
    };
    
    request.social_media_links = socialMediaLinks;
    return request;
  });
}

/**
 * Get all loan requests for admin view
 */
export async function getAllLoanRequests(): Promise<LoanRequestWithBorrower[]> {
  const query = `
    SELECT lr.*, 
           CONCAT(u.first_name, ' ', u.last_name) as borrower_name,
           u.company as borrower_company,
           bp.website,
           bp.linkedin,
           lr.funded_by,
           lr.funded_at,
           CONCAT(lender.first_name, ' ', lender.last_name) as funded_by_name
    FROM loan_requests lr
    JOIN users u ON lr.borrower_id = u.id
    LEFT JOIN borrower_profiles bp ON u.id = bp.user_id
    LEFT JOIN users lender ON lr.funded_by = lender.id
    WHERE lr.status != 'closed'
    ORDER BY lr.created_at DESC
  `;
  
  const result = await executeQuery<LoanRequest & { borrower_name: string; borrower_company?: string; website?: string; linkedin?: string; funded_by?: number; funded_at?: Date; funded_by_name?: string }>(query, []);
  
  return result.map(request => {
    const socialMediaLinks = {
      linkedin: (request as any).linkedin || '',
      twitter: '', 
      facebook: '', 
      instagram: '',
      website: (request as any).website || ''
    };
    
    request.social_media_links = socialMediaLinks;
    return request;
  });
}

/**
 * Get archived (closed) loan requests for admin view
 */
export async function getArchivedLoanRequests(): Promise<LoanRequestWithBorrower[]> {
  const query = `
    SELECT lr.*, 
           CONCAT(u.first_name, ' ', u.last_name) as borrower_name,
           u.company as borrower_company,
           bp.website,
           bp.linkedin,
           CONCAT(admin.first_name, ' ', admin.last_name) as closed_by_name
    FROM loan_requests lr
    JOIN users u ON lr.borrower_id = u.id
    LEFT JOIN borrower_profiles bp ON u.id = bp.user_id
    LEFT JOIN users admin ON lr.closed_by = admin.id
    WHERE lr.status = 'closed'
    ORDER BY lr.closed_at DESC
  `;
  
  const result = await executeQuery<LoanRequest & { borrower_name: string; borrower_company?: string; website?: string; linkedin?: string; closed_by_name?: string }>(query, []);
  
  return result.map(request => {
    const socialMediaLinks = {
      linkedin: (request as any).linkedin || '',
      twitter: '', 
      facebook: '', 
      instagram: '',
      website: (request as any).website || ''
    };
    
    request.social_media_links = socialMediaLinks;
    
    // If no original_status is stored, use current status (for backward compatibility)
    if (!request.original_status) {
      request.original_status = request.status;
    }
    
    return request;
  });
}

/**
 * Get loan requests within a price range
 */
export async function getLoanRequestsByAmountRange(minAmount: number, maxAmount: number, currency: string = 'USD'): Promise<LoanRequest[]> {
  const query = `
    SELECT lr.*, bp.website, bp.linkedin
    FROM loan_requests lr
    JOIN users u ON lr.borrower_id = u.id
    LEFT JOIN borrower_profiles bp ON u.id = bp.user_id
    WHERE lr.amount_requested BETWEEN ? AND ? 
    AND lr.currency = ? 
    AND lr.status = "pending"
    ORDER BY lr.amount_requested ASC
  `;
  
  const result = await executeQuery<LoanRequest & { website?: string; linkedin?: string }>(query, [minAmount, maxAmount, currency]);
  
  return result.map(request => {
    const socialMediaLinks = {
      linkedin: (request as any).linkedin || '',
      twitter: '', 
      facebook: '', 
      instagram: '',
      website: (request as any).website || ''
    };
    
    request.social_media_links = socialMediaLinks;
    return request;
  });
}

/**
 * Get funded loans by lender ID
 */
export async function getFundedLoansByLender(lenderId: number): Promise<LoanRequestWithBorrower[]> {
  const query = `
    SELECT
      lr.*,
      u.first_name as borrower_name,
      u.company as borrower_company,
      lr.funded_by,
      lr.funded_at,
      lender.first_name as funded_by_name,
      cv.company_name
    FROM loan_requests lr
           JOIN users u ON lr.borrower_id = u.id
           LEFT JOIN users lender ON lr.funded_by = lender.id
           LEFT JOIN company_values cv ON lr.company_id = cv.id
    WHERE lr.funded_by = ?
      AND lr.status = 'funded'
    ORDER BY lr.funded_at DESC
  `;
  
  return await executeQuery<LoanRequestWithBorrower>(query, [lenderId]);
}

/**
 * Update loan request to mark as funded by a specific lender
 */
export async function fundLoanRequest(loanRequestId: number, lenderId: number): Promise<boolean> {
  try {
    const query = `
      UPDATE loan_requests 
      SET status = 'funded', funded_by = ?, funded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'pending'
    `;
    
    const result = await executeSingleQuery(query, [lenderId, loanRequestId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error funding loan request:', error);
    return false;
  }
}


/**
 * Admin override: Assign a lender to a loan request (for historical cleanup or corrections)
 * Does not change current status; sets funded_by and funded_at if not already set
 */
export async function assignFunderToLoanRequest(loanRequestId: number, lenderId: number): Promise<boolean> {
  try {
    const query = `
      UPDATE loan_requests 
      SET funded_by = ?, funded_at = COALESCE(funded_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeSingleQuery(query, [lenderId, loanRequestId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error assigning funder to loan request:', error);
    return false;
  }
}

export async function getLoanCountById(userId: number): Promise<number> {
  try {
    // Use alias for predictable property name
    const query = `SELECT COUNT(*) as loan_count FROM loan_requests WHERE borrower_id = ?`;
    const result = await executeSingleQuery(query, [userId]);

    // Access the aliased property
    return Number(result[0]?.loan_count) || 0;
  } catch (error) {
    console.error('Error obtaining Loan Request Count', error);
    return 0;
  }
}
