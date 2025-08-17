"use client";
import React, {useState} from 'react';
import { useSession, signOut } from 'next-auth/react';
import styles from '@/styles/layout/navbar.module.css';
import Link from 'next/link';
import clsx from 'clsx';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session, status } = useSession();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    return (
        <nav className={styles.navbar}>

            <div className={styles.logo}>
                <Link href="/">
                    <img 
                        src="/EquiRank.png" 
                        alt="EquiRank Logo" 
                        className={styles.logoImage}
                    />
                    <span className={styles.logoText}>EquiRank</span>
                </Link>
            </div>
            <div className={styles.hamburger} onClick={toggleMenu}>
                &#9776;
            </div>

            {/*For Desktop Buttons*/}
            <div className={styles.rightButtons}>
                {status === 'loading' ? (
                    <span className={styles.loadingText}>Loading...</span>
                ) : session ? (
                    <>
                        <span className={styles.userInfo}>
                            Welcome, {session.user?.name || session.user?.email}
                        </span>
                        {session.user?.userType === 'admin' && (
                            <Link className={clsx(styles.adminBtn, styles.navButton)} href="/dashboard/admin">
                                Admin Panel 
                            </Link>
                        )}
                        <button 
                            className={clsx(styles.logoutBtn, styles.navButton)} 
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link className={clsx(styles.joinBtn, styles.navButton)} href="/register">Join Now</Link>
                        <Link className={clsx(styles.loginBtn, styles.navButton)} href="/login">Login</Link>
                    </>
                )}
            </div>

            {/*For Desktop*/}
            <div className={styles.centerLinks}>
                <Link className={styles.linkFont} href="/">Home</Link>
                <Link className={styles.linkFont} href="/about">About Us</Link>
                <Link className={styles.linkFont} href="/contact-us">Contact</Link>
            </div>

            {/*For Mobile*/}
            <div className={`${styles.links} ${isOpen ? styles.show : ''}`}>
                {status === 'loading' ? (
                    <span className={styles.linkFont}>Loading...</span>
                ) : session ? (
                    <>
                        <span className={styles.linkFont}>
                            Welcome, {session.user?.name || session.user?.email}
                        </span>
                        {session.user?.userType === 'admin' && (
                            <Link className={styles.linkFont} onClick={closeMenu} href="/admin">
                                Admin Panel
                            </Link>
                        )}
                        <button 
                            className={styles.linkFont} 
                            onClick={() => { closeMenu(); handleLogout(); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link className={styles.linkFont} onClick={closeMenu} href="/register">Join Now</Link>
                        <Link className={styles.linkFont} onClick={closeMenu} href="/login">Login</Link>
                    </>
                )}
                <Link className={styles.linkFont} onClick={closeMenu} href="/about">About Us</Link>
                <Link className={styles.linkFont} onClick={closeMenu} href="/contact-us">Contact</Link>
            </div>
        </nav>
    );
}