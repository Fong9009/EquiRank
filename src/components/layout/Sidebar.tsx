// components/Sidebar.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/layout/sidebar.module.css'

export default function Sidebar({role}: {role: string}) {
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const navItems = role === 'lender' ? [
        { href: '/dashboard/lender', label: 'Lender Home' },
        { href: '/dashboard/lender/investments', label: 'Company Search' },
        { href: '/dashboard/lender/settings', label: 'Recent Searches' },
    ] : role === 'admin' ? [
        { href: '/dashboard/admin', label: 'Admin Home' },
        { href: '/dashboard/admin/users', label: 'Manage Users' },
        { href: '/dashboard/admin/settings', label: 'Settings' },
    ] : [
        { href: '/dashboard/borrower', label: 'Borrower Home' },
        { href: '/dashboard/borrower/loans', label: 'My Company' },
        { href: '/dashboard/borrower/settings', label: 'Settings' },
    ];

    return (
        <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Dashboard</h2>
            <ul className={styles.navList}>
                {navItems.map((item) => (
                    <li key={item.href} className={styles.navItem}>
                        <Link
                            href={item.href}
                            className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
