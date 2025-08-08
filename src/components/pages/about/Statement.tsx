import styles from "@/styles/pages/about/statement.module.css";
import SlideOnView from "@/components/common/SlideOnView";

export default function Statement() {
    return (
        <>
            <div className={styles.spacer}></div>
            <div className={styles.splashImage} style={{ backgroundImage: `url('/images/AboutImage.png')`}}>
                    <div className={styles.splashTextBox}>
                        <SlideOnView direction={"left"}>
                            <h1 className={styles.titleSplashText}>Compare, Anywhere, Anytime</h1>
                            <div className={styles.subTextbox}>
                                <h2 className={styles.secondTitleText}>Travel with knowledge in mind</h2>
                                <p className={styles.splashParaText}>
                                    At EquiRank we wanted a portable way to compare companies on the go from walking through
                                    A City Street, A Park or even your home.
                                </p>
                            </div>
                        </SlideOnView>
                    </div>
            </div>
        </>
    )
}