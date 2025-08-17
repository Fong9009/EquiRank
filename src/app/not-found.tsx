import Link from "next/link";
import styles from "@/styles//utils/notfound.module.css";

export default function NotFound() {
    return (
        <div className={styles.container} style={{ backgroundImage: `url('/images/lender.jpg')`}}>
            <div className={styles.overlay}>
                <h1 className={styles.title}>404</h1>
                <p className={styles.message}>Oops! This page does not exist.</p>
                <Link href="/" className={styles.homeLink}>
                    Go back home
                </Link>
            </div>
        </div>
    );
}