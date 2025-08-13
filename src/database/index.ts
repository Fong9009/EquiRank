import { pool } from './config';

//Quick Startup Test
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

// Execute a query with parameters
export async function executeQuery<T = any>(
    query: string,
    params?: any[]
): Promise<T[]> {
    try {
        const [rows] = await pool.execute(query, params);
        return rows as T[];
    } catch (error) {
        console.error('Query execution failed:', error);
        throw error;
    }
}

// Execute a single query (for INSERT, UPDATE, DELETE)
export async function executeSingleQuery(
    query: string,
    params?: any[]
): Promise<any> {
    try {
        const [result] = await pool.execute(query, params);
        return result;
    } catch (error) {
        console.error('Single query execution failed:', error);
        throw error;
    }
}

// Get a connection from the pool
export async function getConnection() {
    return await pool.getConnection();
}

// Close the connection pool
export async function closePool() {
    await pool.end();
}

export { pool };