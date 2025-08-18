import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { profileEvents } from '@/lib/profileEvents';

export const useProfilePicture = () => {
    const { data: session } = useSession();
    const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const fetchProfilePicture = async () => {
        if (!session?.user) return;
        
        try {
            setIsLoading(true);
            const response = await fetch('/api/users/profile');
            if (response.ok) {
                const userData = await response.json();
                setProfilePicture(userData.profile_picture || undefined);
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfilePicture = (newPictureUrl: string) => {
        setProfilePicture(newPictureUrl);
    };

    useEffect(() => {
        fetchProfilePicture();
        
        // Subscribe to profile update events
        const unsubscribe = profileEvents.subscribe(() => {
            fetchProfilePicture();
        });

        return unsubscribe;
    }, [session?.user?.id]);

    return {
        profilePicture,
        isLoading,
        fetchProfilePicture,
        updateProfilePicture
    };
};
