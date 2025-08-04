"use client";
import Link from 'next/link';
import clsx from 'clsx';
import React from 'react';
import styles from '@/styles/layout/footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footerBox}>
            <div className={styles.footerTop}>
                <div className={styles.footerTitle}>
                    <h4>EquiRank</h4>
                    <p className={styles.footerTitleText}>Powering the Next Generation<br/>Of Investment </p>
                </div>
                <div className={styles.footerColumn}>
                    <h3 className={clsx(styles.columnTitle,styles.columnTitleUnderline)}>About</h3>
                    <Link className={styles.columnLink} href="/about">About Us</Link>
                    <Link className={styles.columnLink} href="/pricing">Pricing</Link>
                </div>
                <div className={styles.footerColumn}>
                    <h3 className={clsx(styles.columnTitle,styles.columnTitleUnderline)}>Resources</h3>
                    <Link className={styles.columnLink} href="/how-it-works">How It Works</Link>
                    <Link className={styles.columnLink} href="/doc">Documentation</Link>
                </div>
                <div className={styles.footerColumn}>
                    <h3 className={clsx(styles.columnTitle,styles.columnTitleUnderline)}>Support</h3>
                    <p className={styles.columnText}>Phone: </p>
                    <p className={styles.columnText}>Email: </p>
                    <Link className={styles.columnLink} href="/contact">Contact Us</Link>
                </div>
            </div>
            <div className={styles.footerBottom}>
                &copy; 2025 Your Company. All rights reserved.
            </div>
        </footer>
    );
}