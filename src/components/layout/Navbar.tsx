"use client";
import React, {useState} from 'react';
import { useSession, signOut } from 'next-auth/react';
import styles from '@/styles/layout/navbar.module.css';
import Link from 'next/link';
import clsx from 'clsx';
import { useRouter } from "next/navigation";
import UserMenu from './UserMenu';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

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
                        <UserMenu />
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
                <Link className={styles.linkFont} href="/contact-us">Contact Us</Link>
            </div>

            {/*For Mobile*/}
            <div className={`${styles.links} ${isOpen ? styles.show : ''}`}>
                {status === 'loading' ? (
                    <span className={styles.linkFont}>Loading...</span>
                ) : session ? (
                    <>
                        <div className={styles.mobileUserMenu}>
                            <UserMenu />
                        </div>
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