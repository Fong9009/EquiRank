"use client";

import {useEffect, useState} from "react";
import { Plus, ArrowDownLeft, Divide } from "lucide-react";
import CompanySearchModal from "@/components/common/CompanySearchModal";
import CompanyCard from "@/components/common/CompanyCard";
import MergedCompanyCard from "@/components/common/MergedCompanyCard"; // New component needed
import styles from "@/styles/pages/lender/companyComparisonPage.module.css";
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
    const [isMerged, setIsMerged] = useState(false);
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
        // Reset merge state when adding a new company
        setIsMerged(false);
    };

    // Remove company by ID
    const removeCompany = (id: number) => {
        setCompanies(prev => prev.filter(c => c.id !== id));
        // Reset merge state when removing a company
        setIsMerged(false);
    };

    // Toggle merge state
    const toggleMerge = () => {
        setIsMerged(!isMerged);
    };

    // Check if we can merge (need exactly 2 companies)
    const canMerge = companies.length === 2;

    return (
        <div className={clsx(styles.pageContainer, windowBackground)}>
            <div className={styles.headerContainer}>
                <h1 className={clsx(styles.pageTitle, textColour)}>Company Comparison</h1>

                {/* Merge/Unmerge Button */}
                {canMerge && (
                    <button
                        onClick={toggleMerge}
                        className={clsx(styles.mergeButton, cardBackground)}
                        title={isMerged ? "Unmerge companies" : "Merge companies for comparison"}
                    >
                        {isMerged ? (
                            <>
                                <Divide className="w-5 h-5" />
                                Unmerge
                            </>
                        ) : (
                            <>
                                <ArrowDownLeft className="w-5 h-5" />
                                Merge
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className={styles.pageGrid}>
                {isMerged && canMerge ? (
                    // Show merged view
                    <div className={styles.chartContainer}>
                        <MergedCompanyCard
                            companies={companies}
                            onUnmerge={toggleMerge}
                        />
                    </div>
                ) : (
                    // Show individual company cards
                    <>
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
                    </>
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