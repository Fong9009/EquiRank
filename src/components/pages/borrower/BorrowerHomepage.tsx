"use client"
import styles from "@/styles/pages/borrower/homepage.module.css"
import {useSession} from "next-auth/react";
import Ribbon from "@/components/common/Ribbon";
import {useEffect, useState} from "react";

export default function BorrowerHomepage() {
    const { data: session} = useSession();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    const windowBackground = theme === "light" ? styles.lightBorrowerHomePage : styles.darkBorrowerHomePage;
    const borrowerTitleText = theme === "light" ? styles.lightBorrowerTitle : styles.darkBorrowerTitle;
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
            <Ribbon username={session?.user?.name || "User"} imageUrl={'/images/borrower.jpg'} quote={'“Every borrowed dollar is a seed—invest it where it can grow.”'}/>
            <h1 className={borrowerTitleText}>Your Homepage</h1>
            <div className={styles.dividerContainer}><hr className={divider}></hr></div>
        </div>
    )
}