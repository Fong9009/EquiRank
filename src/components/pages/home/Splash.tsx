import styles from "@/styles/pages/home/splash.module.css";
import clsx from "clsx";
import Link from "next/link";
import React from "react";

export default function Splash() {
    return (
        <div className={styles.splashImage}>
            <div className={styles.overlay}>
                {/*Title Text For Splash*/}
                <h1 className={clsx(styles.titleText,styles.fadeIn)}>EquiRank</h1>
                <h2 className={clsx(styles.subText,styles.fadeIn)}>Powering The Next Generation Of Investment</h2>
                <div className={styles.textBox}>
                    <p className={clsx(styles.paraText,styles.fadeIn)}>
                        Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                    </p>
                </div>

                {/*Splash Buttons*/}
                <div className={styles.buttonBox}>
                    <Link className={clsx(styles.startBtn, styles.fadeIn)} href="/join">Start Now</Link>
                    <Link className={clsx(styles.learnBtn, styles.fadeIn)} href="/how-it-works">Learn More</Link>
                </div>
            </div>
        </div>
    )
}
