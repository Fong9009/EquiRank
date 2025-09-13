import styles from "@/styles/components/loadingPage.module.css";
import React from "react";

export default function LoadingPage() {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loadingContent}>
                <div className={styles.spinner}></div>
                <h2 className={styles.loadingTitle}>Loading Financial Data</h2>
                <p className={styles.loadingText}>Please wait while we fetch your loan analytics...</p>
                <div className={styles.loadingSteps}>
                    <div className={styles.loadingStep}>
                        <span className={styles.stepIcon}>📊</span>
                        <span>Loading covenant analysis</span>
                    </div>
                    <div className={styles.loadingStep}>
                        <span className={styles.stepIcon}>📈</span>
                        <span>Processing financial statements</span>
                    </div>
                    <div className={styles.loadingStep}>
                        <span className={styles.stepIcon}>💰</span>
                        <span>Generating profit reports</span>
                    </div>
                </div>
            </div>
        </div>
    );
}