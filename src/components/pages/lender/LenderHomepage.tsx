"use client"
import styles from '@/styles/pages/lender/homepage.module.css';
import {useSession} from 'next-auth/react';
import Ribbon from '@/components/common/Ribbon';

export default function LenderHomepage() {
    const { data: session } = useSession();
    return (
        <div className={styles.homePage}>
            <Ribbon username={session?.user?.name || "User"} imageUrl={'/images/lender.jpg'} quote={'“Trust is the true currency of lending.”'}/>
            <h1 className={styles.title}>Your Homepage</h1>
            <div className={styles.dividerContainer}><hr className={styles.divider}></hr></div>
        </div>
    )
}