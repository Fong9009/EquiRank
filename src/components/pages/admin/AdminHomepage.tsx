"use client";
import styles from "@/styles/pages/admin/adminHomepage.module.css";
import Ribbon from "@/components/common/Ribbon";
import { useEffect, useState } from "react";
import {useSession} from "next-auth/react";
import MetricCard from "@/components/common/MetricCard";
import { Users, Mail, Archive, UserCheck } from "lucide-react";

export default function AdminHomePage() {
    const { data: session } = useSession();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

    const [userCount, setUserCount] = useState(0);
    const [contactCount, setContactCount] = useState(0);
    const [archiveCount, setArchiveCount] = useState(0);
    const [approvalCount, setApprovalCount] = useState(0);
    const windowBackground = theme === "light" ? styles.lightAdminHomePage : styles.darkAdminHomePage;
    const adminTitleText = theme === "light" ? styles.lightAdminTitle : styles.darkAdminTitle;

    useEffect(() => {
        const load = async () => {
            try {
                const [usersRes, msgsRes, archivedRes, pendingRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/contact-messages'),
                    fetch('/api/admin/contact-messages/archived'),
                    fetch('/api/admin/users/approval'),
                ]);
                const [users, msgs, archived, pending] = await Promise.all([
                    usersRes.json(), msgsRes.json(), archivedRes.json(), pendingRes.json()
                ]);
                setUserCount(users.length || 0);
                setContactCount(msgs.length || 0);
                setArchiveCount(archived.length || 0);
                setApprovalCount(pending.length || 0);
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };
        load();
    }, []);

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

    return(
        <div className={windowBackground}>
            <Ribbon username={session?.user?.name || "User"} imageUrl={'/images/mountain.jpg'} quote={'"Patience and vigilance pay both in servers and stocks"'}/>
            <h1 className={adminTitleText}>Dashboard</h1>
            <h1 className={styles.adminSubTitle}>Here is today's report and statistics</h1>
            <div className={styles.cardContainer}>
                <MetricCard title={"Total Users"} value={userCount} icon={<Users size={110}/>}/>
                <MetricCard title={"Waiting For Approval"} value={approvalCount} icon={<UserCheck size={110}/>}/>
                <MetricCard title={"Total Messages"} value={contactCount} icon={<Mail size={110}/>}/>
                <MetricCard title={"Archived Messages"} value={archiveCount} icon={<Archive size={110}/>}/>
            </div>
        </div>
    )
}