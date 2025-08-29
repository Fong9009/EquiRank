import { NextRequest, NextResponse } from 'next/server';
import {getTheme, updateUserProfile} from '@/database/user';
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
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = parseInt(session.user.id);
        const themeData = await request.json();

        // Validate required fields
        if (!themeData) {
            return NextResponse.json(
                { error: 'Theme data is required' },
                { status: 400 }
            );
        }

        const success = await updateUserProfile(userId, themeData);
        if (success) {
            console.log('Display updated successfully:', userId);
            return NextResponse.json(
                { message: 'Display updated successfully' },
                { status: 200 }
            );
        } else {
            console.error('Failed to update display for user:', userId);
            return NextResponse.json(
                { error: 'Failed to update display' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error updating theme:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
