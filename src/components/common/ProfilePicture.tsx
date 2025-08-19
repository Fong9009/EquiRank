'use client';
import { useState } from 'react';
import styles from '@/styles/components/profilePicture.module.css';

interface ProfilePictureProps {
    src?: string;
    alt: string;
    size?: 'small' | 'medium' | 'large';
    fallbackText?: string;
    className?: string;
}

export default function ProfilePicture({ 
    src, 
    alt, 
    size = 'medium', 
    fallbackText,
    className = '' 
}: ProfilePictureProps) {
    const [imageError, setImageError] = useState(false);
    
    // Debug logging for profile picture issues
    if (src && !src.startsWith('http') && !src.startsWith('/uploads/')) {
        console.warn('Invalid profile picture URL:', src);
    }
    
    // Generate fallback initials from alt text
    const getInitials = (name: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle image load error
    const handleImageError = () => {
        setImageError(true);
    };

    // If we have a valid image source and no error, show the image
    if (src && !imageError && (src.startsWith('http') || src.startsWith('/uploads/'))) {
        return (
            <img
                src={src}
                alt={alt}
                className={`${styles.profilePicture} ${styles[size]} ${className}`}
                onError={handleImageError}
            />
        );
    }

    // Otherwise, show fallback with initials
    return (
        <div className={`${styles.profilePicture} ${styles.fallback} ${styles[size]} ${className}`}>
            <span className={styles.initials}>
                {fallbackText || getInitials(alt)}
            </span>
        </div>
    );
}
