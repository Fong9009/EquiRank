import { executeQuery, executeSingleQuery } from './index';

export interface Migration {
    id: number;
    name: string;
    sql: string;
    executed_at: Date;
    checksum: string;
}

export interface MigrationResult {
    success: boolean;
    message: string;
    migration?: Migration;
    error?: string;
}

// Migration table creation
const CREATE_MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    sql_content TEXT NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64) NOT NULL,
    INDEX idx_name (name),
    INDEX idx_executed_at (executed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Initialize migrations table
async function initializeMigrationsTable(): Promise<boolean> {
    try {
        await executeSingleQuery(CREATE_MIGRATIONS_TABLE);
        console.log('✅ Migrations table initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize migrations table:', error);
        return false;
    }
}

// Get all executed migrations
export async function getExecutedMigrations(): Promise<Migration[]> {
    try {
        const migrations = await executeQuery<Migration>('SELECT * FROM migrations ORDER BY id ASC');
        return migrations;
    } catch (error) {
        console.error('❌ Failed to get executed migrations:', error);
        return [];
    }
}

// Check if migration exists
export async function migrationExists(name: string): Promise<boolean> {
    try {
        const result = await executeQuery<{ count: number }>(
            'SELECT COUNT(*) as count FROM migrations WHERE name = ?',
            [name]
        );
        return result[0]?.count > 0;
    } catch (error) {
        console.error('❌ Failed to check migration existence:', error);
        return false;
    }
}

// Execute a single migration
export async function executeMigration(name: string, sql: string): Promise<MigrationResult> {
    try {
        // Check if migration already exists
        if (await migrationExists(name)) {
            return {
                success: false,
                message: `Migration '${name}' has already been executed`
            };
        }

        // Calculate checksum
        const checksum = require('crypto').createHash('sha256').update(sql).digest('hex');

        // Execute the migration SQL
        await executeSingleQuery(sql);

        // Record the migration
        const result = await executeSingleQuery(
            'INSERT INTO migrations (name, sql_content, checksum) VALUES (?, ?, ?)',
            [name, sql, checksum]
        );

        const migration: Migration = {
            id: result.insertId,
            name,
            sql,
            executed_at: new Date(),
            checksum
        };

        console.log(`✅ Migration '${name}' executed successfully`);

        return {
            success: true,
            message: `Migration '${name}' executed successfully`,
            migration
        };

    } catch (error) {
        console.error(`❌ Failed to execute migration '${name}':`, error);
        return {
            success: false,
            message: `Failed to execute migration '${name}'`,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Rollback a migration
export async function rollbackMigration(name: string): Promise<MigrationResult> {
    try {
        // Get the migration details
        const migrations = await executeQuery<Migration>(
            'SELECT * FROM migrations WHERE name = ?',
            [name]
        );

        if (migrations.length === 0) {
            return {
                success: false,
                message: `Migration '${name}' not found`
            };
        }

        const migration = migrations[0];

        // Remove the migration record
        await executeSingleQuery(
            'DELETE FROM migrations WHERE name = ?',
            [name]
        );

        console.log(`✅ Migration '${name}' rolled back successfully`);

        return {
            success: true,
            message: `Migration '${name}' rolled back successfully`,
            migration
        };

    } catch (error) {
        console.error(`❌ Failed to rollback migration '${name}':`, error);
        return {
            success: false,
            message: `Failed to rollback migration '${name}'`,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Get migration status
export async function getMigrationStatus(): Promise<{
    total: number;
    executed: number;
    pending: number;
    migrations: Migration[];
}> {
    try {
        const migrations = await getExecutedMigrations();
        
        return {
            total: migrations.length,
            executed: migrations.length,
            pending: 0, // For now, we'll implement pending migrations later
            migrations
        };
    } catch (error) {
        console.error('❌ Failed to get migration status:', error);
        return {
            total: 0,
            executed: 0,
            pending: 0,
            migrations: []
        };
    }
}

// Initialize the migration system
export async function initializeMigrationSystem(): Promise<boolean> {
    try {
        console.log('🚀 Initializing migration system...');
        
        // Initialize migrations table
        const tableCreated = await initializeMigrationsTable();
        if (!tableCreated) {
            return false;
        }

        // Check if we need to run initial schema migration
        const hasInitialSchema = await migrationExists('001_initial_schema');
        if (!hasInitialSchema) {
            console.log('📋 Running initial schema migration...');
            
            // Read and execute the initial schema
            const fs = require('fs');
            const path = require('path');
            const schemaPath = path.join(process.cwd(), 'src', 'database', 'schema.sql');
            
            if (fs.existsSync(schemaPath)) {
                const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
                
                // Split the schema into individual statements
                const statements = schemaSQL
                    .split(';')
                    .map((stmt: string) => stmt.trim())
                    .filter((stmt: string) => 
                        stmt.length > 0 && 
                        !stmt.startsWith('--') &&
                        !stmt.toUpperCase().startsWith('USE ') &&
                        !stmt.toUpperCase().startsWith('CREATE DATABASE') &&
                        !stmt.toUpperCase().startsWith('SELECT ') &&
                        !stmt.toUpperCase().startsWith('CREATE INDEX IF NOT EXISTS')
                    );
                
                // Execute each statement
                for (const statement of statements) {
                    if (statement.trim()) {
                        await executeSingleQuery(statement);
                    }
                }
                
                // Record the migration
                await executeMigration('001_initial_schema', schemaSQL);
            }
        }

        console.log('✅ Migration system initialized successfully');
        return true;

    } catch (error) {
        console.error('❌ Failed to initialize migration system:', error);
        return false;
    }
}

// Run all pending migrations
export async function runPendingMigrations(): Promise<MigrationResult[]> {
    try {
        console.log('🔄 Running pending migrations...');
        const results: MigrationResult[] = [];
        const name = '002_add_lender_tolerance_bands';
        if (!(await migrationExists(name))) {
            const sql = `ALTER TABLE lender_profiles ADD COLUMN tolerance_bands JSON NULL`;
            const res = await executeMigration(name, sql);
            results.push(res);
        }
        console.log('✅ Pending migrations executed');
        return results;
        
    } catch (error) {
        console.error('❌ Failed to run pending migrations:', error);
        return [{
            success: false,
            message: 'Failed to run pending migrations',
            error: error instanceof Error ? error.message : 'Unknown error'
        }];
    }
}
