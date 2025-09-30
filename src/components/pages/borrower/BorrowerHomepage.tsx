"use client"
import styles from "@/styles/pages/borrower/homepage.module.css"
import {useSession} from "next-auth/react";
import Ribbon from "@/components/common/Ribbon";
import ProfileCompletionCard from "@/components/common/ProfileCompletionCard";
import {useEffect, useState} from "react";
import { profileEvents } from '@/lib/profileEvents';
import MetricCard from "@/components/common/MetricCard";
import {Archive, Handshake, ClipboardCheck, ChartNoAxesColumn} from "lucide-react";
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';

interface BorrowerStatistics {
    loanCount: number;
    activeLoanCount: number;
    loanFunded: number;
    companyCount: number;
}



export default function BorrowerHomepage() {
    const { data: session} = useSession();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const [borrowerStatistics, setBorrowerStatistics] = useState<BorrowerStatistics>({
        loanCount: 0,
        activeLoanCount: 0,
        loanFunded: 0,
        companyCount: 0,
    });
    
    const windowBackground = theme === "light" ? styles.lightBorrowerHomePage : styles.darkBorrowerHomePage;
    const borrowerTitleText = theme === "light" ? styles.lightBorrowerTitle : styles.darkBorrowerTitle;
    const divider = theme === "light" ? styles.lightDivider : styles.darkDivider;

    const fetcher = (url: string) => fetch(url).then(res => res.json());
    const params = useSearchParams();
    const companyId = params?.get('companyId');
    const { data: risk } = useSWR(companyId ? `/api/company-statistics/company-risk/${companyId}` : null, fetcher);

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

    const loadStatistics = async () => {
            try {
                    const response = await fetch("/api/borrower/borrower-statistics")
                    if (response.ok) {
                        const data = await response.json();
                        setBorrowerStatistics(data);
                        console.log("Borrower statistics:", data);
                    }
            } catch (error) {
                console.error('Error loading borrower statistics:', error);
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
        loadStatistics();
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
            <div>
                <h1 className={styles.subTitle}>Here is today's report and statistics</h1>
                <div className={styles.cardContainer}>
                    <MetricCard title={"Total Loans"} value={borrowerStatistics.loanCount} icon={<ChartNoAxesColumn size={110}/>}/>
                    <MetricCard title={"Active Loans"} value={borrowerStatistics.activeLoanCount} icon={<ClipboardCheck size={110}/>}/>
                    <MetricCard title={"Funded Loans"} value={borrowerStatistics.loanFunded} icon={<Handshake size={110}/>}/>
                    <MetricCard title={"Companies"} value={borrowerStatistics.companyCount} icon={<Archive size={110}/>}/>
                </div>
                {companyId && risk && (
                    <div style={{ marginTop: 16 }}>
                        <span style={{ fontWeight: 600 }}>Company Risk:</span>{' '}
                        <span>{String(risk.band).toUpperCase()} ({risk.score})</span>
                    </div>
                )}
            </div>
        </div>
    )
}