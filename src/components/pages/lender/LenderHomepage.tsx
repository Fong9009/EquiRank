"use client"
import styles from '@/styles/pages/lender/homepage.module.css';
import {useSession} from 'next-auth/react';
import Ribbon from '@/components/common/Ribbon';
import {useEffect, useState} from "react";

export default function LenderHomepage() {
    const { data: session} = useSession();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    const windowBackground = theme === "light" ? styles.lightLenderHomePage : styles.darkLenderHomePage;
    const lenderTitleText = theme === "light" ? styles.lightLenderTitle : styles.darkLenderTitle;
    const divider = theme === "light" ? styles.lightDivider : styles.darkDivider;

    useEffect(() => {
        if (!session) return;
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

    return (
        <div className={windowBackground}>
            <Ribbon username={session?.user?.name || "User"} imageUrl={'/images/lender.jpg'} quote={'“Trust is the true currency of lending.”'}/>
            <h1 className={lenderTitleText}>Your Homepage</h1>
            <div className={styles.dividerContainer}><hr className={ divider}></hr></div>
        </div>
    )
}