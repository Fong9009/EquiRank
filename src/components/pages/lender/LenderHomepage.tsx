"use client"
import styles from '@/styles/pages/lender/homepage.module.css';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import Ribbon from '@/components/common/Ribbon';
import FundedLoansList from '@/components/pages/lender/FundedLoansList';
import {useEffect, useState} from "react";
import RecentSearches from "@/components/pages/lender/RecentSearches";
import useSWR from 'swr';

export default function LenderHomepage() {
    const { data: session} = useSession();
    const router = useRouter();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    
    const windowBackground = theme === "light" ? styles.lightLenderHomePage : styles.darkLenderHomePage;
    const lenderTitleText = theme === "light" ? styles.lightLenderTitle : styles.darkLenderTitle;
    const divider = theme === "light" ? styles.lightDivider : styles.darkDivider;

    const fetcher = (url: string) => fetch(url).then(res => res.json());
    const { data: available } = useSWR('/api/loan-requests/available', fetcher);

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
    }, [session]);

    const handleViewOpportunities = () => {
        router.push('/dashboard/lender?tab=loan-requests');
    };

    return (
        <div className={windowBackground}>
            <Ribbon username={session?.user?.name || "User"} imageUrl={'/images/lender.jpg'} quote={'“Trust is the true currency of lending.”'}/>
            <h1 className={lenderTitleText}>Your Homepage</h1>
            <div className={styles.dividerContainer}><hr className={ divider}></hr></div>
            <div className={styles.dashboardGrid}>
              <div className={styles.dashboardCard}>
                <h3 className={styles.cardTitle}>Available Opportunities</h3>
                <p className={styles.cardDescription}>Browse and fund loan requests from borrowers</p>
                <button onClick={handleViewOpportunities} className={styles.cardButton}>
                  View Opportunities
                </button>
              </div>
            </div>
            <div className={styles.fundedLoansSection}>
              <h2 className={styles.sectionTitle}>My Funded Loans</h2>
              <FundedLoansList />
            </div>
            <div className={styles.fundedLoansSection}>
                <h2 className={styles.sectionTitle}>Recent Searches</h2>
                <RecentSearches/>
            </div>
        </div>
    )
}