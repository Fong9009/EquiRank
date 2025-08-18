// components/Sidebar.tsx
'use client';
import { useEffect, useState } from 'react';
import { Home, Settings, Users, Briefcase, Phone, User } from "lucide-react";
import styles from '@/styles/layout/sidebar.module.css'
import ProfilePicture from '@/components/common/ProfilePicture';
import { useSession } from 'next-auth/react';
import { useProfilePicture } from '@/hooks/useProfilePicture';

interface SidebarProps {
    role: string;
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

    const navItems =
        role === 'admin'
            ? [
                { name: 'home', icon: Home },
                { name: 'Manage Users', icon: Users },
                { name: 'Manage Contact', icon: Phone },
                { name: 'settings', icon: Settings }
            ]
            : role === 'lender'
                ? [
                    { name: 'home', icon: Home },
                    { name: 'settings', icon: Settings }
                ]
                : [
                    { name: 'home', icon: Home },
                    { name: 'settings', icon: Settings }
                ];

    const handleTabClick = (name: string) => {
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
                        <p className={styles.userRole}>
                            {(session?.user as any)?.isSuperAdmin ? 'Super Admin' : 
                             role.charAt(0).toUpperCase() + role.slice(1)}
                        </p>
                    </div>
                </div>
                
                <h2 className={styles.sidebarTitle}>Dashboard</h2>
                <ul className={styles.navList}>
                    {navItems.map(({ name, icon: Icon }) => (
                        <li key={name} className={activeTab === name ? styles.navLinkActive : ''}>
                            <button
                                onClick={() => {setActiveTab(name); handleTabClick(name)}}
                                className={styles.navLink}
                            >
                                <Icon size={20} />
                                {isOpen && name.charAt(0).toUpperCase() + name.slice(1)}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

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
