import { NextRequest, NextResponse } from 'next/server';
import { getTheme } from '@/database/user';
import { auth } from '@/lib/auth';


export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = parseInt(session.user.id);
        const theme = await getTheme(userId);
        if (theme) {
            console.log("Test", theme);
            return NextResponse.json(
                { theme },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { error: 'Failed to find theme' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error finding theme');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
