import React from "react";
import styles from "@/styles/components/metricCard.module.css";

interface metricProps {
    title: string;
    value: number;
    icon?: React.ReactNode;
    color?: string;
}

export default function MetricCard({ title, value, icon, color }: metricProps) {
    return (
        <div className={styles.card} style={{ borderColor: color }}>
            <div className={styles.icon}>{icon}</div>
            <div className={styles.info}>
                <h3 className={styles.cardTitleText}>{title}</h3>
                <p className={styles.value}>{value}</p>
            </div>
            {icon && (
                <div className={styles.icon} style={{ color }}>
                    {icon}
                </div>
            )}
        </div>
    );
}