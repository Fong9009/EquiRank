import { pool, dbConfig } from './config';

// Connection retry configuration
const RETRY_CONFIG = {
    maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
    backoffMultiplier: parseFloat(process.env.DB_BACKOFF_MULTIPLIER || '2'),
};

// Database health monitoring
let isHealthy = true;
let lastHealthCheck = Date.now();
const HEALTH_CHECK_INTERVAL = parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '30000'); // 30 seconds

//Quick Startup Test with retry logic
export async function testConnection(retries = RETRY_CONFIG.maxRetries): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const connection = await pool.getConnection();
            console.log(`✅ Database connected successfully (attempt ${attempt}/${retries})`);
            connection.release();
            
            // Update health status
            isHealthy = true;
            lastHealthCheck = Date.now();
            
            return true;
        } catch (error) {
            console.error(`❌ Database connection attempt ${attempt}/${retries} failed:`, error);
            
            if (attempt === retries) {
                isHealthy = false;
                throw error;
            }
            
            // Exponential backoff
            const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    return false;
}

// Initialize database with retry logic
export async function initializeDatabase(): Promise<boolean> {
    console.log('🚀 Initializing database connection...');
    
    try {
        await testConnection();
        console.log('✅ Database initialized successfully');
        
        // Start periodic health checks
        startHealthCheck();
        
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
}

// Periodic health check
function startHealthCheck() {
    setInterval(async () => {
        try {
            const connection = await pool.getConnection();
            connection.release();
            isHealthy = true;
            lastHealthCheck = Date.now();
        } catch (error) {
            console.error('❌ Health check failed:', error);
            isHealthy = false;
        }
    }, HEALTH_CHECK_INTERVAL);
}

// Get database health status
export function getDatabaseHealth() {
    return {
        isHealthy,
        lastHealthCheck: new Date(lastHealthCheck),
        uptime: Date.now() - lastHealthCheck,
        config: {
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            connectionLimit: dbConfig.connectionLimit,
            sslEnabled: !!dbConfig.ssl,
        }
    };
}

// Execute a query with parameters and retry logic
export async function executeQuery<T = any>(
    query: string,
    params?: any[],
    retries = 2
): Promise<T[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const [rows] = await pool.execute(query, params);
            return rows as T[];
        } catch (error) {
            console.error(`Query execution failed (attempt ${attempt}/${retries}):`, error);
            
            if (attempt === retries) {
                throw error;
            }
            
            // Check if it's a connection error that warrants a retry
            if (isConnectionError(error)) {
                console.log(`🔄 Retrying query due to connection error...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            
            // For non-connection errors, don't retry
            throw error;
        }
    }
    
    throw new Error('Query execution failed after all retry attempts');
}

// Execute a single query (for INSERT, UPDATE, DELETE) with retry logic
export async function executeSingleQuery(
    query: string,
    params?: any[],
    retries = 2
): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const [result] = await pool.execute(query, params);
            return result;
        } catch (error) {
            console.error(`Single query execution failed (attempt ${attempt}/${retries}):`, error);
            
            if (attempt === retries) {
                throw error;
            }
            
            // Check if it's a connection error that warrants a retry
            if (isConnectionError(error)) {
                console.log(`🔄 Retrying single query due to connection error...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            
            // For non-connection errors, don't retry
            throw error;
        }
    }
    
    throw new Error('Single query execution failed after all retry attempts');
}

// Check if error is a connection-related error that warrants retry
function isConnectionError(error: any): boolean {
    const connectionErrorCodes = [
        'ECONNRESET',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'PROTOCOL_CONNECTION_LOST',
        'ER_ACCESS_DENIED_ERROR',
        'ER_CONNECTION_ERROR'
    ];
    
    return connectionErrorCodes.some(code => 
        error.code === code || 
        error.message?.includes(code) ||
        error.sqlMessage?.includes(code)
    );
}

// Execute query with timeout
export async function executeQueryWithTimeout<T = any>(
    query: string,
    params?: any[],
    timeoutMs: number = 30000
): Promise<T[]> {
    const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
    );
    
    const queryPromise = executeQuery<T>(query, params);
    return Promise.race([queryPromise, timeoutPromise]);
}

// Get a connection from the pool
export async function getConnection() {
    return await pool.getConnection();
}

// Close the connection pool
export async function closePool() {
    console.log('🔄 Closing database connection pool...');
    await pool.end();
    console.log('✅ Database connection pool closed');
}

// Graceful shutdown
export async function gracefulShutdown() {
    console.log('🔄 Starting graceful database shutdown...');
    
    try {
        // Stop accepting new connections
        await pool.end();
        console.log('✅ Database shutdown completed successfully');
    } catch (error) {
        console.error('❌ Error during database shutdown:', error);
        throw error;
    }
}

export { pool };