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
        
        // Read file into memory and validate magic bytes
        const bytes = await file.arrayBuffer();
        const originalBuffer = Buffer.from(bytes);

        const isLikelyImage = (buf: Buffer) => {
            if (buf.length < 12) return false;
            // JPEG
            if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
            // PNG
            if (
                buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47 &&
                buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A
            ) return true;
            // GIF
            if (
                buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38
            ) return true;
            // WebP (RIFF....WEBP)
            if (
                buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
                buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
            ) return true;
            return false;
        };

        if (!isLikelyImage(originalBuffer)) {
            return NextResponse.json(
                { error: 'Invalid or unsupported image file' },
                { status: 400 }
            );
        }

        // Attempt to dynamically import sharp; fall back to saving original if unavailable
        let processedBuffer: Buffer | null = null;
        let filename: string;

        const detectExt = (buf: Buffer): string => {
            if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'jpg';
            if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'png';
            if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'gif';
            if (
                buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
                buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
            ) return 'webp';
            return 'jpg';
        };

        try {
            const sharpModule = await import('sharp');
            const sharp = sharpModule.default;
            processedBuffer = await sharp(originalBuffer)
                .rotate()
                .resize({ width: 512, height: 512, fit: 'cover', withoutEnlargement: true })
                .toFormat('webp', { quality: 80 })
                .toBuffer();
            filename = `profile_${userId}_${timestamp}.webp`;
        } catch (e) {
            console.warn('sharp unavailable, saving original image without re-encode:', e);
            const ext = detectExt(originalBuffer);
            processedBuffer = originalBuffer;
            filename = `profile_${userId}_${timestamp}.${ext}`;
        }
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profile-pictures');
        await mkdir(uploadsDir, { recursive: true });
        
        // Save processed file to filesystem
        const filepath = join(uploadsDir, filename);
        await writeFile(filepath, processedBuffer);

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
