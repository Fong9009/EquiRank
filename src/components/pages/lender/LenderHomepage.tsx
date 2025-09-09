"use client"
import styles from '@/styles/pages/lender/homepage.module.css';
import {useSession} from 'next-auth/react';
import Ribbon from '@/components/common/Ribbon';
import ProfileCompletionBanner from '@/components/common/ProfileCompletionBanner';
import ProfileCompletionWizard from '@/components/pages/profile/ProfileCompletionWizard';
import FundedLoansList from '@/components/pages/lender/FundedLoansList';
import {useEffect, useState} from "react";

export default function LenderHomepage() {
    const { data: session} = useSession();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    const [showProfileWizard, setShowProfileWizard] = useState(false);
    const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<any>({});
    
    const windowBackground = theme === "light" ? styles.lightLenderHomePage : styles.darkLenderHomePage;
    const lenderTitleText = theme === "light" ? styles.lightLenderTitle : styles.darkLenderTitle;
    const divider = theme === "light" ? styles.lightDivider : styles.darkDivider;

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
        fetch("/api/users/profile")
            .then(res => res.json())
            .then(data => {
                if (data.profile_completion_percentage !== undefined) {
                    setProfileCompletionPercentage(data.profile_completion_percentage);
                    setIsProfileComplete(data.profile_completion_percentage >= 100);
                    setCurrentProfile(data);
                }
            })
            .catch(error => {
                console.error('Error loading profile completion:', error);
            });
    }, [session]);

    const handleStartWizard = () => {
        setShowProfileWizard(true);
    };

    const handleWizardComplete = () => {
        setShowProfileWizard(false);
        setProfileCompletionPercentage(100);
        setIsProfileComplete(true);
        // Refresh the page to update the UI
        window.location.reload();
    };

    const handleWizardCancel = () => {
        setShowProfileWizard(false);
    };

    const handleBannerDismiss = () => {
        setBannerDismissed(true);
    };

    if (showProfileWizard) {
        return (
            <div className={windowBackground}>
                <ProfileCompletionWizard
                    userType="lender"
                    currentProfile={currentProfile}
                    onComplete={handleWizardComplete}
                    onCancel={handleWizardCancel}
                />
            </div>
        );
    }

    return (
        <div className={windowBackground}>
            <Ribbon username={session?.user?.name || "User"} imageUrl={'/images/lender.jpg'} quote={'“Trust is the true currency of lending.”'}/>
            
            {!isProfileComplete && !bannerDismissed && (
                <ProfileCompletionBanner
                    completionPercentage={profileCompletionPercentage}
                    userType="lender"
                    onStartWizard={handleStartWizard}
                    onDismiss={handleBannerDismiss}
                />
            )}
            
            <h1 className={lenderTitleText}>Your Homepage</h1>
            <div className={styles.dividerContainer}><hr className={ divider}></hr></div>
            
            <div className={styles.dashboardGrid}>
              <div className={styles.dashboardCard}>
                <h3 className={styles.cardTitle}>Available Opportunities</h3>
                <p className={styles.cardDescription}>Browse and fund loan requests from borrowers</p>
                <a href="/dashboard/lender/loan-requests" className={styles.cardButton}>
                  View Opportunities
                </a>
              </div>
            </div>
            
            <div className={styles.fundedLoansSection}>
              <h2 className={styles.sectionTitle}>My Funded Loans</h2>
              <FundedLoansList />
            </div>
        </div>
    )
}