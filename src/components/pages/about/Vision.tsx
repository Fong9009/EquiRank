import styles from "@/styles/pages/about/vision.module.css"
import TitleText from "@/components/common/TitleText";

export default function Vision() {
    return (
        <div className={styles.featureBox}>
            <div className={styles.titleSection}>
                <TitleText
                    titleText={<h1>A Future, Where knowledge is power</h1>}
                />
            </div>
            {/*First Row*/}
            <div className={styles.splitBox}>
                <div className={styles.paraTextBox}>
                    <h2>Our Mission</h2>
                    <p>
                        At EquiRank, we aim to democratize investment insights by making data accessible and understandable for everyone.
                    </p>
                    <p>
                        We believe that clarity, transparency, and actionable information are the keys to unlocking smarter investing.
                    </p>
                </div>
                <div className={styles.imageBox}>
                    <img className={styles.imageBoxImage} src="/images/trading.jpg" alt="Trading Picture for Vision" />
                </div>
            </div>
        </div>
    )
}