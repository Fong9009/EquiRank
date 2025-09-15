'use client';
import Sidebar from '@/components/layout/Sidebar';
import styles from '@/styles/layout/dashboard.module.css';
import {useEffect, useState} from "react";

interface DashboardLayoutProps {
    role: 'borrower' | 'lender' | 'admin';
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
        <div  style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            backgroundColor: '#1f2123', 
            minHeight: '100vh',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
        }}>
            <Sidebar
                role={role}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                isSuperAdmin={isSuperAdmin}
            />
            <main className={`${styles.dashboardLayout} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`} style={{
                backgroundColor: '#1f2123',
                minHeight: '100vh',
                height: '100vh',
                overflow: 'auto',
                overflowX: 'hidden'
            }}>
                {children}
            </main>
        </div>
    );
}
