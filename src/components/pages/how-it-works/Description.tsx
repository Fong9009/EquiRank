import styles from '@/styles/pages/how-it-works/description.module.css';
import TitleText from "@/components/common/TitleText";
import SlideOnView from "@/components/common/SlideOnView";

export default function Description() {
    return (
        <div className={styles.featureBox}>
            <div className={styles.titleSection}>
                <TitleText
                    titleText={<h1>First Stage, Signing Up</h1>}
                />
            </div>
            {/*First Row*/}
            <div className={styles.splitBox}>
                <SlideOnView direction={"top"}>
                    <div className={styles.paraTextBox}>
                        <h2 className={styles.titleText}>Signing Up</h2>
                        <hr className={styles.textDivider}></hr>
                        <p className={styles.paraText}>
                            At EquiRank, To provide you the best service where you can perform company searches along
                            with saving your recent searches, you will need to sign up to the service.
                            Whether you are a company or an individual, EquiRank gives you quick access to
                            accurate company Information from the ABS allowing you to make informed decisions.
                        </p>
                        <p className={styles.paraText}>
                            <br></br>
                            EquiRank, reserves the rights to suspend account access if it is being misused or
                            remains inactive for extended periods, this ensures a safe environment for all users.
                            If you have an account that has been deactivated, feel free to contact us on our contact us
                            page so we can get it sorted.
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
                        <img className={styles.imageBoxImage} src="/images/join.png" alt="Registration picture"/>
                    </div>
                </SlideOnView>
            </div>

            <hr></hr>
            <div className={styles.titleSection}>
                <TitleText
                    titleText={<h1>Second Stage, The Dashboard</h1>}
                />
            </div>
            {/*Second Row*/}
            <div className={styles.splitBox}>
                <SlideOnView direction={"bottom"}>
                    <div className={styles.imageBox}>
                        <img className={styles.imageBoxImage} src="/images/dashboard.png" alt="Dashboard photo"/>
                    </div>
                </SlideOnView>
                <SlideOnView direction={"top"}>
                    <div className={styles.paraTextBox}>
                        <h2 className={styles.titleText}>Your Own Personal Dashboard</h2>
                        <hr className={styles.textDivider}></hr>
                        <p className={styles.paraText}>
                            With EquiRank, once we have approved of your account, you will be able to access your own personal dashboard
                            Here you will be able perform company searches to do some more investigation into companies.
                            Make your decisions count.
                        </p>
                        <p className={styles.paraText}>
                            <br></br>
                            With this dashboard, now you can.
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