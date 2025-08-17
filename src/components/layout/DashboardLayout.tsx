'use client';
import Sidebar from '@/components/layout/Sidebar';
import styles from '@/styles/layout/dashboard.module.css';
import {useEffect, useState} from "react";

interface DashboardLayoutProps {
    role: string;
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isSuperAdmin?: boolean;
}

export default function DashboardLayout({ role, children, activeTab, setActiveTab, isSuperAdmin = false }: DashboardLayoutProps) {
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return (
        <div  style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Sidebar
                role={role}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                isSuperAdmin={isSuperAdmin}
            />
            <main className={styles.dashboardLayout}    style={{
                marginLeft: sidebarOpen ? '250px' : '0px', // adjust dynamically
                transition: 'margin-left 0.3s ease', // smooth animation
            }}>
                {children}
            </main>
        </div>
    );
}
