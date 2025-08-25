import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

export interface CleanupResult {
    success: boolean;
    filesRemoved: number;
    bytesFreed: number;
    errors: string[];
    details: {
        orphanedFiles: string[];
        invalidFiles: string[];
        totalFiles: number;
    };
}

export interface FileInfo {
    filename: string;
    filepath: string;
    size: number;
    lastModified: Date;
    isOrphaned: boolean;
}

/**
 * Get the profile pictures upload directory path
 */
export function getProfilePicturesDir(): string {
    return process.env.NODE_ENV === 'production'
        ? '/tmp/uploads/profile-pictures'  // Railway's writable temp directory
        : join(process.cwd(), 'public', 'uploads', 'profile-pictures');
}

/**
 * Extract user ID from profile picture filename
 * Expected format: profile_{userId}_{timestamp}.webp
 */
export function extractUserIdFromFilename(filename: string): number | null {
    const match = filename.match(/^profile_(\d+)_\d+\.webp$/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Get all profile picture files in the uploads directory
 */
export async function getAllProfilePictureFiles(): Promise<FileInfo[]> {
    const uploadsDir = getProfilePicturesDir();
    
    if (!existsSync(uploadsDir)) {
        return [];
    }

    try {
        const files = await fs.readdir(uploadsDir);
        const fileInfos: FileInfo[] = [];

        for (const filename of files) {
            const filepath = join(uploadsDir, filename);
            const stats = await fs.stat(filepath);
            
            if (stats.isFile()) {
                const userId = extractUserIdFromFilename(filename);
                fileInfos.push({
                    filename,
                    filepath,
                    size: stats.size,
                    lastModified: stats.mtime,
                    isOrphaned: false // Will be determined later
                });
            }
        }

        return fileInfos;
    } catch (error) {
        console.error('Error reading profile pictures directory:', error);
        return [];
    }
}

/**
 * Check if a profile picture file is orphaned (user doesn't exist in database)
 */
export async function checkOrphanedFiles(
    files: FileInfo[],
    getUserById: (id: number) => Promise<any>
): Promise<FileInfo[]> {
    const orphanedFiles: FileInfo[] = [];

    for (const file of files) {
        const userId = extractUserIdFromFilename(file.filename);
        if (userId) {
            try {
                const user = await getUserById(userId);
                if (!user) {
                    file.isOrphaned = true;
                    orphanedFiles.push(file);
                }
            } catch (error) {
                console.error(`Error checking user ${userId} for file ${file.filename}:`, error);
                // If we can't verify the user, mark as orphaned for safety
                file.isOrphaned = true;
                orphanedFiles.push(file);
            }
        } else {
            // Invalid filename format, mark as orphaned
            file.isOrphaned = true;
            orphanedFiles.push(file);
        }
    }

    return orphanedFiles;
}

/**
 * Remove orphaned profile picture files
 */
export async function removeOrphanedFiles(files: FileInfo[]): Promise<CleanupResult> {
    const result: CleanupResult = {
        success: true,
        filesRemoved: 0,
        bytesFreed: 0,
        errors: [],
        details: {
            orphanedFiles: [],
            invalidFiles: [],
            totalFiles: files.length
        }
    };

    for (const file of files) {
        if (file.isOrphaned) {
            try {
                await fs.unlink(file.filepath);
                result.filesRemoved++;
                result.bytesFreed += file.size;
                result.details.orphanedFiles.push(file.filename);
                
                console.log(`Removed orphaned file: ${file.filename} (${file.size} bytes)`);
            } catch (error) {
                const errorMsg = `Failed to remove ${file.filename}: ${error}`;
                result.errors.push(errorMsg);
                console.error(errorMsg);
                result.success = false;
            }
        } else if (!extractUserIdFromFilename(file.filename)) {
            result.details.invalidFiles.push(file.filename);
        }
    }

    return result;
}

/**
 * Clean up profile pictures for a specific user
 * Used when user is deleted or profile picture is changed
 */
export async function cleanupUserProfilePictures(
    userId: number,
    excludeFilename?: string
): Promise<CleanupResult> {
    const uploadsDir = getProfilePicturesDir();
    
    if (!existsSync(uploadsDir)) {
        return {
            success: true,
            filesRemoved: 0,
            bytesFreed: 0,
            errors: [],
            details: {
                orphanedFiles: [],
                invalidFiles: [],
                totalFiles: 0
            }
        };
    }

    try {
        const files = await fs.readdir(uploadsDir);
        const userFiles = files.filter(filename => {
            const fileUserId = extractUserIdFromFilename(filename);
            return fileUserId === userId && filename !== excludeFilename;
        });

        const result: CleanupResult = {
            success: true,
            filesRemoved: 0,
            bytesFreed: 0,
            errors: [],
            details: {
                orphanedFiles: userFiles,
                invalidFiles: [],
                totalFiles: userFiles.length
            }
        };

        for (const filename of userFiles) {
            const filepath = join(uploadsDir, filename);
            try {
                const stats = await fs.stat(filepath);
                await fs.unlink(filepath);
                result.filesRemoved++;
                result.bytesFreed += stats.size;
                
                console.log(`Cleaned up user ${userId} profile picture: ${filename}`);
            } catch (error) {
                const errorMsg = `Failed to remove ${filename}: ${error}`;
                result.errors.push(errorMsg);
                console.error(errorMsg);
                result.success = false;
            }
        }

        return result;
    } catch (error) {
        console.error(`Error cleaning up profile pictures for user ${userId}:`, error);
        return {
            success: false,
            filesRemoved: 0,
            bytesFreed: 0,
            errors: [`Failed to access uploads directory: ${error}`],
            details: {
                orphanedFiles: [],
                invalidFiles: [],
                totalFiles: 0
            }
        };
    }
}

/**
 * Perform a full cleanup of orphaned profile pictures
 */
export async function performFullCleanup(
    getUserById: (id: number) => Promise<any>
): Promise<CleanupResult> {
    try {
        console.log('Starting full profile picture cleanup...');
        
        // Get all profile picture files
        const files = await getAllProfilePictureFiles();
        console.log(`Found ${files.length} profile picture files`);
        
        if (files.length === 0) {
            return {
                success: true,
                filesRemoved: 0,
                bytesFreed: 0,
                errors: [],
                details: {
                    orphanedFiles: [],
                    invalidFiles: [],
                    totalFiles: 0
                }
            };
        }

        // Check for orphaned files
        const orphanedFiles = await checkOrphanedFiles(files, getUserById);
        console.log(`Found ${orphanedFiles.length} orphaned files`);
        
        if (orphanedFiles.length === 0) {
            return {
                success: true,
                filesRemoved: 0,
                bytesFreed: 0,
                errors: [],
                details: {
                    orphanedFiles: [],
                    invalidFiles: files.filter(f => !extractUserIdFromFilename(f.filename)).map(f => f.filename),
                    totalFiles: files.length
                }
            };
        }

        // Remove orphaned files
        const result = await removeOrphanedFiles(orphanedFiles);
        result.details.totalFiles = files.length;
        
        console.log(`Cleanup completed: ${result.filesRemoved} files removed, ${result.bytesFreed} bytes freed`);
        
        return result;
    } catch (error) {
        console.error('Error during full cleanup:', error);
        return {
            success: false,
            filesRemoved: 0,
            bytesFreed: 0,
            errors: [`Cleanup failed: ${error}`],
            details: {
                orphanedFiles: [],
                invalidFiles: [],
                totalFiles: 0
            }
        };
    }
}

/**
 * Get cleanup statistics without performing actual cleanup
 */
export async function getCleanupStats(
    getUserById: (id: number) => Promise<any>
): Promise<{
    totalFiles: number;
    orphanedFiles: number;
    totalSize: number;
    orphanedSize: number;
    invalidFiles: number;
}> {
    try {
        const files = await getAllProfilePictureFiles();
        const orphanedFiles = await checkOrphanedFiles(files, getUserById);
        
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const orphanedSize = orphanedFiles.reduce((sum, file) => sum + file.size, 0);
        const invalidFiles = files.filter(f => !extractUserIdFromFilename(f.filename)).length;
        
        return {
            totalFiles: files.length,
            orphanedFiles: orphanedFiles.length,
            totalSize,
            orphanedSize,
            invalidFiles
        };
    } catch (error) {
        console.error('Error getting cleanup stats:', error);
        return {
            totalFiles: 0,
            orphanedFiles: 0,
            totalSize: 0,
            orphanedSize: 0,
            invalidFiles: 0
        };
    }
}
