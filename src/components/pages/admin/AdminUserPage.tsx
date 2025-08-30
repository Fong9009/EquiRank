"use client";
import styles from "@/styles/pages/admin/adminUserPage.module.css"
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import ApprovalDashboard from "@/components/pages/admin/ApprovalDashboard";
import AddAdmin from "@/components/pages/admin/AddAdmin";
import ActiveUsers from "@/components/pages/admin/ActiveUsers";
import ArchivedUsers from "./ArchivedUsers";
import clsx from "clsx";

export default function AdminUserPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<'active' | 'approvals' | 'archived' | 'add-admin'>('active');
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    const windowBackground = theme === "light" ? styles.lightBackground : styles.darkBackground;
    const titleText = theme === "light" ? styles.lightText : styles.darkText;

    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || session.user.userType !== 'admin') {
            router.push('/login?redirect=/dashboard/admin');
            return;
        }
    }, [session, status, router]);

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

    const isSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin);

    // Prevent non–super admins from accessing the Add Admin tab directly
    useEffect(() => {
        if (!isSuperAdmin && activeTab === 'add-admin') {
            setActiveTab('active');
        }
    }, [isSuperAdmin, activeTab]);

    return (
        <div className={windowBackground}>
            <h1 className={clsx(styles.adminTitle,titleText)}>Manage Users</h1>
            <div className={clsx(styles.dividerContainer,  titleText)}><hr className={styles.divider}></hr></div>
            <div className={styles.tabContainer} style={{ maxWidth: Boolean((session?.user as any)?.isSuperAdmin) ? '750px' : '575px' }}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'approvals' ? styles.active : ''}`}
                    onClick={() => setActiveTab('approvals')}
                >
                    User Approvals
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'active' ? styles.active : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Users
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'archived' ? styles.active : ''}`}
                    onClick={() => setActiveTab('archived')}
                >
                    Inactive Users
                </button>
                {isSuperAdmin && (
                    <button
                        className={`${styles.tabButton} ${activeTab === 'add-admin' ? styles.active : ''}`}
                        onClick={() => setActiveTab('add-admin')}
                    >
                        Add Admin
                    </button>
                )}
                
            </div>
            <div className={styles.tabContent}>
                {activeTab === 'active' && <ActiveUsers/>}
                {activeTab === 'approvals' && <ApprovalDashboard />}
                {activeTab === 'archived' && <ArchivedUsers />}
                {isSuperAdmin && activeTab === 'add-admin' && <AddAdmin />}
                
            </div>
        </div>
    );
}