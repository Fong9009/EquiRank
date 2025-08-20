import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

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

        // Validate file size (max 10MB for original upload, will be compressed)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size must be less than 10MB. Large images will be automatically compressed.' },
                { status: 400 }
            );
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profile-pictures');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename (always use .webp for better compression)
        const timestamp = Date.now();
        const userId = session.user.id;
        const filename = `profile_${userId}_${timestamp}.webp`;
        const filepath = join(uploadsDir, filename);

        // Convert file to buffer and process with Sharp
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Process image: resize, compress, and convert to WebP
        const processedImage = await sharp(buffer)
            .resize(400, 400, { // Optimal size for profile pictures
                fit: 'cover',    // Crop to maintain aspect ratio
                position: 'center' // Center the crop
            })
            .webp({ 
                quality: 85,     // High quality with good compression
                effort: 6        // Higher compression effort
            })
            .toBuffer();

        // Save the processed image
        await writeFile(filepath, processedImage);

        // Clean up old profile pictures for this user (excluding the new one)
        try {
            const { cleanupUserProfilePictures } = await import('@/lib/fileCleanup');
            await cleanupUserProfilePictures(parseInt(userId), filename);
        } catch (error) {
            console.error(`Failed to cleanup old profile pictures for user ${userId}:`, error);
            // Don't fail the upload if cleanup fails
        }

        // Return the public URL
        const publicUrl = `/uploads/profile-pictures/${filename}`;
        
        const originalSize = file.size;
        const compressedSize = processedImage.length;
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        console.log('Profile picture uploaded and processed successfully:', {
            userId: session.user.id,
            filename,
            publicUrl,
            originalSize: `${(originalSize / 1024 / 1024).toFixed(2)} MB`,
            compressedSize: `${(compressedSize / 1024 / 1024).toFixed(2)} MB`,
            compressionRatio: `${compressionRatio}%`,
            resolution: '400x400',
            format: 'WebP'
        });

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: filename
        }, { status: 200 });

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
