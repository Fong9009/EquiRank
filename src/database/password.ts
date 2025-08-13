import { executeQuery, executeSingleQuery } from './index';

export interface Password {
    id: number;
    user_id: number;
    token: string;
    used: boolean;
    created_at: Date;
}

export async function insertToken(
    user_id : number,
    token: string,
    expires_at: Date,
): Promise<number> {
    const query = 'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
    const result = await executeSingleQuery(query, [user_id, token, expires_at]);
    return result.insertId;
}

export async function deleteToken(user_id: number): Promise<boolean> {
    const query = `DELETE FROM password_reset_tokens WHERE user_id = ?`;
    const result = await executeSingleQuery(query, [user_id]);
    return result.affectedRows > 0;
}

//verify token
export async function verifyToken(token: string): Promise<Password | null> {
    const query = `
        SELECT prt.id, prt.user_id, prt.expires_at, prt.used, u.email
        FROM password_reset_tokens prt
                 JOIN users u ON prt.user_id = u.id
        WHERE prt.token = ?
    `;
    const results = await executeQuery<Password>(query, [token]);

    return results.length > 0 ? results[0] : null;
}

export async function markToken(id: number): Promise<boolean> {
    const query = `UPDATE password_reset_tokens SET used = TRUE WHERE id = ?`
    const result = await executeSingleQuery(query, [id]);
    return result.affectedRows > 0;
}