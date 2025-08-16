'use client';
import Sidebar from '@/components/layout/Sidebar';
import styles from '@/styles/layout/dashboard.module.css';
import {useEffect, useState} from "react";

interface DashboardLayoutProps {
    role: string;
    children: React.ReactNode;
}

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return (
        <div  style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Sidebar role={role} />
            <main className={styles.dashboardLayout}>
                {children}
            </main>
        </div>
    );
}
