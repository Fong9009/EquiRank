'use client';
import { useState, useRef } from 'react';
import styles from '@/styles/components/profilePictureUpload.module.css';
import ProfilePicture from './ProfilePicture';

interface ProfilePictureUploadProps {
    currentImageUrl?: string;
    onImageUpload: (imageUrl: string) => void;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export default function ProfilePictureUpload({ 
    currentImageUrl, 
    onImageUpload, 
    size = 'medium',
    className = '' 
}: ProfilePictureUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('File size must be less than 5MB');
            return;
        }

        setError(null);
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload/profile-picture', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
                setUploadProgress(i);
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            onImageUpload(result.url);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        if (!isUploading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className={`${styles.uploadContainer} ${className}`}>
            <div 
                className={`${styles.profilePictureWrapper} ${isUploading ? styles.uploading : ''}`}
                onClick={handleClick}
            >
                <ProfilePicture
                    src={currentImageUrl}
                    alt="Profile Picture"
                    size={size}
                    className={styles.profilePicture}
                />
                
                {isUploading && (
                    <div className={styles.uploadOverlay}>
                        <div className={styles.uploadProgress}>
                            <div 
                                className={styles.progressBar}
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <span className={styles.uploadText}>Uploading...</span>
                    </div>
                )}
                
                {!isUploading && (
                    <div className={styles.uploadIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 16L12 8M12 8L15 11M12 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 15V16C3 18.8284 3 20.2426 3.87868 21.1213C4.75736 22 6.17157 22 9 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={styles.fileInput}
                disabled={isUploading}
            />

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <p className={styles.uploadHint}>
                Click to upload a new profile picture
            </p>
        </div>
    );
}
