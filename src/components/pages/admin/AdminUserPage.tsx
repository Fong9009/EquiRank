"use client";
import styles from "@/styles/pages/admin/adminUserPage.module.css"
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import ApprovalDashboard from "@/components/pages/admin/ApprovalDashboard";
import ContactMessages from "@/components/pages/admin/ContactMessages";
import ArchivedMessages from "@/components/pages/admin/ArchivedMessages";
import ActiveUsers from "@/components/pages/admin/ActiveUsers";

export default function AdminUserPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'approval'>('active');

    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || (session.user as any).userType !== 'admin') {
            router.push('/login?redirect=/admin');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className={styles.adminPage}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontSize: '1.2rem',
                    color: '#666'
                }}>
                    Loading admin panel...
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminUserPage}>
            <h1 className={styles.adminTitle}>Manage Users</h1>
            <div className={styles.dividerContainer}><hr className={styles.divider}></hr></div>
            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'active' ? styles.active : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Users
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'approval' ? styles.active : ''}`}
                    onClick={() => setActiveTab('approval')}
                >
                    User Approval
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'archived' ? styles.active : ''}`}
                    onClick={() => setActiveTab('archived')}
                >
                    Archived
                </button>
            </div>
            <div className={styles.tabContent}>
                {activeTab === 'active' && <ActiveUsers/>}
                {activeTab === 'approval' && <ApprovalDashboard />}
                {activeTab === 'archived' && <ArchivedMessages />}
            </div>
        </div>
    );
}