import styles from "@/styles/pages/how-it-works/how.module.css";

export default function HowSplash() {
    return (
        <div className={styles.splashImage} style={{ backgroundImage: `url('/images/how.jpg')`}}>
            <div className={styles.splashTextBox}>
                <h1 className={styles.titleSplashText}>How It Works</h1>
                <h2 className={styles.secondTitleText}>Reach for the Sky in Comparisons</h2>
                <p className={styles.splashParaText}>
                    At EquiRank, we make comparisons, effortless by organising data into meaningful insights.
                    This page will help you make comparisons faster and better.
                </p>
            </div>
        </div>
    )
}