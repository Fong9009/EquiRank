#!/usr/bin/env node

/**
 * CLI Script for Profile Picture Cleanup
 * 
 * Usage:
 *   node scripts/cleanup.js --stats          # Show cleanup statistics
 *   node scripts/cleanup.js --cleanup        # Perform cleanup
 *   node scripts/cleanup.js --dry-run        # Show what would be cleaned up
 *   node scripts/cleanup.js --help           # Show help
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'profile-pictures');
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fit3048_team071'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
    log(`❌ ERROR: ${message}`, 'red');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'cyan');
}

function showHelp() {
    log('Profile Picture Cleanup CLI Tool', 'bright');
    log('================================', 'bright');
    log('');
    log('Usage:', 'bright');
    log('  node scripts/cleanup.js [OPTIONS]', '');
    log('');
    log('Options:', 'bright');
    log('  --stats          Show cleanup statistics', '');
    log('  --cleanup        Perform actual cleanup', '');
    log('  --dry-run        Show what would be cleaned up (without deleting)', '');
    log('  --help           Show this help message', '');
    log('');
    log('Examples:', 'bright');
    log('  node scripts/cleanup.js --stats', '');
    log('  node scripts/cleanup.js --dry-run', '');
    log('  node scripts/cleanup.js --cleanup', '');
    log('');
    log('Environment Variables:', 'bright');
    log('  DB_HOST          Database host (default: localhost)', '');
    log('  DB_USER          Database user (default: root)', '');
    log('  DB_PASSWORD      Database password', '');
    log('  DB_NAME          Database name (default: fit3048_team071)', '');
}

/**
 * Extract user ID from profile picture filename
 */
function extractUserIdFromFilename(filename) {
    const match = filename.match(/^profile_(\d+)_\d+\.webp$/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Get all profile picture files
 */
async function getAllProfilePictureFiles() {
    try {
        if (!fs.access) {
            throw new Error('fs.promises not available');
        }

        await fs.access(UPLOADS_DIR);
        const files = await fs.readdir(UPLOADS_DIR);
        const fileInfos = [];

        for (const filename of files) {
            const filepath = path.join(UPLOADS_DIR, filename);
            const stats = await fs.stat(filepath);
            
            if (stats.isFile()) {
                const userId = extractUserIdFromFilename(filename);
                fileInfos.push({
                    filename,
                    filepath,
                    size: stats.size,
                    lastModified: stats.mtime,
                    isOrphaned: false,
                    userId
                });
            }
        }

        return fileInfos;
    } catch (error) {
        if (error.code === 'ENOENT') {
            logInfo('Uploads directory does not exist');
            return [];
        }
        throw error;
    }
}

/**
 * Check if user exists in database
 */
async function checkUserExists(userId) {
    try {
        // Use mysql command line tool to check user existence
        const query = `SELECT id FROM users WHERE id = ${userId} LIMIT 1`;
        const command = `mysql -h"${DB_CONFIG.host}" -u"${DB_CONFIG.user}" -p"${DB_CONFIG.password}" "${DB_CONFIG.database}" -e "${query}" --silent --skip-column-names`;
        
        try {
            execSync(command, { stdio: 'pipe' });
            return true;
        } catch (error) {
            // If command fails, user likely doesn't exist
            return false;
        }
    } catch (error) {
        logWarning(`Could not check user ${userId}: ${error.message}`);
        return false;
    }
}

/**
 * Check for orphaned files
 */
async function checkOrphanedFiles(files) {
    const orphanedFiles = [];
    let checkedCount = 0;

    logInfo(`Checking ${files.length} files for orphaned status...`);

    for (const file of files) {
        checkedCount++;
        process.stdout.write(`\rChecking file ${checkedCount}/${files.length}...`);

        if (file.userId) {
            const userExists = await checkUserExists(file.userId);
            if (!userExists) {
                file.isOrphaned = true;
                orphanedFiles.push(file);
            }
        } else {
            // Invalid filename format
            file.isOrphaned = true;
            orphanedFiles.push(file);
        }
    }

    process.stdout.write('\r');
    logSuccess(`Checked ${checkedCount} files`);
    
    return orphanedFiles;
}

/**
 * Show cleanup statistics
 */
async function showStats() {
    try {
        logInfo('Scanning profile picture files...');
        const files = await getAllProfilePictureFiles();
        
        if (files.length === 0) {
            logInfo('No profile picture files found');
            return;
        }

        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const invalidFiles = files.filter(f => !f.userId);
        
        log('', '');
        log('📊 Cleanup Statistics', 'bright');
        log('====================', 'bright');
        log(`Total Files: ${files.length}`, '');
        log(`Total Size: ${formatBytes(totalSize)}`, '');
        log(`Invalid Files: ${invalidFiles.length}`, '');
        
        if (invalidFiles.length > 0) {
            log('', '');
            log('Invalid Files:', 'yellow');
            invalidFiles.forEach(file => {
                log(`  - ${file.filename} (${formatBytes(file.size)})`, 'yellow');
            });
        }

        log('', '');
        logInfo('Checking for orphaned files...');
        const orphanedFiles = await checkOrphanedFiles(files);
        
        const orphanedSize = orphanedFiles.reduce((sum, file) => sum + file.size, 0);
        const wastePercentage = totalSize > 0 ? Math.round((orphanedSize / totalSize) * 100) : 0;

        log('', '');
        log('🧹 Orphaned Files Analysis', 'bright');
        log('==========================', 'bright');
        log(`Orphaned Files: ${orphanedFiles.length}`, orphanedFiles.length > 0 ? 'red' : 'green');
        log(`Orphaned Size: ${formatBytes(orphanedSize)}`, orphanedFiles.length > 0 ? 'red' : 'green');
        log(`Waste Percentage: ${wastePercentage}%`, wastePercentage > 0 ? 'red' : 'green');

        if (orphanedFiles.length > 0) {
            log('', '');
            log('Orphaned Files:', 'red');
            orphanedFiles.forEach(file => {
                const reason = file.userId ? `User ID ${file.userId} not found` : 'Invalid filename format';
                log(`  - ${file.filename} (${formatBytes(file.size)}) - ${reason}`, 'red');
            });
        } else {
            log('', '');
            logSuccess('No orphaned files found! Your storage is clean.');
        }

    } catch (error) {
        logError(`Failed to get statistics: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Perform dry run (show what would be cleaned up)
 */
async function performDryRun() {
    try {
        logInfo('Performing dry run...');
        const files = await getAllProfilePictureFiles();
        
        if (files.length === 0) {
            logInfo('No files to check');
            return;
        }

        const orphanedFiles = await checkOrphanedFiles(files);
        
        if (orphanedFiles.length === 0) {
            logSuccess('No orphaned files found. Nothing to clean up.');
            return;
        }

        const totalSize = orphanedFiles.reduce((sum, file) => sum + file.size, 0);
        
        log('', '');
        log('🧹 Dry Run Results', 'bright');
        log('==================', 'bright');
        log(`Files that would be removed: ${orphanedFiles.length}`, 'yellow');
        log(`Storage that would be freed: ${formatBytes(totalSize)}`, 'yellow');
        log('', '');
        log('Files to be removed:', 'yellow');
        
        orphanedFiles.forEach(file => {
            const reason = file.userId ? `User ID ${file.userId} not found` : 'Invalid filename format';
            log(`  - ${file.filename} (${formatBytes(file.size)}) - ${reason}`, 'yellow');
        });

        log('', '');
        logWarning('This is a dry run. No files were actually deleted.');
        log('Run with --cleanup to perform the actual cleanup.', '');

    } catch (error) {
        logError(`Dry run failed: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Perform actual cleanup
 */
async function performCleanup() {
    try {
        logWarning('Starting cleanup operation...');
        const files = await getAllProfilePictureFiles();
        
        if (files.length === 0) {
            logInfo('No files to check');
            return;
        }

        const orphanedFiles = await checkOrphanedFiles(files);
        
        if (orphanedFiles.length === 0) {
            logSuccess('No orphaned files found. Nothing to clean up.');
            return;
        }

        const totalSize = orphanedFiles.reduce((sum, file) => sum + file.size, 0);
        
        log('', '');
        logWarning(`About to delete ${orphanedFiles.length} orphaned files (${formatBytes(totalSize)})`);
        
        const answer = await askConfirmation('Are you sure you want to proceed? (yes/no): ');
        if (answer.toLowerCase() !== 'yes') {
            logInfo('Cleanup cancelled by user');
            return;
        }

        let deletedCount = 0;
        let deletedSize = 0;
        let errors = [];

        for (const file of orphanedFiles) {
            try {
                await fs.unlink(file.filepath);
                deletedCount++;
                deletedSize += file.size;
                logSuccess(`Deleted: ${file.filename}`);
            } catch (error) {
                const errorMsg = `Failed to delete ${file.filename}: ${error.message}`;
                errors.push(errorMsg);
                logError(errorMsg);
            }
        }

        log('', '');
        log('🧹 Cleanup Results', 'bright');
        log('==================', 'bright');
        log(`Files deleted: ${deletedCount}/${orphanedFiles.length}`, deletedCount === orphanedFiles.length ? 'green' : 'yellow');
        log(`Storage freed: ${formatBytes(deletedSize)}`, 'green');
        
        if (errors.length > 0) {
            log('', '');
            logWarning(`Errors encountered: ${errors.length}`);
            errors.forEach(error => log(`  - ${error}`, 'red'));
        }

        if (deletedCount > 0) {
            log('', '');
            logSuccess(`Cleanup completed successfully! Freed ${formatBytes(deletedSize)} of storage.`);
        }

    } catch (error) {
        logError(`Cleanup failed: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Ask for user confirmation
 */
function askConfirmation(question) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.length === 0) {
        showHelp();
        return;
    }

    try {
        if (args.includes('--stats')) {
            await showStats();
        } else if (args.includes('--dry-run')) {
            await performDryRun();
        } else if (args.includes('--cleanup')) {
            await performCleanup();
        } else {
            logError('Invalid option. Use --help to see available options.');
            process.exit(1);
        }
    } catch (error) {
        logError(`Operation failed: ${error.message}`);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        logError(`Script failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    getAllProfilePictureFiles,
    checkOrphanedFiles,
    formatBytes
};
