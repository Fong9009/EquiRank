"use client";
import styles from "@/styles/pages/about/vision.module.css"
import TitleText from "@/components/common/TitleText";
import SlideOnView from "@/components/common/SlideOnView";
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";

export default function Vision() {
    const { data: session} = useSession();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

    {/*For Light and Dark Modes*/}
    const boxClass = theme === "light" ? styles.lightFeatureBox : styles.darkFeatureBox;
    const paraBox = theme === "light" ? styles.lightParaTextBox : styles.darkParaTextBox;
    const paraBoxTitle = theme === "light" ? styles.lightTitleText : styles.darkTitleText;
    const paraBoxText = theme === "light" ? styles.lightParaText : styles.darkParaText;
    const bannerColour = theme === "light" ? styles.lightBottomBanner : styles.darkBottomBanner;


    useEffect(() => {
        if (!session) return;
        fetch("/api/users/theme")
            .then(res => res.json())
            .then(data => {
                if (data.theme) {
                    setTheme(data.theme.theme);
                } else {
                    setTheme("auto");
                }
            });
    }, [session]);

    return (
        <div className={boxClass}>
            <div className={styles.titleSection}>
                <TitleText
                    titleText={<h1>A Future, Where knowledge is power</h1>}
                />
            </div>
            {/*First Row*/}
            <div className={styles.splitBox}>
                <SlideOnView direction={"top"}>
                    <div className={paraBox}>
                        <h2 className={paraBoxTitle}>Our Mission</h2>
                        <hr className={styles.textDivider}></hr>
                        <p className={paraBoxText}>
                            At EquiRank, we aim to provide investment insight with data driven analysis that sits all
                            at your finger tips. While not advice, we aim to allow you to make better informed choices on
                            your investments with our new comparison software.
                        </p>
                        <p className={paraBoxText}>
                            <br></br>
                            The ability to compare companies with data driven statistics to ensure that you can take the initiative
                            before others do.
                        </p>
                        <div className={styles.wavePattern}>
                            <svg viewBox="0 0 500 150" preserveAspectRatio="none">
                                <path d="M0.00,49.98 C150.00,150.00 349.72,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" />
                            </svg>
                        </div>
                        <div className={bannerColour}></div>
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
                    <div className={paraBox}>
                        <h2 className={paraBoxTitle}>State Of The Art</h2>
                        <hr className={styles.textDivider}></hr>
                        <p className={paraBoxText}>
                            Over the years we have developed our Engine to provide insight into the performance of companies.
                            We refined it over a long time taking in accurate data to one day be able to perform data analysis.
                        </p>
                        <p className={paraBoxText}>
                            <br></br>
                            And Now We can. Our Vision to compare companies with data driven statistics.
                        </p>
                        <div className={styles.wavePattern}>
                            <svg viewBox="0 0 500 150" preserveAspectRatio="none">
                                <path d="M0.00,49.98 C150.00,150.00 349.72,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" />
                            </svg>
                        </div>
                        <div className={bannerColour}></div>
                    </div>
                </SlideOnView>
            </div>
        </div>
    )
}