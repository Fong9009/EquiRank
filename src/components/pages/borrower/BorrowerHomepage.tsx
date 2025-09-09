"use client"
import styles from "@/styles/pages/borrower/homepage.module.css"
import {useSession} from "next-auth/react";
import Ribbon from "@/components/common/Ribbon";
import ProfileCompletionCard from "@/components/common/ProfileCompletionCard";
import {useEffect, useState} from "react";
import { profileEvents } from '@/lib/profileEvents';

export default function BorrowerHomepage() {
    const { data: session} = useSession();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    
    const windowBackground = theme === "light" ? styles.lightBorrowerHomePage : styles.darkBorrowerHomePage;
    const borrowerTitleText = theme === "light" ? styles.lightBorrowerTitle : styles.darkBorrowerTitle;
    const divider = theme === "light" ? styles.lightDivider : styles.darkDivider;

    // Function to refresh profile completion
    const refreshProfileCompletion = async () => {
        try {
            const response = await fetch("/api/users/profile");
            if (response.ok) {
                const data = await response.json();
                // Use the stored profile completion percentage from database
                const completionPercentage = data.profile_completion_percentage || 0;
                setProfileCompletionPercentage(completionPercentage);
                setIsProfileComplete(completionPercentage >= 100);
            }
        } catch (error) {
            console.error('Error refreshing profile completion:', error);
        }
    };

    useEffect(() => {
        if (!session) return;
        
        // Load theme
        fetch("/api/users/theme")
            .then(res => res.json())
            .then(data => {
                if (data.theme) {
                    setTheme(data.theme.theme);
                } else {
                    setTheme("auto");
                }
            });
        
        // Load profile completion status
        refreshProfileCompletion();
    }, [session]);

    // Listen for profile update events
    useEffect(() => {
        const unsubscribe = profileEvents.subscribe(() => {
            refreshProfileCompletion();
        });

        return unsubscribe;
    }, []);

    const handleBannerDismiss = () => {
        setBannerDismissed(true);
    };

    return (
        <div className={windowBackground}>
            <Ribbon username={session?.user?.name || "User"} imageUrl={'/images/borrower.jpg'} quote={'"Every borrowed dollar is a seed—invest it where it can grow."'}/>
            
            <h1 className={borrowerTitleText}>Your Homepage</h1>
            <div className={styles.dividerContainer}><hr className={divider}></hr></div>
            
            {!isProfileComplete && !bannerDismissed && (
                <ProfileCompletionCard
                    completionPercentage={profileCompletionPercentage}
                    userType="borrower"
                    onDismiss={handleBannerDismiss}
                />
            )}
        </div>
    )
}