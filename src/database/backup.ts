import { executeQuery, executeSingleQuery, pool } from './index';
import { dbConfig } from './config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface BackupConfig {
    enabled: boolean;
    backupDir: string;
    maxBackups: number;
    backupInterval: number; // in milliseconds
    compressBackups: boolean;
    includeSchema: boolean;
    includeData: boolean;
    backupRetentionDays: number;
}

export interface BackupResult {
    success: boolean;
    message: string;
    backupPath?: string;
    backupSize?: number;
    checksum?: string;
    error?: string;
    timestamp: Date;
}

export interface BackupInfo {
    id: string;
    filename: string;
    path: string;
    size: number;
    checksum: string;
    timestamp: Date;
    type: 'full' | 'schema' | 'data';
    status: 'success' | 'failed';
}

// Default backup configuration
const DEFAULT_BACKUP_CONFIG: BackupConfig = {
    enabled: process.env.DB_BACKUP_ENABLED === 'true',
    backupDir: process.env.DB_BACKUP_DIR || './backups',
    maxBackups: parseInt(process.env.DB_MAX_BACKUPS || '10'),
    backupInterval: parseInt(process.env.DB_BACKUP_INTERVAL || '86400000'), // 24 hours
    compressBackups: process.env.DB_COMPRESS_BACKUPS !== 'false',
    includeSchema: true,
    includeData: true,
    backupRetentionDays: parseInt(process.env.DB_BACKUP_RETENTION_DAYS || '30'),
};

class DatabaseBackup {
    private config: BackupConfig;
    private backupTimer?: NodeJS.Timeout;
    private isRunning = false;

    constructor(config: Partial<BackupConfig> = {}) {
        this.config = { ...DEFAULT_BACKUP_CONFIG, ...config };
        this.ensureBackupDirectory();
    }

    // Ensure backup directory exists
    private ensureBackupDirectory(): void {
        if (!fs.existsSync(this.config.backupDir)) {
            fs.mkdirSync(this.config.backupDir, { recursive: true });
            console.log(`📁 Created backup directory: ${this.config.backupDir}`);
        }
    }

    // Generate backup filename
    private generateBackupFilename(type: 'full' | 'schema' | 'data'): string {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const hostname = dbConfig.host.replace(/[^a-zA-Z0-9]/g, '_');
        const database = dbConfig.database;
        
        return `${type}_${database}_${hostname}_${timestamp}.sql`;
    }

    // Create full database backup
    async createFullBackup(): Promise<BackupResult> {
        if (this.isRunning) {
            return {
                success: false,
                message: 'Backup already in progress',
                timestamp: new Date()
            };
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            console.log('🔄 Starting full database backup...');

            // Generate backup filename
            const filename = this.generateBackupFilename('full');
            const backupPath = path.join(this.config.backupDir, filename);

            // Get database schema
            const schemaSQL = await this.getDatabaseSchema();
            
            // Get data (if enabled)
            let dataSQL = '';
            if (this.config.includeData) {
                dataSQL = await this.getDatabaseData();
            }

            // Combine schema and data
            const fullBackup = schemaSQL + '\n\n' + dataSQL;

            // Write backup file
            fs.writeFileSync(backupPath, fullBackup, 'utf8');

            // Calculate checksum
            const checksum = crypto.createHash('sha256').update(fullBackup).digest('hex');

            // Get file size
            const stats = fs.statSync(backupPath);
            const backupSize = stats.size;

            // Compress if enabled
            let finalBackupPath = backupPath;
            if (this.config.compressBackups) {
                finalBackupPath = await this.compressFile(backupPath);
                // Remove uncompressed file
                fs.unlinkSync(backupPath);
            }

            const duration = Date.now() - startTime;
            console.log(`✅ Full backup completed in ${duration}ms: ${finalBackupPath}`);

            // Clean up old backups
            await this.cleanupOldBackups();

            return {
                success: true,
                message: `Full backup completed successfully in ${duration}ms`,
                backupPath: finalBackupPath,
                backupSize: backupSize,
                checksum: checksum,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('❌ Full backup failed:', error);
            return {
                success: false,
                message: 'Full backup failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        } finally {
            this.isRunning = false;
        }
    }

    // Get database schema
    private async getDatabaseSchema(): Promise<string> {
        try {
            const tables = await executeQuery<{ table_name: string }>(
                `SELECT table_name FROM information_schema.tables 
                 WHERE table_schema = ? AND table_type = 'BASE TABLE'`,
                [dbConfig.database]
            );

            let schemaSQL = `-- Database Schema Backup\n`;
            schemaSQL += `-- Generated: ${new Date().toISOString()}\n`;
            schemaSQL += `-- Database: ${dbConfig.database}\n\n`;

            for (const table of tables) {
                const tableName = table.table_name;
                
                // Get CREATE TABLE statement
                const createTableResult = await executeQuery<{ 'Create Table': string }>(
                    `SHOW CREATE TABLE \`${tableName}\``
                );
                
                if (createTableResult.length > 0) {
                    schemaSQL += createTableResult[0]['Create Table'] + ';\n\n';
                }
            }

            return schemaSQL;

        } catch (error) {
            console.error('❌ Failed to get database schema:', error);
            throw error;
        }
    }

    // Get database data
    private async getDatabaseData(): Promise<string> {
        try {
            const tables = await executeQuery<{ table_name: string }>(
                `SELECT table_name FROM information_schema.tables 
                 WHERE table_schema = ? AND table_type = 'BASE TABLE'`,
                [dbConfig.database]
            );

            let dataSQL = `-- Database Data Backup\n`;
            dataSQL += `-- Generated: ${new Date().toISOString()}\n\n`;

            for (const table of tables) {
                const tableName = table.table_name;
                
                // Skip migrations table to avoid conflicts
                if (tableName === 'migrations') {
                    continue;
                }

                // Get table data
                const data = await executeQuery<any>(`SELECT * FROM \`${tableName}\``);
                
                if (data.length > 0) {
                    dataSQL += `-- Data for table \`${tableName}\`\n`;
                    
                    for (const row of data) {
                        const columns = Object.keys(row);
                        const values = Object.values(row).map(value => {
                            if (value === null) return 'NULL';
                            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                            return value;
                        });
                        
                        dataSQL += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
                    }
                    dataSQL += '\n';
                }
            }

            return dataSQL;

        } catch (error) {
            console.error('❌ Failed to get database data:', error);
            throw error;
        }
    }

    // Compress file using gzip
    private async compressFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const zlib = require('zlib');
            const input = fs.createReadStream(filePath);
            const output = fs.createWriteStream(filePath + '.gz');
            const gzip = zlib.createGzip();

            input.pipe(gzip).pipe(output);

            output.on('finish', () => {
                resolve(filePath + '.gz');
            });

            output.on('error', reject);
        });
    }

    // Clean up old backups
    private async cleanupOldBackups(): Promise<void> {
        try {
            const files = fs.readdirSync(this.config.backupDir);
            const backupFiles = files
                .filter(file => file.endsWith('.sql') || file.endsWith('.sql.gz'))
                .map(file => {
                    const filePath = path.join(this.config.backupDir, file);
                    const stats = fs.statSync(filePath);
                    return { name: file, path: filePath, stats };
                })
                .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

            // Remove files beyond maxBackups limit
            if (backupFiles.length > this.config.maxBackups) {
                const filesToRemove = backupFiles.slice(this.config.maxBackups);
                for (const file of filesToRemove) {
                    fs.unlinkSync(file.path);
                    console.log(`🗑️ Removed old backup: ${file.name}`);
                }
            }

            // Remove files older than retention period
            const cutoffDate = new Date(Date.now() - (this.config.backupRetentionDays * 24 * 60 * 60 * 1000));
            for (const file of backupFiles) {
                if (file.stats.mtime < cutoffDate) {
                    fs.unlinkSync(file.path);
                    console.log(`🗑️ Removed expired backup: ${file.name}`);
                }
            }

        } catch (error) {
            console.error('❌ Failed to cleanup old backups:', error);
        }
    }

    // List all backups
    async listBackups(): Promise<BackupInfo[]> {
        try {
            const files = fs.readdirSync(this.config.backupDir);
            const backupFiles = files
                .filter(file => file.endsWith('.sql') || file.endsWith('.sql.gz'))
                .map(file => {
                    const filePath = path.join(this.config.backupDir, file);
                    const stats = fs.statSync(filePath);
                    const isCompressed = file.endsWith('.gz');
                    
                    return {
                        id: crypto.randomUUID(),
                        filename: file,
                        path: filePath,
                        size: stats.size,
                        checksum: '', // Would need to calculate this
                        timestamp: stats.mtime,
                        type: 'full' as const,
                        status: 'success' as const
                    };
                })
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            return backupFiles;

        } catch (error) {
            console.error('❌ Failed to list backups:', error);
            return [];
        }
    }

    // Restore database from backup
    async restoreFromBackup(backupPath: string): Promise<BackupResult> {
        try {
            console.log(`🔄 Restoring database from backup: ${backupPath}`);

            // Check if backup file exists
            if (!fs.existsSync(backupPath)) {
                return {
                    success: false,
                    message: `Backup file not found: ${backupPath}`,
                    timestamp: new Date()
                };
            }

            // Read backup file
            let backupContent = fs.readFileSync(backupPath, 'utf8');

            // Decompress if needed
            if (backupPath.endsWith('.gz')) {
                const zlib = require('zlib');
                backupContent = zlib.gunzipSync(backupContent).toString('utf8');
            }

            // Split into individual statements
            const statements = backupContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

            // Execute each statement
            for (const statement of statements) {
                if (statement.trim()) {
                    await executeSingleQuery(statement);
                }
            }

            console.log('✅ Database restored successfully');

            return {
                success: true,
                message: 'Database restored successfully',
                timestamp: new Date()
            };

        } catch (error) {
            console.error('❌ Database restore failed:', error);
            return {
                success: false,
                message: 'Database restore failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }

    // Start automated backup schedule
    startAutomatedBackups(): void {
        if (!this.config.enabled) {
            console.log('⚠️ Automated backups are disabled');
            return;
        }

        if (this.backupTimer) {
            console.log('⚠️ Automated backups are already running');
            return;
        }

        console.log(`🔄 Starting automated backups every ${this.config.backupInterval / 1000 / 60} minutes`);
        
        this.backupTimer = setInterval(async () => {
            await this.createFullBackup();
        }, this.config.backupInterval);

        // Run initial backup
        this.createFullBackup();
    }

    // Stop automated backup schedule
    stopAutomatedBackups(): void {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = undefined;
            console.log('⏹️ Automated backups stopped');
        }
    }

    // Get backup configuration
    getConfig(): BackupConfig {
        return { ...this.config };
    }

    // Update backup configuration
    updateConfig(newConfig: Partial<BackupConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.ensureBackupDirectory();
        console.log('✅ Backup configuration updated');
    }
}

// Export singleton instance
export const databaseBackup = new DatabaseBackup();

// Export the class
export { DatabaseBackup };
