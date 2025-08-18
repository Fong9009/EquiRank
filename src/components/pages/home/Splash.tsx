'use client';

import styles from "@/styles/pages/home/splash.module.css";
import clsx from "clsx";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";

export default function Splash() {
    const { data: session, status } = useSession();

    const getStartNowRoute = () => {
        if (status === 'loading') return '/register'; // Default while loading
        if (!session) return '/register'; // Not logged in
        
        // Logged in - route based on user type
        if (session?.user?.userType === 'admin') {
            return '/dashboard/admin';
        } else {
            return '/dashboard';
        }
    };

    const getStartNowText = () => {
        if (status === 'loading') return 'Start Now';
        if (!session) return 'Start Now';
        
        // Logged in - show "My Dashboard" for all users
        return 'My Dashboard';
    };

    return (
        <div className={styles.splashImage}>
            <video
                className={styles.backgroundVideo}
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/images/stocksVideoTrim.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className={styles.overlay}>
                {/*Title Text For Splash*/}
                <h1 className={clsx(styles.titleText,styles.fadeIn)}>EquiRank</h1>
                <h2 className={clsx(styles.subText,styles.fadeIn)}>Powering The Next Generation Of Investment</h2>
                <div className={styles.textBox}>
                    <p className={clsx(styles.paraText,styles.fadeIn)}>
                        Australia's cutting edge in Investment Technology where Investments meet Comparison
                        Data Driven Analysis to ensure that your Investments count.
                    </p>
                </div>

                {/*Splash Buttons*/}
                <div className={styles.buttonBox}>
                    <Link className={clsx(styles.startBtn, styles.fadeIn)} href={getStartNowRoute()}>
                        {getStartNowText()}
                    </Link>
                    <Link className={clsx(styles.learnBtn, styles.fadeIn)} href="/how-it-works">Learn More</Link>
                </div>
            </div>
        </div>
    )
}
