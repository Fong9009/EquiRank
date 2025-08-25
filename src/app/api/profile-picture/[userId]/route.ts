import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/database/index';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        
        // Validate user ID
        if (!userId || isNaN(parseInt(userId))) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        // Get profile picture from database
        const [rows] = await executeQuery(
            'SELECT image_data, image_type, image_size FROM profile_pictures WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
            [parseInt(userId)]
        );

        if (!rows || rows.length === 0) {
            // Return a default avatar or 404
            return NextResponse.json({ error: 'Profile picture not found' }, { status: 404 });
        }

        const profilePicture = rows[0];
        
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(profilePicture.image_data, 'base64');
        
        // Return the image with proper headers
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': profilePicture.image_type,
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
                'Content-Length': profilePicture.image_size.toString(),
            },
        });

    } catch (error) {
        console.error('Error serving profile picture from database:', error);
        return NextResponse.json(
            { error: 'Failed to serve profile picture' },
            { status: 500 }
        );
    }
}
