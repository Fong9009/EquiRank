import styles from "@/styles/pages/about/vision.module.css"
import TitleText from "@/components/common/TitleText";
import SlideOnView from "@/components/common/SlideOnView";

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
                <SlideOnView direction={"top"}>
                    <div className={styles.paraTextBox}>
                        <h2 className={styles.titleText}>Our Mission</h2>
                        <hr className={styles.textDivider}></hr>
                        <p className={styles.paraText}>
                            At EquiRank, we aim to provide investment insight with data driven analysis that sits all
                            at your finger tips. While not advice, we aim to allow you to make better informed choices on
                            your investments with our new comparison software.
                        </p>
                        <p className={styles.paraText}>
                            <br></br>
                            The ability to compare companies with data driven statistics to ensure that you can take the initiative
                            before others do.
                        </p>
                        <div className={styles.wavePattern}>
                            <svg viewBox="0 0 500 150" preserveAspectRatio="none">
                                <path d="M0.00,49.98 C150.00,150.00 349.72,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" />
                            </svg>
                        </div>
                        <div className={styles.bottomBanner}></div>
                    </div>
                </SlideOnView>
                <SlideOnView direction={"bottom"}>
                    <div className={styles.imageBox}>
                        <img className={styles.imageBoxImage} src="/images/trading.jpg" alt="Trading Picture for Vision"/>
                    </div>
                </SlideOnView>
            </div>

            <hr></hr>
            {/*Second Row*/}
            <div className={styles.splitBox}>
                <SlideOnView direction={"bottom"}>
                    <div className={styles.imageBox}>
                        <img className={styles.imageBoxImage} src="/images/optic.jpg" alt="Picture of Optic Lines"/>
                    </div>
                </SlideOnView>
                <SlideOnView direction={"top"}>
                    <div className={styles.paraTextBox}>
                        <h2 className={styles.titleText}>State Of The Art</h2>
                        <hr className={styles.textDivider}></hr>
                        <p className={styles.paraText}>
                            Over the years we have developed our Engine to provide insight into the performance of companies.
                            We refined it over a long time taking in accurate data to one day be able to perform data analysis.
                        </p>
                        <p className={styles.paraText}>
                            <br></br>
                            And Now We can. Our Vision to compare companies with data driven statistics.
                        </p>
                        <div className={styles.wavePattern}>
                            <svg viewBox="0 0 500 150" preserveAspectRatio="none">
                                <path d="M0.00,49.98 C150.00,150.00 349.72,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" />
                            </svg>
                        </div>
                        <div className={styles.bottomBanner}></div>
                    </div>
                </SlideOnView>
            </div>
        </div>
    )
}