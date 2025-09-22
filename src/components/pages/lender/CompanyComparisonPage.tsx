"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CompanySearchModal from "@/components/common/CompanySearchModal";
import CompanyCard from "@/components/common/CompanyCard";
import styles from "@/styles/pages/borrower/companyComparisonPage.module.css";

interface Company {
    id: number;
    company_name: string;
    industry?: string;
    revenue_range?: string;
    borrower_name?: string;
}

export default function CompanyComparisonPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const MAX_COMPANIES = 4;

    // Add a new company (from modal)
    const addCompany = (newCompany: Company) => {
        if (companies.length >= MAX_COMPANIES) return;
        if (companies.find(c => c.id === newCompany.id)) return;
        setCompanies([...companies, newCompany]);
        setIsModalOpen(false);
    };

    // Remove company by ID
    const removeCompany = (id: number) => {
        setCompanies(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>Company Comparison</h1>

            <div className={styles.pageGrid}>
                {companies.map(company => (
                    <div className={styles.chartContainer} key={company.id}>
                        <CompanyCard
                            company={company}
                            onRemove={removeCompany}
                        />
                    </div>
                ))}

                {/* + Button Card */}
                {companies.length < MAX_COMPANIES && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={styles.addButton}
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Search Modal */}
            {isModalOpen && (
                <CompanySearchModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSelect={addCompany} // expects a full Company object
                />
            )}
        </div>
    );
}
