import styles from "@/styles/pages/home/features.module.css";
import clsx from "clsx";
import React from "react";

export default function Features() {
    return (
        <div className={styles.featureBox}>
            <p className={styles.titleText}>The Future Of Investment Is Here</p>

            <div className={styles.listContainerGrid}>
                <div className={styles.listBox} style={{ backgroundImage: "url('/images/pic1.jpg')" }}>
                    <div className={styles.backgroundBox}>
                        <div className={styles.listBoxTitle}>
                            <p>Make Comparisons Easier</p>
                        </div>
                        <div className={styles.listBodyText}>
                            <p> Here at EquiRank, we know how hard it is to get an inside view into companies to
                                make a trustworthy investment without having a safety net.
                                With our state of the art comparison system,
                                you can rest assured that you can get accurate information and compare between other companies.
                            </p>
                        </div>
                        <div>
                            <ul className={styles.dotList}>
                                <li>Data Driven Statistics</li>
                                <li>Efficient Search</li>
                                <li>Multiple Comparisons</li>
                            </ul>
                        </div>
                        <img className={styles.imageContainer} src="/images/search.png" alt="Search Icon" />
                    </div>
                </div>
                <div className={styles.listBox} style={{ backgroundImage: "url('/images/pic2.jpg')" }}>
                    <div className={styles.backgroundBox}>
                        <div className={styles.listBoxTitle}>
                            <p>State Of The Art</p>
                        </div>
                        <div className={styles.listBodyText}>
                            <p>Our State of the Art Comparison Engine will be able to cater to your company comparison
                                needs, ensuring that you can make a clear, informed decision in your investments
                                through data driven investment decisions. Compare companies over with critical financial Metrics.
                            </p>
                        </div>
                        <div>
                            <ul className={styles.dotList}>
                                <li>Critical Financial Metrics</li>
                                <li>Efficient Filtering</li>
                                <li>Saves Recent Searches</li>
                            </ul>
                        </div>
                        <img className={styles.imageContainer} src="/images/stocks.png" alt="Picture of Stock Graph" />
                    </div>
                </div>
                <div className={styles.listBox} style={{ backgroundImage: "url('/images/pic3.jpg')" }}>
                    <div className={styles.backgroundBox}>
                        <div className={styles.listBoxTitle}>
                            <p>One of a Kind</p>
                        </div>
                        <div className={styles.listBodyText}>
                            <p>Built from the ground up for smarter investing, able to deliver side by side insights
                                into the companies that you might invest in. Our One of a Kind System gives you a complete
                                financial snapshot at a glance allowing you to make, smarter,faster and more informed decisions.
                            </p>
                        </div>
                        <div>
                            <ul className={styles.dotList}>
                                <li>Built from the Ground Up</li>
                                <li>Comparison Metrics</li>
                                <li>Many Filters to Choose From</li>
                            </ul>
                        </div>
                        <img className={styles.imageContainer} src="/images/cog.png" alt="Picture of Cog" />
                    </div>
                </div>
            </div>
        </div>
    )
}