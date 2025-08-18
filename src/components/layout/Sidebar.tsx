// components/Sidebar.tsx
'use client';
import { useEffect, useState } from 'react';
import { Home, Settings, Users, Briefcase, Phone } from "lucide-react";
import styles from '@/styles/layout/sidebar.module.css'

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

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) setActiveTab(savedTab);
    }, [setActiveTab]);

    if (!mounted) return null;

    const navSections =
        role === 'admin'
            ? [
                {
                    title: 'General',
                    items: [{ name: 'home', icon: Home }]
                },
                {
                    title: 'Management',
                    items: [
                        { name: 'Manage Users', icon: Users },
                        { name: 'Manage Contact', icon: Phone }
                    ]
                }
            ]
            : role === 'lender'
                ? [
                    {
                        title: 'Lender',
                        items: [
                            { name: 'home', icon: Home },
                            { name: 'settings', icon: Settings }
                        ]
                    }
                ]
                : [
                    {
                        title: 'Borrower',
                        items: [
                            { name: 'home', icon: Home },
                            { name: 'settings', icon: Settings }
                        ]
                    }
                ];

    const handleTabClick = (name: string) => {
        setActiveTab(name);
        localStorage.setItem('activeTab', name); // Save tab
    };

    return (
        <div className={styles.sidebarContainer}>
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
                <h2 className={styles.sidebarTitle}>Dashboard</h2>

                {navSections.map(section => (
                    <div key={section.title} className={styles.navSection}>
                        {/* Section title */}
                        <h3 className={styles.navSectionTitle}>{section.title}</h3>

                        {/* Section items */}
                        <ul className={styles.navList}>
                            {section.items.map(({ name, icon: Icon }) => (
                                <li key={name} className={activeTab === name ? styles.navLinkActive : ''}>
                                    <button
                                        onClick={() => { setActiveTab(name); handleTabClick(name); }}
                                        className={styles.navLink}
                                    >
                                        <Icon size={20} />
                                        {isOpen && name.charAt(0).toUpperCase() + name.slice(1)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
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
