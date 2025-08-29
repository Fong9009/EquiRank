import { executeQuery } from './index';

export interface CompanyStatistics {
  id?: number;
  user_id: number;
  annual_revenue?: number;
  employee_count?: number;
  years_in_business?: number;
  credit_score?: number;
  industry?: string;
  financial_ratios?: {
    debt_to_equity?: number;
    current_ratio?: number;
    quick_ratio?: number;
    return_on_equity?: number;
    profit_margin?: number;
  } | null;
  last_updated?: Date;
}

export interface CompanyStatisticsWithUser extends CompanyStatistics {
  company_name?: string;
  entity_type: 'company' | 'individual';
  first_name: string;
  last_name: string;
}

/**
 * Create or update company statistics
 */
export async function upsertCompanyStatistics(stats: Omit<CompanyStatistics, 'id' | 'last_updated'>): Promise<boolean> {
  // Check if statistics already exist for this user
  const existing = await getCompanyStatisticsByUserId(stats.user_id);
  
  if (existing) {
    // Update existing
    return updateCompanyStatistics(stats.user_id, stats);
  } else {
    // Create new
    const query = `
      INSERT INTO company_statistics (
        user_id, annual_revenue, employee_count, years_in_business,
        credit_score, industry, financial_ratios
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      stats.user_id,
      stats.annual_revenue || null,
      stats.employee_count || null,
      stats.years_in_business || null,
      stats.credit_score || null,
      stats.industry || null,
      stats.financial_ratios ? JSON.stringify(stats.financial_ratios) : null
    ];

    const result = await executeQuery<{ affectedRows: number }>(query, params);
    return result[0]?.affectedRows > 0;
  }
}

/**
 * Get company statistics by user ID
 */
export async function getCompanyStatisticsByUserId(userId: number): Promise<CompanyStatistics | null> {
  const query = 'SELECT * FROM company_statistics WHERE user_id = ?';
  const result = await executeQuery<CompanyStatistics>(query, [userId]);
  
  if (result.length === 0) return null;
  
  const stats = result[0];
  if (stats.financial_ratios) {
    try {
      stats.financial_ratios = JSON.parse(stats.financial_ratios as any);
    } catch (e) {
      stats.financial_ratios = null;
    }
  }
  
  return stats;
}

/**
 * Get public company statistics for a user (for lenders to view)
 */
export async function getPublicCompanyStatistics(userId: number): Promise<CompanyStatisticsWithUser | null> {
  const query = `
    SELECT cs.*, u.company as company_name, u.entity_type, u.first_name, u.last_name
    FROM company_statistics cs
    JOIN users u ON cs.user_id = u.id
    WHERE cs.user_id = ? AND u.is_active = 1
  `;
  
  const result = await executeQuery<CompanyStatisticsWithUser>(query, [userId]);
  
  if (result.length === 0) return null;
  
  const stats = result[0];
  if (stats.financial_ratios) {
    try {
      stats.financial_ratios = JSON.parse(stats.financial_ratios as any);
    } catch (e) {
      stats.financial_ratios = null;
    }
  }
  
  return stats;
}

/**
 * Update company statistics
 */
export async function updateCompanyStatistics(userId: number, updates: Partial<CompanyStatistics>): Promise<boolean> {
  const allowedFields = [
    'annual_revenue', 'employee_count', 'years_in_business',
    'credit_score', 'industry', 'financial_ratios'
  ];
  
  const setFields: string[] = [];
  const params: any[] = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      setFields.push(`${key} = ?`);
      if (key === 'financial_ratios' && value) {
        params.push(JSON.stringify(value));
      } else {
        params.push(value);
      }
    }
  }
  
  if (setFields.length === 0) return false;
  
  setFields.push('last_updated = NOW()');
  params.push(userId);
  
  const query = `UPDATE company_statistics SET ${setFields.join(', ')} WHERE user_id = ?`;
  const result = await executeQuery<{ affectedRows: number }>(query, params);
  
  return result[0]?.affectedRows > 0;
}

/**
 * Delete company statistics
 */
export async function deleteCompanyStatistics(userId: number): Promise<boolean> {
  const query = 'DELETE FROM company_statistics WHERE user_id = ?';
  const result = await executeQuery<{ affectedRows: number }>(query, [userId]);
  
  return result[0]?.affectedRows > 0;
}

/**
 * Get company statistics by industry
 */
export async function getCompanyStatisticsByIndustry(industry: string): Promise<CompanyStatisticsWithUser[]> {
  const query = `
    SELECT cs.*, u.company as company_name, u.entity_type, u.first_name, u.last_name
    FROM company_statistics cs
    JOIN users u ON cs.user_id = u.id
    WHERE cs.industry = ? AND u.is_active = 1
    ORDER BY cs.annual_revenue DESC
  `;
  
  const result = await executeQuery<CompanyStatisticsWithUser>(query, [industry]);
  
  return result.map(stats => {
    if (stats.financial_ratios) {
      try {
        stats.financial_ratios = JSON.parse(stats.financial_ratios as any);
      } catch (e) {
        stats.financial_ratios = null;
      }
    }
    return stats;
  });
}

/**
 * Get company statistics by revenue range
 */
export async function getCompanyStatisticsByRevenueRange(minRevenue: number, maxRevenue: number): Promise<CompanyStatisticsWithUser[]> {
  const query = `
    SELECT cs.*, u.company as company_name, u.entity_type, u.first_name, u.last_name
    FROM company_statistics cs
    JOIN users u ON cs.user_id = u.id
    WHERE cs.annual_revenue BETWEEN ? AND ? AND u.is_active = 1
    ORDER BY cs.annual_revenue DESC
  `;
  
  const result = await executeQuery<CompanyStatisticsWithUser>(query, [minRevenue, maxRevenue]);
  
  return result.map(stats => {
    if (stats.financial_ratios) {
      try {
        stats.financial_ratios = JSON.parse(stats.financial_ratios as any);
      } catch (e) {
        stats.financial_ratios = null;
      }
    }
    return stats;
  });
}

/**
 * Get company statistics by employee count range
 */
export async function getCompanyStatisticsByEmployeeRange(minEmployees: number, maxEmployees: number): Promise<CompanyStatisticsWithUser[]> {
  const query = `
    SELECT cs.*, u.company as company_name, u.entity_type, u.first_name, u.last_name
    FROM company_statistics cs
    JOIN users u ON cs.user_id = u.id
    WHERE cs.employee_count BETWEEN ? AND ? AND u.is_active = 1
    ORDER BY cs.employee_count DESC
  `;
  
  const result = await executeQuery<CompanyStatisticsWithUser>(query, [minEmployees, maxEmployees]);
  
  return result.map(stats => {
    if (stats.financial_ratios) {
      try {
        stats.financial_ratios = JSON.parse(stats.financial_ratios as any);
      } catch (e) {
        stats.financial_ratios = null;
      }
    }
    return stats;
  });
}

/**
 * Get all company statistics with user information
 */
export async function getAllCompanyStatistics(): Promise<CompanyStatisticsWithUser[]> {
  const query = `
    SELECT cs.*, u.company as company_name, u.entity_type, u.first_name, u.last_name
    FROM company_statistics cs
    JOIN users u ON cs.user_id = u.id
    WHERE u.is_active = 1
    ORDER BY cs.last_updated DESC
  `;
  
  const result = await executeQuery<CompanyStatisticsWithUser>(query, []);
  
  return result.map(stats => {
    if (stats.financial_ratios) {
      try {
        stats.financial_ratios = JSON.parse(stats.financial_ratios as any);
      } catch (e) {
        stats.financial_ratios = null;
      }
    }
    return stats;
  });
}
