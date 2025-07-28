import styles from '@/styles/navbar.module.css';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link href="/">APPLOGO</Link>
            </div>
            <div className={styles.links}>
                <Link className={styles.linkFont} href="/about">About</Link>
                <Link className={styles.linkFont} href="/contact">Contact Us</Link>
                <Link className={styles.linkFont} href="/login">Login</Link>
            </div>
        </nav>
    );
}