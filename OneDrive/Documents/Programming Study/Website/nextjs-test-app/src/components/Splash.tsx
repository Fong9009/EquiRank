import Image from "next/image";
import styles from "@/styles/splash.module.css";
import clsx from "clsx";

export default function Splash() {
    return (
      <div className={styles.splashImage}>
        <div className={styles.overlay}>
            <h1 className={clsx(styles.titleText,styles.fadeIn)}>TITTLE PLACEHOLDER</h1>
            <p className={clsx(styles.subText,styles.fadeIn)}>TEXT PLACEHOLDER</p>
        </div>
      </div>
    )
}