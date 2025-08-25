import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeQuery, executeSingleQuery } from '@/database/index';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB for database storage)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size must be less than 5MB for database storage' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString('base64');

        const userId = session.user.id;

        // Check if user already has a profile picture
        const [existingRows] = await executeSingleQuery(
            'SELECT id FROM profile_pictures WHERE user_id = ?',
            [parseInt(userId)]
        );

        if (existingRows && existingRows.length > 0) {
            // Update existing profile picture
            await executeQuery(
                'UPDATE profile_pictures SET image_data = ?, image_type = ?, image_size = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                [base64Data, file.type, file.size, parseInt(userId)]
            );
        } else {
            // Insert new profile picture
            await executeQuery(
                'INSERT INTO profile_pictures (user_id, image_data, image_type, image_size) VALUES (?, ?, ?, ?)',
                [parseInt(userId), base64Data, file.type, file.size]
            );
        }

        // Update the users table profile_picture field to point to the new API endpoint
        const profilePictureUrl = `/api/profile-picture/${userId}`;
        await executeQuery(
            'UPDATE users SET profile_picture = ? WHERE id = ?',
            [profilePictureUrl, parseInt(userId)]
        );

        console.log('Profile picture uploaded to database successfully:', {
            userId: session.user.id,
            fileType: file.type,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            databaseUrl: profilePictureUrl
        });

        return NextResponse.json({
            success: true,
            url: profilePictureUrl,
            message: 'Profile picture stored in database'
        }, { status: 200 });

    } catch (error) {
        console.error('Error uploading profile picture to database:', error);
        return NextResponse.json(
            { error: 'Failed to upload file to database' },
            { status: 500 }
        );
    }
}
