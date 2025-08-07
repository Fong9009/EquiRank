import styles from "@/styles/pages/contact/contactSplash.module.css";

export default function ContactSplash() {
    return (
        <div className={styles.splashImage} style={{ backgroundImage: `url('/images/trading.jpg')`}}>
            <div className={styles.splashTextBox}>
                <h1 className={styles.titleSplashText}>Contact Us</h1>
                <h2 className={styles.secondTitleText}>Get In Touch With Our Team</h2>
                <p className={styles.splashParaText}>
                    Have questions about EquiRank? We're here to help. Reach out to our team 
                    for support, partnerships, or any inquiries about our investment technology platform.
                </p>
            </div>
        </div>
    )
}
