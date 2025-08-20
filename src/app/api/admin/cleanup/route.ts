import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { performFullCleanup, getCleanupStats } from '@/lib/fileCleanup';
import { getUserById } from '@/database/user';

// GET /api/admin/cleanup - Get cleanup statistics
export async function GET(request: NextRequest) {
    try {
        // Check authentication and admin privileges
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if ((session.user as any).userType !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        // Get cleanup statistics
        const stats = await getCleanupStats(getUserById);

        return NextResponse.json({
            success: true,
            stats: {
                ...stats,
                totalSizeMB: Math.round((stats.totalSize / (1024 * 1024)) * 100) / 100,
                orphanedSizeMB: Math.round((stats.orphanedSize / (1024 * 1024)) * 100) / 100
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error getting cleanup stats:', error);
        return NextResponse.json(
            { error: 'Failed to get cleanup statistics' },
            { status: 500 }
        );
    }
}

// POST /api/admin/cleanup - Perform cleanup operation
export async function POST(request: NextRequest) {
    try {
        // Check authentication and admin privileges
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if ((session.user as any).userType !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { action } = body;

        if (action === 'cleanup') {
            // Perform full cleanup
            const result = await performFullCleanup(getUserById);
            
            return NextResponse.json({
                success: result.success,
                message: result.success 
                    ? `Cleanup completed successfully. ${result.filesRemoved} files removed, ${Math.round((result.bytesFreed / (1024 * 1024)) * 100) / 100} MB freed.`
                    : 'Cleanup completed with errors',
                result: {
                    ...result,
                    bytesFreedMB: Math.round((result.bytesFreed / (1024 * 1024)) * 100) / 100
                }
            }, { status: result.success ? 200 : 500 });

        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "cleanup" to perform cleanup.' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Error performing cleanup:', error);
        return NextResponse.json(
            { error: 'Failed to perform cleanup operation' },
            { status: 500 }
        );
    }
}
