// components/Sidebar.tsx
'use client';
import { useEffect, useState } from 'react';
import { Home, Settings, Users, Briefcase, Phone, User, Trash2, FileText, Plus, CheckCircle2 } from "lucide-react";
import styles from '@/styles/layout/sidebar.module.css'
import ProfilePicture from '@/components/common/ProfilePicture';
import UserTypeBadge from '@/components/common/UserTypeBadge';
import { useSession } from 'next-auth/react';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { useSearchParams } from "next/navigation";
import Link from 'next/link';

interface SidebarProps {
    role: 'borrower' | 'lender' | 'admin';
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    toggleSidebar: () => void;
    isSuperAdmin?: boolean;
}

export default function Sidebar({ role, activeTab, setActiveTab, isOpen, toggleSidebar, isSuperAdmin = false, }: SidebarProps) {
    const [mounted, setMounted] = useState(false);
    const { data: session } = useSession();
    const { profilePicture } = useProfilePicture();
    const searchParams = useSearchParams();
    const activeSelectedTab = searchParams.get("tab") || "home"; // default to home

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const savedTab = localStorage.getItem('activeTab');
        // Only restore from localStorage if no specific tab is already set
        if (savedTab && !activeTab) {
            setActiveTab(savedTab);
        }
    }, [setActiveTab, activeTab]);

    if (!mounted) return null;

    const navSections =
        role === 'admin'
            ? [
                {
                    title: 'General',
                    items: [
                        { name: 'Home', icon: Home, path: '/dashboard/admin?tab=home', tabKey: 'home' },
                        { name: 'Settings', icon: Settings, path: '/dashboard/admin?tab=settings', tabKey: 'settings' }
                    ]
                },
                {
                    title: 'Management',
                    items: [
                        { name: 'Manage Users', icon: Users, path: '/dashboard/admin?tab=manage-users', tabKey: 'manage-users' },
                        { name: 'Manage Contact', icon: Phone, path: '/dashboard/admin?tab=manage-contact', tabKey: 'manage-contact' },
                        { name: 'Loan Requests', icon: FileText, path: '/dashboard/admin?tab=loan-requests', tabKey: 'loan-requests' },
                        { name: 'Archived Loan Requests', icon: FileText, path: '/dashboard/admin?tab=archived-loan-requests', tabKey: 'archived-loan-requests' }
                    ]
                },
                {
                    title: 'System',
                    items: [
                        { name: 'File Cleanup', icon: Trash2, path: '/dashboard/admin?tab=file-cleanup', tabKey: 'file-cleanup' }
                    ]
                }
            ]
            : role === 'lender'
                ? [
                    {
                        title: 'Lender',
                        items: [
                            { name: 'Home', icon: Home, path: '/dashboard/lender?tab=home', tabKey: 'home' },
                            { name: 'Loan Requests', icon: FileText, path: '/dashboard/lender?tab=loan-requests', tabKey: 'loan-requests' },
                            { name: 'Funded Loans', icon: CheckCircle2, path: '/dashboard/lender?tab=funded-loans', tabKey: 'funded-loans' },
                            { name: 'Settings', icon: Settings, path: '/dashboard/lender?tab=settings', tabKey: 'settings' }
                        ]
                    }
                ]
                : [
                    {
                        title: 'Borrower',
                        items: [
                            { name: 'Home', icon: Home, path: '/dashboard/borrower?tab=home', tabKey: 'home' },
                            { name: 'Loan Requests', icon: FileText, path: '/dashboard/borrower?tab=loan-requests', tabKey: 'loan-requests' },
                            { name: 'New Request', icon: Plus, path: '/dashboard/borrower?tab=new-request', tabKey: 'new-request' },
                            { name: 'Settings', icon: Settings, path: '/dashboard/borrower?tab=settings', tabKey: 'settings' }
                        ]
                    }
                ];



    const handleTabClick = (name: string) => {
        console.log('Sidebar tab clicked:', name);
        setActiveTab(name);
        // Save tab to localStorage for persistence
        localStorage.setItem('activeTab', name);
        // Clear any URL tab parameters when clicking sidebar tabs
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (name === 'home') {
                url.searchParams.delete('tab');
            } else {
                url.searchParams.set('tab', name);
            }
            window.history.replaceState({}, '', url.toString());
        }
    };

    return (
        <div className={styles.sidebarContainer}>
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
                <div className={styles.profileSection}>
                    <ProfilePicture 
                        src={profilePicture}
                        alt={session?.user?.name || 'User'}
                        size="large"
                        className={styles.profilePicture}
                    />
                    <div className={styles.userInfo}>
                        <h3 className={styles.userName}>
                            {session?.user?.name || 'User'}
                        </h3>
                        <UserTypeBadge
                            userType={role}
                            isSuperAdmin={isSuperAdmin}
                            size="medium"
                            className={styles.sidebarUserTypeBadge}
                        />
                    </div>
                </div>
                
                <h2 className={styles.sidebarTitle}>Dashboard</h2>

                {navSections.map(section => (
                    <div key={section.title} className={styles.navSection}>
                        <h3 className={styles.navSectionTitle}>{section.title}</h3>
                        <ul className={styles.navList}>
                            {section.items.map(({ name, icon: Icon, path, tabKey }) => (
                                <li key={tabKey} className={activeSelectedTab === tabKey ? styles.navLinkActive : ''}>
                                    <Link href={path} className={styles.navLink}>
                                        <Icon size={20} />
                                        {isOpen && name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </aside>

            {/* Mobile backdrop */}
            {isOpen && (
                <div 
                    className={styles.mobileBackdrop}
                    onClick={toggleSidebar}
                />
            )}

            {/* Toggle circle */}
            <button
                className={`${styles.toggleCircle} ${isOpen ? styles.openCircle : styles.closedCircle}`}
                onClick={toggleSidebar}
            >
                {isOpen ? '<' : '>'}
            </button>
        </div>

    );
}
