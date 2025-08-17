import {getAllActiveUsers} from "@/database/user";
import {NextResponse} from "next/server";
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        // Check authentication
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is admin
        if ((session.user as any).userType !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        const activeUsers = await getAllActiveUsers();
        return NextResponse.json(activeUsers, { status: 200 });
    } catch (error) {
        console.error('Error fetching Active Users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Active Users' },
            { status: 500 }
        );
    }
}