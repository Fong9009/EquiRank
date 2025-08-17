"use client"
import styles from "@/styles/pages/borrower/homepage.module.css"
import {useSession} from "next-auth/react";
import Ribbon from "@/components/common/Ribbon";

export default function BorrowerHomepage() {
    const { data: session } = useSession();
    return (
        <div className={styles.homePage}>
            <Ribbon username={session?.user?.name || "User"} imageUrl={'/images/borrower.jpg'} quote={'“Every borrowed dollar is a seed—invest it where it can grow.”'}/>
            <h1 className={styles.title}>Your Homepage</h1>
            <div className={styles.dividerContainer}><hr className={styles.divider}></hr></div>
        </div>
    )
}