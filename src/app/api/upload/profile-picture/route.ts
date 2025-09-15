import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeSingleQuery } from '@/database/index';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        const userId = session.user.id;
        const timestamp = Date.now();
        
        // Generate unique filename
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const filename = `profile_${userId}_${timestamp}.${fileExtension}`;
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profile-pictures');
        await mkdir(uploadsDir, { recursive: true });
        
        // Save file to filesystem
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filepath = join(uploadsDir, filename);
        await writeFile(filepath, buffer);

        // Update the users table profile_picture field with the file path
        const profilePictureUrl = `/uploads/profile-pictures/${filename}`;
        await executeSingleQuery(
            'UPDATE users SET profile_picture = ? WHERE id = ?',
            [profilePictureUrl, parseInt(userId)]
        );

        console.log('Profile picture uploaded successfully:', {
            userId: session.user.id,
            fileType: file.type,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            filePath: profilePictureUrl
        });

        return NextResponse.json({
            success: true,
            url: profilePictureUrl,
            message: 'Profile picture uploaded successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
