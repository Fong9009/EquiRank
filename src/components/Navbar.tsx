"use client";
import React, {useState} from 'react';
import styles from '@/styles/navbar.module.css';
import Link from 'next/link';
import clsx from "clsx";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link href="/">APPLOGO</Link>
            </div>
            <div className={styles.hamburger} onClick={toggleMenu}>
                &#9776;
            </div>
            {/*For Desktop*/}
            <div className={styles.centerLinks}>
                <Link className={styles.linkFont} href="/">Home</Link>
                <Link className={styles.linkFont} href="/about">About Us</Link>
                <Link className={styles.linkFont} href="/how-it-works">How it Works</Link>
                <Link className={styles.linkFont} href="/pricing">Pricing</Link>
                <Link className={styles.linkFont} href="/contact-us">Contact</Link>
            </div>

            {/*For Mobile*/}
            <div className={`${styles.links} ${isOpen ? styles.show : ''}`}>
                <Link className={styles.linkFont} onClick={closeMenu} href="/login">Login</Link>
                <Link className={styles.linkFont} onClick={closeMenu} href="/about">About Us</Link>
                <Link className={styles.linkFont} onClick={closeMenu} href="/how-it-works">How it Works</Link>
                <Link className={styles.linkFont} onClick={closeMenu} href="/pricing">Pricing</Link>
                <Link className={styles.linkFont} onClick={closeMenu} href="/contact-us">Contact</Link>
            </div>

            {/*For Desktop Buttons*/}
            <div className={styles.rightButtons}>
                <Link className={clsx(styles.joinBtn, styles.navButton)} href="/join">Join Now</Link>
                <Link className={clsx(styles.loginBtn, styles.navButton)} href="/login">Login</Link>
            </div>
        </nav>
    );
}