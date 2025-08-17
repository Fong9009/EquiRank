import { executeQuery, executeSingleQuery } from './index';


export interface User {
    id: number;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    user_type: 'borrower' | 'lender' | 'admin';
    entity_type: 'company' | 'individual';
    company?: string;
    phone?: string;
    address?: string;
    is_active: boolean;
    is_approved: boolean;
    is_super_admin?: boolean;
    created_at: Date;
    updated_at: Date;
}


export async function createUser(
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    userType: 'borrower' | 'lender' | 'admin',
    entityType: 'company' | 'individual',
    company?: string,
    phone?: string,
    address?: string
): Promise<number> {
    const query = `
    INSERT INTO users (email, password_hash, first_name, last_name, user_type, entity_type, company, phone, address, is_approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, false)
  `;
    const result = await executeSingleQuery(query, [email, passwordHash, firstName, lastName, userType, entityType, company, phone, address]);
    return result.insertId;
}

// Create admin with immediate approval
export async function createAdminUser(
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    entityType: 'company' | 'individual' = 'company',
    company?: string,
    phone?: string,
    address?: string
): Promise<number> {
    const query = `
    INSERT INTO users (email, password_hash, first_name, last_name, user_type, entity_type, company, phone, address, is_approved)
    VALUES (?, ?, ?, ?, 'admin', ?, ?, ?, ?, true)
  `;
    const result = await executeSingleQuery(query, [
        email,
        passwordHash,
        firstName,
        lastName,
        entityType,
        company ?? null,
        phone ?? null,
        address ?? null,
    ]);
    return result.insertId;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const query = `
    SELECT * FROM users 
    WHERE email = ? AND is_active = true
  `;
    const results = await executeQuery<User>(query, [email]);
    return results.length > 0 ? results[0] : null;
}

// Get user by email including inactive users
export async function getUserByEmailAny(email: string): Promise<User | null> {
    const query = `
    SELECT * FROM users 
    WHERE email = ?
  `;
    const results = await executeQuery<User>(query, [email]);
    return results.length > 0 ? results[0] : null;
}


// Check if email exists (including inactive users)
export async function emailExists(email: string): Promise<boolean> {
    const query = `
    SELECT COUNT(*) as count FROM users 
    WHERE email = ?
  `;
    const results = await executeQuery<{count: number}>(query, [email]);
    return results[0]?.count > 0;
}

export async function getUserByEmailId(email: string): Promise<{ id: number; email: string } | null> {
    const query = `
        SELECT id, email FROM users
        WHERE email = ?
    `;
    const results = await executeQuery<{ id: number; email: string }>(query, [email]);

    // Return the first matching user or null if none found
    return results.length > 0 ? results[0] : null;
}


// Check if email exists for active users only
export async function activeEmailExists(email: string): Promise<boolean> {
    const query = `
    SELECT COUNT(*) as count FROM users 
    WHERE email = ? AND is_active = true
  `;
    const results = await executeQuery<{count: number}>(query, [email]);
    return results[0]?.count > 0;
}

export async function getUserById(id: number): Promise<User | null> {
    const query = `
    SELECT * FROM users 
    WHERE id = ? AND is_active = true
  `;
    const results = await executeQuery<User>(query, [id]);
    return results.length > 0 ? results[0] : null;
}

export async function getUserByIdAny(id: number): Promise<User | null> {
    const query = `
    SELECT * FROM users 
    WHERE id = ?
  `;
    const results = await executeQuery<User>(query, [id]);
    return results.length > 0 ? results[0] : null;
}

export async function updateUser(
    id: number,
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    const query = `
    UPDATE users 
    SET ${fields}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

    const result = await executeSingleQuery(query, [...values, id]);
    return result.affectedRows > 0;
}

export async function promoteUserToAdmin(id: number): Promise<boolean> {
    const query = `
    UPDATE users
    SET user_type = 'admin', is_approved = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
    const result = await executeSingleQuery(query, [id]);
    return result.affectedRows > 0;
}

export async function deactivateUser(id: number): Promise<boolean> {
    const query = `
    UPDATE users 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

    const result = await executeSingleQuery(query, [id]);
    return result.affectedRows > 0;
}

export async function getAllUsers(): Promise<User[]> {
    const query = `
    SELECT * FROM users 
    ORDER BY created_at DESC
  `;
    return await executeQuery<User>(query);
}

export async function getAllActiveUsers(): Promise<User[]> {
    const query = `
    SELECT id,email,first_name,last_name,user_type,entity_type,company,phone,address,is_super_admin FROM users
    WHERE is_active = 1
    ORDER by first_name DESC`;
    return await executeQuery<User>(query);
}

export async function getAllArchivedUsers(): Promise<User[]> {
    const query = `
    SELECT id,email,first_name,last_name,user_type,entity_type,company,phone,address,is_super_admin,created_at,updated_at FROM users
    WHERE is_active = 0
    ORDER BY first_name DESC`;
    return await executeQuery<User>(query);
}

export async function archiveUser(userId: number, archived: boolean): Promise<boolean> {
    const query = `
    UPDATE users
    SET is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;
    const result = await executeSingleQuery(query, [archived ? 0 : 1, userId]);
    return result.affectedRows > 0;
}

export async function getApprovalUsers(): Promise<User[]> {
    const query = `
    SELECT * FROM users
    WHERE is_approved = 0`;

    return await executeQuery<User>(query);
}

export async function getUsersByType(userType: 'borrower' | 'lender' | 'admin'): Promise<User[]> {
    const query = `
    SELECT * FROM users 
    WHERE user_type = ? AND is_active = true
    ORDER BY created_at DESC
  `;
    return await executeQuery<User>(query, [userType]);
}


export async function getBorrowers(): Promise<User[]> {
    return await getUsersByType('borrower');
}

export async function getLenders(): Promise<User[]> {
    return await getUsersByType('lender');
}

export async function getAdmins(): Promise<User[]> {
    return await getUsersByType('admin');
}

// Get users pending approval
export async function getPendingApprovals(): Promise<User[]> {
    const query = `
    SELECT * FROM users 
    WHERE is_approved = false AND is_active = true AND user_type != 'admin'
    ORDER BY created_at ASC
  `;
    return await executeQuery<User>(query);
}

// Approve a user
export async function approveUser(userId: number): Promise<boolean> {
    const query = `
    UPDATE users 
    SET is_approved = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
    const result = await executeSingleQuery(query, [userId]);
    return result.affectedRows > 0;
}

// Reject a user (deactivate)
export async function rejectUser(userId: number): Promise<boolean> {
    const query = `
    UPDATE users 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
    const result = await executeSingleQuery(query, [userId]);
    return result.affectedRows > 0;
}

export async function clearFailedLoginAttempt(resetTokenUserId: number): Promise<boolean> {
    const query = `UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE id = ?`
    const result = await executeSingleQuery(query, [resetTokenUserId]);
    return result.affectedRows > 0;
}

//Updating Users
export async function updateUserByID(email:string, first_name:string, last_name:string, phone:string, address:string, userId: number ): Promise<boolean> {
    const query = `
    UPDATE users
    SET email = ?, first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?`;
    const result = await executeSingleQuery(query, [email, first_name, last_name, phone, address, userId]);
    return result.affectedRows > 0;
}

export async function updateUserPassword(hashedPassword:string,userId: number): Promise<boolean> {
    const query = `UPDATE users SET password_hash = ? WHERE id = ?`
    const result = await executeSingleQuery(query, [hashedPassword, userId]);
    return result.affectedRows > 0;
}

export async function deleteUserById(userId: number): Promise<boolean> {
    const query = `DELETE FROM users WHERE id = ?`;
    const result = await executeSingleQuery(query, [userId]);
    return result.affectedRows > 0;
}