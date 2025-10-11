import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/database/index';
import { readFile } from 'fs/promises';
import { join } from 'path';

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

        // Get profile picture URL from users table
        const [rows] = await executeQuery(
            'SELECT profile_picture FROM users WHERE id = ?',
            [parseInt(userId)]
        );

        if (!rows || rows.length === 0 || !rows[0].profile_picture) {
            // Return a default avatar or 404
            return NextResponse.json({ error: 'Profile picture not found' }, { status: 404 });
        }

        const profilePictureUrl = rows[0].profile_picture;
        // If it's a local file path, serve it from filesystem (development)
        if (profilePictureUrl.startsWith('/uploads/profile-pictures/')) {
            try {
                const filepath = join(process.cwd(), 'public', profilePictureUrl);
                const imageBuffer = await readFile(filepath);
                
                // Determine content type from file extension
                const extension = profilePictureUrl.split('.').pop()?.toLowerCase();
                let contentType = 'image/jpeg';
                if (extension === 'png') contentType = 'image/png';
                else if (extension === 'gif') contentType = 'image/gif';
                else if (extension === 'webp') contentType = 'image/webp';
                
                // Return the image with proper headers
                return new NextResponse(imageBuffer as BodyInit, {
                    headers: {
                        'Content-Type': contentType,
                        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
                        'Content-Length': imageBuffer.length.toString(),
                    },
                });
            } catch (fileError) {
                console.error('Error reading profile picture file:', fileError);
                return NextResponse.json({ error: 'Profile picture file not found' }, { status: 404 });
            }
        } else {
            // If it's an external URL (Cloudflare Images), redirect to it
            return NextResponse.redirect(profilePictureUrl);
        }

    } catch (error) {
        console.error('Error serving profile picture:', error);
        return NextResponse.json(
            { error: 'Failed to serve profile picture' },
            { status: 500 }
        );
    }
}
