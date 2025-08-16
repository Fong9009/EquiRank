"use client";
import styles from "@/styles/pages/admin/adminHomepage.module.css";
import Ribbon from "@/components/common/Ribbon";
import { useEffect, useState } from "react";
import {useSession} from "next-auth/react";
import MetricCard from "@/components/common/MetricCard";
import { Users, Mail, Archive, UserCheck } from "lucide-react";

export default function AdminHomePage() {
    const { data: session } = useSession();

    const [userCount, setUserCount] = useState(0);
    const [contactCount, setContactCount] = useState(0);
    const [archiveCount, setArchiveCount] = useState(0);
    const [approvalCount, setApprovalCount] = useState(0);

    useEffect(() => {
        fetch("/api/admin/users")
            .then(res => res.json())
            .then(data => {
                setUserCount(data.length);
            })
            .catch(err => console.error("Fetch error:", err));
        fetch("/api/admin/contact-messages")
            .then(res => res.json())
            .then(data => {
                setContactCount(data.length);
            })
            .catch(err => console.error("Fetch error:", err));
        fetch("/api/admin/contact-messages/archived")
            .then(res => res.json())
            .then(data => {
                setArchiveCount(data.length);
            })
            .catch(err => console.error("Fetch error:", err));
        fetch("/api/admin/users/approval")
            .then(res => res.json())
            .then(data => {
                setApprovalCount(data.length);
            })
            .catch(err => console.error("Fetch error:", err));
    }, []);

    return(
        <div className={styles.adminHomePage}>
            <Ribbon username={session?.user?.name || "User"}/>
            <h1 className={styles.adminTitle}>Statistics</h1>
            <div className={styles.dividerContainer}><hr className={styles.divider}></hr></div>
            <div className={styles.cardContainer}>
                <MetricCard title={"Total Users"} value={userCount} icon={<Users size={150}/>}/>
                <MetricCard title={"Waiting For Approval"} value={approvalCount} icon={<UserCheck size={150}/>}/>
                <MetricCard title={"Total Messages"} value={contactCount} icon={<Mail size={150}/>}/>
                <MetricCard title={"Archived Messages"} value={archiveCount} icon={<Archive size={150}/>}/>
            </div>
        </div>
    )
}