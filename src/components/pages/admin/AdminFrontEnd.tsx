'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ContactMessages from '@/components/pages/admin/ContactMessages';
import ArchivedMessages from '@/components/pages/admin/ArchivedMessages';
import styles from '@/styles/pages/admin/adminPage.module.css';
import clsx from 'clsx';

export default function AdminFrontPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<'messages' | 'archived'>('messages');
    const router = useRouter();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    //Colour Mode Editing
    const textColour = theme === "light" ? styles.lightTextColour : styles.darkTextColour;
    const backgroundColour = theme === "light" ? styles.lightBackground : styles.darkBackground;
    const pageColour = theme === "light" ? styles.lightPage : styles.darkPage

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

    if (!session?.user || (session.user as any).userType !== 'admin') {
        return null; // Will redirect
    }

    return (
        <div className={clsx(styles.adminPage, pageColour)}>
            <h1 className={clsx(styles.adminTitle, textColour)}>Manage Contacts</h1>
            <div className={clsx(styles.dividerContainer, textColour)}><hr className={styles.divider}></hr></div>
            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'messages' ? styles.active : ''}`}
                    onClick={() => setActiveTab('messages')}
                >
                    Contact Messages
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'archived' ? styles.active : ''}`}
                    onClick={() => setActiveTab('archived')}
                >
                    Archived Messages
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'messages' && <ContactMessages />}
                {activeTab === 'archived' && <ArchivedMessages />}
            </div>
        </div>
    );
}
