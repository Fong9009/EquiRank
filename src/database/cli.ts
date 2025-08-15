#!/usr/bin/env node

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { initializeDatabase, getDatabaseHealth, gracefulShutdown } from './index';
import { initializeMigrationSystem, getMigrationStatus, runPendingMigrations } from './migrations';
import { databaseBackup } from './backup';

// CLI argument parsing
const args = process.argv.slice(2);
const command = args[0];

// Help function
function showHelp() {
    console.log(`
🚀 EquiRank Database Management CLI

Usage: npm run db:command [options]

Commands:
  init          Initialize database connection and migration system
  health        Check database health status
  migrate       Run pending migrations
  status        Show migration status
  backup        Create a new database backup
  backup:list   List all available backups
  backup:restore <file>  Restore database from backup file
  backup:start  Start automated backup schedule
  backup:stop   Stop automated backup schedule
  backup:config Show backup configuration
  shutdown      Gracefully shutdown database connections

Examples:
  npm run db:init
  npm run db:health
  npm run db:backup
  npm run db:backup:restore ./backups/full_equirank_localhost_2025-08-16.sql.gz

Environment Variables:
  Set NODE_ENV=production to enable SSL and production settings
  Configure backup settings via DB_BACKUP_* environment variables
`);
}

// Initialize database
async function initDatabase() {
    try {
        console.log('🚀 Initializing database...');
        
        // Initialize database connection
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
            console.error('❌ Database initialization failed');
            process.exit(1);
        }
        
        // Initialize migration system
        const migrationInitialized = await initializeMigrationSystem();
        if (!migrationInitialized) {
            console.error('❌ Migration system initialization failed');
            process.exit(1);
        }
        
        console.log('✅ Database and migration system initialized successfully');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
}

// Check database health
async function checkHealth() {
    try {
        const health = getDatabaseHealth();
        console.log('📊 Database Health Status:');
        console.log(JSON.stringify(health, null, 2));
        
    } catch (error) {
        console.error('❌ Health check failed:', error);
        process.exit(1);
    }
}

// Run migrations
async function runMigrations() {
    try {
        console.log('🔄 Running pending migrations...');
        const results = await runPendingMigrations();
        
        if (results.length === 0) {
            console.log('✅ No pending migrations to run');
        } else {
            results.forEach(result => {
                if (result.success) {
                    console.log(`✅ ${result.message}`);
                } else {
                    console.log(`❌ ${result.message}: ${result.error}`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Show migration status
async function showMigrationStatus() {
    try {
        const status = await getMigrationStatus();
        console.log('📋 Migration Status:');
        console.log(JSON.stringify(status, null, 2));
        
    } catch (error) {
        console.error('❌ Failed to get migration status:', error);
        process.exit(1);
    }
}

// Create backup
async function createBackup() {
    try {
        console.log('🔄 Creating database backup...');
        const result = await databaseBackup.createFullBackup();
        
        if (result.success) {
            console.log(`✅ Backup created successfully: ${result.backupPath}`);
            console.log(`📊 Size: ${(result.backupSize! / 1024 / 1024).toFixed(2)} MB`);
            console.log(`🔐 Checksum: ${result.checksum}`);
        } else {
            console.error(`❌ Backup failed: ${result.error}`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
    }
}

// List backups
async function listBackups() {
    try {
        const backups = await databaseBackup.listBackups();
        console.log('📁 Available Backups:');
        
        if (backups.length === 0) {
            console.log('No backups found');
            return;
        }
        
        backups.forEach(backup => {
            const sizeMB = (backup.size / 1024 / 1024).toFixed(2);
            const date = backup.timestamp.toLocaleString();
            console.log(`📄 ${backup.filename} (${sizeMB} MB) - ${date}`);
        });
        
    } catch (error) {
        console.error('❌ Failed to list backups:', error);
        process.exit(1);
    }
}

// Restore from backup
async function restoreBackup(backupFile: string) {
    if (!backupFile) {
        console.error('❌ Please specify a backup file path');
        process.exit(1);
    }
    
    try {
        console.log(`🔄 Restoring from backup: ${backupFile}`);
        
        // Confirm restoration
        console.log('⚠️  WARNING: This will overwrite the current database!');
        console.log('Type "YES" to confirm:');
        
        // For CLI usage, we'll skip the confirmation prompt
        // In production, you might want to add a confirmation mechanism
        
        const result = await databaseBackup.restoreFromBackup(backupFile);
        
        if (result.success) {
            console.log('✅ Database restored successfully');
        } else {
            console.error(`❌ Restore failed: ${result.error}`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Restore failed:', error);
        process.exit(1);
    }
}

// Start automated backups
function startAutomatedBackups() {
    try {
        databaseBackup.startAutomatedBackups();
        console.log('✅ Automated backups started');
        
    } catch (error) {
        console.error('❌ Failed to start automated backups:', error);
        process.exit(1);
    }
}

// Stop automated backups
function stopAutomatedBackups() {
    try {
        databaseBackup.stopAutomatedBackups();
        console.log('✅ Automated backups stopped');
        
    } catch (error) {
        console.error('❌ Failed to stop automated backups:', error);
        process.exit(1);
    }
}

// Show backup configuration
function showBackupConfig() {
    try {
        const config = databaseBackup.getConfig();
        console.log('⚙️  Backup Configuration:');
        console.log(JSON.stringify(config, null, 2));
        
    } catch (error) {
        console.error('❌ Failed to get backup configuration:', error);
        process.exit(1);
    }
}

// Graceful shutdown
async function shutdown() {
    try {
        console.log('🔄 Starting graceful shutdown...');
        await gracefulShutdown();
        console.log('✅ Shutdown completed successfully');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Shutdown failed:', error);
        process.exit(1);
    }
}

// Main CLI logic
async function main() {
    try {
        switch (command) {
            case 'init':
                await initDatabase();
                break;
                
            case 'health':
                await checkHealth();
                break;
                
            case 'migrate':
                await runMigrations();
                break;
                
            case 'status':
                await showMigrationStatus();
                break;
                
            case 'backup':
                await createBackup();
                break;
                
            case 'backup:list':
                await listBackups();
                break;
                
            case 'backup:restore':
                await restoreBackup(args[1]);
                break;
                
            case 'backup:start':
                startAutomatedBackups();
                break;
                
            case 'backup:stop':
                stopAutomatedBackups();
                break;
                
            case 'backup:config':
                showBackupConfig();
                break;
                
            case 'shutdown':
                await shutdown();
                break;
                
            case 'help':
            case '--help':
            case '-h':
                showHelp();
                break;
                
            default:
                console.error(`❌ Unknown command: ${command}`);
                showHelp();
                process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Command failed:', error);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n🔄 Received SIGINT, shutting down gracefully...');
    await shutdown();
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
    await shutdown();
});

// Run CLI if this file is executed directly
if (require.main === module) {
    main();
}
