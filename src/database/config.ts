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
}

validateEnvironmentVariables();

const defaultConfig: DatabaseConfig = {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

//Create connection pool
export const pool = mysql.createPool(defaultConfig);