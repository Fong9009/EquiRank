"use client";
import { useState } from "react";
import CompanyGraphPage from "@/components/pages/lender/CompanyGraphPage";
import styles from "@/styles/pages/lender/companyAnalysis.module.css"
import CompanyComparisonPage from "@/components/pages/lender/CompanyComparisonPage";

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
        { key: "comparison", label: "Company Comparison", component: <CompanyComparisonPage companyId={companyId} /> },
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
                            background: activeTab === tab.key ? "#6864a5" : "#8783d6",
                            color: activeTab === tab.key ? "white" : "white",
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