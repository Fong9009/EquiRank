import mysql from 'mysql2/promise';

/* DATABASE CONNECTION & CONFIGURATION */
//Params for TS compliance
interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
    waitForConnections: boolean;
    connectionLimit: number;
    queueLimit: number;
    ssl?: any;
}

//Used to ensure Environment Variables are in the env File on startup
function validateEnvironmentVariables() {
    const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
    const missing = required.filter(key => !process.env[key]);

    //DB_PASSWORD can be empty (no password)
    if (missing.length > 0) {
        throw new Error(`Missing the following environment variables: ${missing.join(', ')}`);
    }

    //Check if DB_PASSWORD exists (even if empty)
    if (process.env.DB_PASSWORD === undefined) {
        throw new Error('Missing the following environment variables: DB_PASSWORD');
    }

    // Validate DB_PORT if provided
    const dbPort = parseInt(process.env.DB_PORT || '3306');
    if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
        throw new Error('Invalid DB_PORT: must be between 1-65535');
    }

    // Validate connection limits
    const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '10');
    if (isNaN(connectionLimit) || connectionLimit < 1 || connectionLimit > 100) {
        throw new Error('Invalid DB_CONNECTION_LIMIT: must be between 1-100');
    }
}

// Lazy initialization to avoid validation during import
let _dbConfig: DatabaseConfig | null = null;
let _pool: mysql.Pool | null = null;

function getDbConfig(): DatabaseConfig {
    if (!_dbConfig) {
        // Validate environment variables first
        validateEnvironmentVariables();

        _dbConfig = {
            host: process.env.DB_HOST!,
            user: process.env.DB_USER!,
            password: process.env.DB_PASSWORD!,
            database: process.env.DB_NAME!,
            port: parseInt(process.env.DB_PORT || '3306'),
            waitForConnections: true,
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
            queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0'),
        };

        // Add SSL configuration for production: enforce TLS unless explicitly disabled
        if (process.env.NODE_ENV === 'production') {
            const sslEnabled = process.env.DB_SSL_ENABLED !== 'false';
            if (sslEnabled) {
                _dbConfig.ssl = {
                    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
                    ca: process.env.DB_SSL_CA,
                    cert: process.env.DB_SSL_CERT,
                    key: process.env.DB_SSL_KEY,
                };
            }
        }
    }
    return _dbConfig;
}

function getPool(): mysql.Pool {
    if (!_pool) {
        _pool = mysql.createPool(getDbConfig());
    }
    return _pool;
}

// Export getter functions for lazy initialization
export const dbConfig = new Proxy({} as DatabaseConfig, {
    get(target, prop) {
        return getDbConfig()[prop as keyof DatabaseConfig];
    }
});

// Export pool getter for lazy initialization
export const pool = new Proxy({} as mysql.Pool, {
    get(target, prop) {
        return getPool()[prop as keyof mysql.Pool];
    }
});