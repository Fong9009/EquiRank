import styles from "@/styles/pages/about/aboutSplash.module.css";

export default function AboutSplash() {
    return (
        <div className={styles.splashImage} style={{ backgroundImage: `url('/images/stockSearch.jpg')`}}>
            <div className={styles.splashTextBox}>
                <h1 className={styles.titleSplashText}>About Us</h1>
                <h2 className={styles.secondTitleText}>Powering a New Vision of Investment</h2>
                <p className={styles.splashParaText}>
                    EquiRank was founded with one mission in mind, investment Intelligence.
                    To help support this mission we have created a way to do more analysis on Australian companies.
                </p>
            </div>
        </div>
    )
}