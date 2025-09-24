import { executeQuery, executeSingleQuery } from './index';

// Borrower Profile Interface
export interface BorrowerProfile {
    id: number;
    user_id: number;
    industry?: string;
    location?: string;
    capabilities?: string;
    years_in_business?: number;
    employee_count?: number;
    revenue_range?: string;
    company_description?: string;
    website?: string;
    linkedin?: string;
    preferences?: any;
    qa_rating?: number;
    company_logo?: string;
    qa_rating_updated_at?: string;
    profile_completion_percentage: number;
    profile_completed_at?: string;
    profile_completion_required: boolean;
    created_at: Date;
    updated_at: Date;
}

// Lender Profile Interface
export interface LenderProfile {
    id: number;
    user_id: number;
    institution_type?: string;
    risk_appetite?: string;
    target_industries?: string[];
    target_markets?: string[];
    min_loan_amount?: number;
    max_loan_amount?: number;
    website?: string;
    linkedin?: string;
    preferences?: any;
    tolerance_bands?: any; // JSON object with ratio ranges and minima
    created_at: Date;
    updated_at: Date;
}

// Admin Profile Interface
export interface AdminProfile {
    id: number;
    user_id: number;
    admin_level: 'super_admin' | 'admin' | 'moderator';
    website?: string;
    linkedin?: string;
    preferences?: any;
    created_at: Date;
    updated_at: Date;
}

// Get borrower profile by user ID
export async function getBorrowerProfile(userId: number): Promise<BorrowerProfile | null> {
    const query = `
        SELECT * FROM borrower_profiles 
        WHERE user_id = ?
    `;
    const results = await executeQuery<BorrowerProfile>(query, [userId]);
    return results.length > 0 ? results[0] : null;
}

// Get lender profile by user ID
export async function getLenderProfile(userId: number): Promise<LenderProfile | null> {
    const query = `
        SELECT * FROM lender_profiles 
        WHERE user_id = ?
    `;
    const results = await executeQuery<LenderProfile>(query, [userId]);
    return results.length > 0 ? results[0] : null;
}

// Get admin profile by user ID
export async function getAdminProfile(userId: number): Promise<AdminProfile | null> {
    const query = `
        SELECT * FROM admin_profiles 
        WHERE user_id = ?
    `;
    const results = await executeQuery<AdminProfile>(query, [userId]);
    return results.length > 0 ? results[0] : null;
}

// Create borrower profile
export async function createBorrowerProfile(userId: number, profileData: Partial<BorrowerProfile>): Promise<boolean> {
    const fields = ['user_id'];
    const values = [userId];
    
    Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
            fields.push(key);
            values.push(value);
        }
    });
    
    const query = `
        INSERT INTO borrower_profiles (${fields.join(', ')}) 
        VALUES (${fields.map(() => '?').join(', ')})
    `;
    
    try {
        await executeSingleQuery(query, values);
        return true;
    } catch (error) {
        console.error('Error creating borrower profile:', error);
        return false;
    }
}

// Create lender profile
export async function createLenderProfile(userId: number, profileData: Partial<LenderProfile>): Promise<boolean> {
    const fields = ['user_id'];
    const values = [userId];
    
    Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
            fields.push(key);
            values.push(value);
        }
    });
    
    const query = `
        INSERT INTO lender_profiles (${fields.join(', ')}) 
        VALUES (${fields.map(() => '?').join(', ')})
    `;
    
    try {
        await executeSingleQuery(query, values);
        return true;
    } catch (error) {
        console.error('Error creating lender profile:', error);
        return false;
    }
}

// Create admin profile
export async function createAdminProfile(userId: number, profileData: Partial<AdminProfile>): Promise<boolean> {
    const fields = ['user_id'];
    const values = [userId];
    
    Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
            fields.push(key);
            values.push(value);
        }
    });
    
    const query = `
        INSERT INTO admin_profiles (${fields.join(', ')}) 
        VALUES (${fields.map(() => '?').join(', ')})
    `;
    
    try {
        await executeSingleQuery(query, values);
        return true;
    } catch (error) {
        console.error('Error creating admin profile:', error);
        return false;
    }
}

// Update borrower profile
export async function updateBorrowerProfile(userId: number, profileData: Partial<BorrowerProfile>): Promise<boolean> {
    const allowed: Array<keyof BorrowerProfile> = [
        'industry','location','capabilities','years_in_business','employee_count','revenue_range',
        'company_description','qa_rating','company_logo',
        'website','linkedin','preferences','profile_completion_percentage','profile_completed_at','profile_completion_required'
    ];
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(profileData).forEach(([key, rawValue]) => {
        if (!(allowed as string[]).includes(key)) return;
        let value: any = rawValue;
        // Normalize empty strings to NULL for enum/number fields
        if ((key === 'revenue_range' || key === 'years_in_business' || key === 'employee_count') && (value === '' as any)) {
            value = null;
        }
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });
    
    if (fields.length === 0) return false;
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    
    const query = `
        UPDATE borrower_profiles 
        SET ${fields.join(', ')}
        WHERE user_id = ?
    `;
    
    values.push(userId);
    
    try {
        const result = await executeSingleQuery(query, values);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating borrower profile:', error);
        return false;
    }
}

// Update lender profile
export async function updateLenderProfile(userId: number, profileData: Partial<LenderProfile>): Promise<boolean> {
    const allowed: Array<keyof LenderProfile> = [
        'institution_type','risk_appetite','target_industries','target_markets','min_loan_amount','max_loan_amount',
        'website','linkedin','preferences'
    ];
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && (allowed as string[]).includes(key)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });
    
    if (fields.length === 0) return false;
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    
    const query = `
        UPDATE lender_profiles 
        SET ${fields.join(', ')}
        WHERE user_id = ?
    `;
    
    values.push(userId);
    
    try {
        const result = await executeSingleQuery(query, values);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating lender profile:', error);
        return false;
    }
}

// Update admin profile
export async function updateAdminProfile(userId: number, profileData: Partial<AdminProfile>): Promise<boolean> {
    const allowed: Array<keyof AdminProfile> = [
        'admin_level','website','linkedin','preferences'
    ];
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && (allowed as string[]).includes(key)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });
    
    if (fields.length === 0) return false;
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    
    const query = `
        UPDATE admin_profiles 
        SET ${fields.join(', ')}
        WHERE user_id = ?
    `;
    
    values.push(userId);
    
    try {
        const result = await executeSingleQuery(query, values);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating admin profile:', error);
        return false;
    }
}

// Calculate profile completion percentage
export function calculateProfileCompletion(userType: string, profileData: any): number {
    // Lenders and admins don't need profile completion - they can access everything immediately
    if (userType === 'lender' || userType === 'admin') {
        return 100;
    }
    
    let completedFields = 0;
    let totalFields = 0;
    const missingFields: string[] = [];
    
    // Basic required fields (always required)
    const basicFields = ['first_name', 'last_name', 'email', 'company', 'phone', 'address'];
    basicFields.forEach(field => {
        totalFields++;
        if (profileData[field] && profileData[field].toString().trim() !== '') {
            completedFields++;
        } else {
            missingFields.push(field);
        }
    });
    
    // Common profile fields (optional but counted for completion)
    const commonFields = ['website', 'linkedin'];
    commonFields.forEach(field => {
        totalFields++;
        if (profileData[field] && profileData[field].toString().trim() !== '') {
            completedFields++;
        } else {
            missingFields.push(field);
        }
    });
    
    if (userType === 'borrower') {
        const borrowerFields = ['industry', 'location', 'capabilities', 'years_in_business', 'employee_count', 'revenue_range', 'company_description', 'qa_rating', 'company_logo'];
        borrowerFields.forEach(field => {
            totalFields++;
            if (profileData[field] && profileData[field].toString().trim() !== '') {
                completedFields++;
            } else {
                missingFields.push(field);
            }
        });
    } else if (userType === 'admin') {
        // Admins have minimal profile requirements
        const adminFields = ['admin_level'];
        adminFields.forEach(field => {
            totalFields++;
            if (profileData[field] && profileData[field].toString().trim() !== '') {
                completedFields++;
            } else {
                missingFields.push(field);
            }
        });
    }
    
    const percentage = Math.round((completedFields / totalFields) * 100);
    return percentage;
}

// Get profile completion percentage for a user
export async function getProfileCompletionPercentage(userId: number, userType: string): Promise<number> {
    try {
        let profileData: any = {};
        
        // Get basic user data
        const userQuery = `
            SELECT first_name, last_name, email, company, phone, address 
            FROM users WHERE id = ?
        `;
        const userResults = await executeQuery<any>(userQuery, [userId]);
        if (userResults.length > 0) {
            profileData = { ...profileData, ...userResults[0] };
        }
        
        // Get role-specific profile data
        if (userType === 'borrower') {
            const borrowerProfile = await getBorrowerProfile(userId);
            if (borrowerProfile) {
                profileData = { ...profileData, ...borrowerProfile };
            }
        } else if (userType === 'lender') {
            const lenderProfile = await getLenderProfile(userId);
            if (lenderProfile) {
                profileData = { ...profileData, ...lenderProfile };
            }
        } else if (userType === 'admin') {
            const adminProfile = await getAdminProfile(userId);
            if (adminProfile) {
                profileData = { ...profileData, ...adminProfile };
            }
        }
        
        return calculateProfileCompletion(userType, profileData);
    } catch (error) {
        console.error('Error calculating profile completion:', error);
        return 0;
    }
}

//Get IDS
export async function getUserIdBorrower(borrowerId: number): Promise<number | null> {
    try {
        const query = `
        SELECT user_id
        FROM borrower_profiles WHERE id = ?`;
        const result = await executeSingleQuery(query, [borrowerId]);

        return result.length > 0 ? result[0].user_id : null;
    } catch (error) {
        console.error('Error getting user id borrower:', error);
        return null;
    }
}

export async function getBorrowerID(user_id:number): Promise<{id: number} | null> {
    const query = `SELECT id FROM borrower_profiles WHERE user_id = ?`;
    const results = await executeQuery(query, [user_id]);
    return results.length > 0 ? results[0] : null;
}

export async function getLenderID(user_id:number): Promise<{id: number} | null> {
    const query = `SELECT id FROM lender_profiles WHERE user_id = ?`;
    const results = await executeQuery(query, [user_id]);
    return results.length > 0 ? results[0] : null;
}