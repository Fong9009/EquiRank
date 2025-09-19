"use client";
import { useState } from "react";
import CompanyGraphPage from "@/components/pages/lender/CompanyGraphPage";
import styles from "@/styles/pages/lender/companyAnalysis.module.css"

interface CompanyAnalysisProps {
    companyId: string;
}

interface MetricInfo {
    label: string;
    description: string;
    color: string;
}

export default function CompanyAnalysis({ companyId }: CompanyAnalysisProps) {
    const [activeTab, setActiveTab] = useState("graph")
    const tabs = [
        { key: "graph", label: "Graph Analysis", component: <CompanyGraphPage companyId={companyId} /> },
    ];

    return (
        <div className={styles.tabContainer}>
            {/* Tab Buttons */}
            <div className={styles.tabRow}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: "0.5rem 1rem",
                            background: activeTab === tab.key ? "#8884d8" : "#eee",
                            color: activeTab === tab.key ? "white" : "black",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            <div>
                {tabs.find((tab) => tab.key === activeTab)?.component}
            </div>
        </div>
    );
}