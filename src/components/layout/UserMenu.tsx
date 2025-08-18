'use client';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import styles from '@/styles/layout/userMenu.module.css';
import ProfilePicture from '@/components/common/ProfilePicture';
import { useProfilePicture } from '@/hooks/useProfilePicture';

export default function UserMenu() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { profilePicture, updateProfilePicture } = useProfilePicture();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    if (!session?.user) return null;

    const getDashboardUrl = () => {
        switch (session.user.userType) {
            case 'admin':
                return '/dashboard/admin';
            case 'borrower':
                return '/dashboard/borrower';
            case 'lender':
                return '/dashboard/lender';
            default:
                return '/dashboard';
        }
    };

    return (
        <div className={styles.userMenuContainer} ref={menuRef}>
            <button
                className={styles.userMenuButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User menu"
            >
                <ProfilePicture
                    src={profilePicture}
                    alt={session.user.name || 'User'}
                    size="small"
                    className={styles.userAvatar}
                />
                <span className={styles.userName}>
                    {session.user.name || session.user.email}
                </span>
                <span className={`${styles.dropdownArrow} ${isOpen ? styles.rotated : ''}`}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div className={styles.menuHeader}>
                        <ProfilePicture
                            src={profilePicture}
                            alt={session.user.name || 'User'}
                            size="medium"
                            className={styles.menuAvatar}
                        />
                        <div className={styles.menuUserInfo}>
                            <h4 className={styles.menuUserName}>
                                {session.user.name || 'User'}
                            </h4>
                            <p className={styles.menuUserRole}>
                                {(session.user as any).isSuperAdmin ? 'Super Admin' : 
                                 session.user.userType?.charAt(0).toUpperCase() + session.user.userType?.slice(1)}
                            </p>
                        </div>
                    </div>

                    <div className={styles.menuDivider}></div>

                    <Link
                        href={session.user.userType === 'admin' ? '/dashboard/admin?tab=home' : getDashboardUrl()}
                        className={styles.menuItem}
                        onClick={() => setIsOpen(false)}
                    >
                        <span className={styles.menuIcon}>🏠</span>
                        {session.user.userType === 'admin' ? 'Admin Panel' : 'Home'}
                    </Link>

                    <Link
                        href={session.user.userType === 'admin' ? '/dashboard/admin?tab=settings' : `${getDashboardUrl()}?tab=settings`}
                        className={styles.menuItem}
                        onClick={() => setIsOpen(false)}
                    >
                        <span className={styles.menuIcon}>⚙️</span>
                        Settings
                    </Link>

                    <div className={styles.menuDivider}></div>

                    <button
                        className={`${styles.menuItem} ${styles.logoutItem}`}
                        onClick={handleLogout}
                    >
                        <span className={styles.menuIcon}>🚪</span>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
