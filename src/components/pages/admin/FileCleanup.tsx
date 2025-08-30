'use client';
import { useState, useEffect } from 'react';
import styles from '@/styles/pages/admin/fileCleanup.module.css';
import {useSession} from "next-auth/react";

interface CleanupStats {
    totalFiles: number;
    orphanedFiles: number;
    totalSize: number;
    orphanedSize: number;
    invalidFiles: number;
    totalSizeMB: number;
    orphanedSizeMB: number;
}

interface CleanupResult {
    success: boolean;
    message: string;
    result: {
        filesRemoved: number;
        bytesFreed: number;
        bytesFreedMB: number;
        errors: string[];
    };
}

export default function FileCleanup() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<CleanupStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

    //Colour Mode Editing
    const textColour = theme === "light" ? styles.lightTextColour : styles.darkTextColour;
    const backgroundColour = theme === "light" ? styles.lightBackground : styles.darkBackground;

    // Fetch cleanup statistics
    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/cleanup');
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            } else {
                throw new Error('Failed to fetch cleanup statistics');
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to fetch cleanup statistics'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Perform cleanup operation
    const performCleanup = async () => {
        if (!confirm('Are you sure you want to perform cleanup? This will permanently delete orphaned profile picture files.')) {
            return;
        }

        try {
            setIsCleaning(true);
            setMessage(null);

            const response = await fetch('/api/admin/cleanup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'cleanup' }),
            });

            const data: CleanupResult = await response.json();

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: data.message
                });
                // Refresh stats after cleanup
                await fetchStats();
            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Cleanup failed'
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to perform cleanup operation'
            });
        } finally {
            setIsCleaning(false);
        }
    };

    // Load stats on component mount
    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (!session) return;
        fetch("/api/users/theme")
            .then(res => res.json())
            .then(data => {
                if (data.theme) {
                    setTheme(data.theme.theme);
                } else {
                    setTheme("auto");
                }
            });
    }, [session]);

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading cleanup statistics...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>File Cleanup Management</h2>
                <p>Manage orphaned profile picture files and free up storage space</p>
            </div>

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            {stats && (
                <div className={styles.statsContainer}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.totalFiles}</div>
                            <div className={styles.statLabel}>Total Files</div>
                        </div>
                        
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.orphanedFiles}</div>
                            <div className={styles.statLabel}>Orphaned Files</div>
                        </div>
                        
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.invalidFiles}</div>
                            <div className={styles.statLabel}>Invalid Files</div>
                        </div>
                        
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{formatBytes(stats.totalSize)}</div>
                            <div className={styles.statLabel}>Total Size</div>
                        </div>
                        
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{formatBytes(stats.orphanedSize)}</div>
                            <div className={styles.statLabel}>Orphaned Size</div>
                        </div>
                        
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>
                                {stats.totalSize > 0 
                                    ? Math.round((stats.orphanedSize / stats.totalSize) * 100)
                                    : 0}%
                            </div>
                            <div className={styles.statLabel}>Waste Percentage</div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            onClick={performCleanup}
                            disabled={isCleaning || stats.orphanedFiles === 0}
                            className={`${styles.cleanupButton} ${isCleaning ? styles.cleaning : ''}`}
                        >
                            {isCleaning ? 'Cleaning...' : 'Clean Up Orphaned Files'}
                        </button>
                        
                        <button
                            onClick={fetchStats}
                            disabled={isLoading}
                            className={styles.refreshButton}
                        >
                            Refresh Statistics
                        </button>
                    </div>

                    {stats.orphanedFiles === 0 && (
                        <div className={styles.noOrphaned}>
                            <div className={styles.checkmark}>✓</div>
                            <p>No orphaned files found. Your storage is clean!</p>
                        </div>
                    )}

                    {stats.orphanedFiles > 0 && (
                        <div className={styles.cleanupInfo}>
                            <h3>Cleanup Information</h3>
                            <ul>
                                <li>Orphaned files are profile pictures from deleted users or invalid uploads</li>
                                <li>Cleaning up will permanently delete {stats.orphanedFiles} files</li>
                                <li>This will free up approximately {formatBytes(stats.orphanedSize)} of storage</li>
                                <li>The cleanup process is safe and only removes orphaned files</li>
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.helpSection}>
                <h3>How It Works</h3>
                <div className={styles.helpGrid}>
                    <div className={styles.helpItem}>
                        <div className={styles.helpIcon}>🔍</div>
                        <h4>Detection</h4>
                        <p>Scans all profile picture files and identifies orphaned ones by checking user existence in the database.</p>
                    </div>
                    
                    <div className={styles.helpItem}>
                        <div className={styles.helpIcon}>🧹</div>
                        <h4>Cleanup</h4>
                        <p>Safely removes orphaned files, freeing up storage space and maintaining system cleanliness.</p>
                    </div>
                    
                    <div className={styles.helpItem}>
                        <div className={styles.helpIcon}>📊</div>
                        <h4>Monitoring</h4>
                        <p>Provides detailed statistics on file usage, storage consumption, and cleanup results.</p>
                    </div>
                    
                    <div className={styles.helpItem}>
                        <div className={styles.helpIcon}>🛡️</div>
                        <h4>Safety</h4>
                        <p>Only removes files that are confirmed to be orphaned, preserving all valid user profile pictures.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
