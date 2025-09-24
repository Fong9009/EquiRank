"use client";

import {useEffect, useState} from "react";
import { Plus } from "lucide-react";
import CompanySearchModal from "@/components/common/CompanySearchModal";
import CompanyCard from "@/components/common/CompanyCard";
import styles from "@/styles/pages/borrower/companyComparisonPage.module.css";
import clsx from "clsx";
import {Theme, useEffectiveTheme} from "@/lib/theme";
import {useSession} from "next-auth/react";

interface Company {
    id: number;
    company_name: string;
}

interface CompanyAnalysisProps {
    companyId: string;
}


export default function CompanyComparisonPage({companyId}: CompanyAnalysisProps) {
    const { data: session } = useSession();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userTheme, setUserTheme] = useState<Theme>('auto');
    const effectiveTheme = useEffectiveTheme(userTheme);
    const MAX_COMPANIES = 2;

    const windowBackground = effectiveTheme === "light" ? styles.lightPage : styles.darkPage;
    const cardBackground = effectiveTheme === "light" ? styles.lightBackground : styles.darkBackground;
    const textColour = effectiveTheme === "light" ? styles.lightTextColour : styles.darkTextColour;

    useEffect(() => {
        if (!session) return;
        const controller = new AbortController();

        const loadTheme = async () => {
            try {
                const res = await fetch("/api/users/theme", { signal: controller.signal });
                const data = await res.json();
                setUserTheme(data.theme ? data.theme.theme : 'auto');
            } catch (err: any) {
                if (err?.name !== 'AbortError') {
                    console.error('Error loading theme:', err);
                }
            }
        };

        loadTheme();

        return () => {
            controller.abort();
        };
    }, [session]);

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
        <div className={clsx(styles.pageContainer, windowBackground)}>
            <h1 className={clsx(styles.pageTitle, textColour)}>Company Comparison</h1>

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
