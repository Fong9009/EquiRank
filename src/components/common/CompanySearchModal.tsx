// components/CompanySearchModal.tsx
"use client";
import { useState, useEffect } from "react";
import styles from "@/styles/components/companySearchModal.module.css"

interface CompanySearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (company: Company) => void; // now expects a full Company object
}

interface Company {
    id: number;
    company_name: string;
}

export default function CompanySearchModal({ isOpen, onClose, onSelect }: CompanySearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        setLoading(true);

        const timeout = setTimeout(async () => {
            const queryParams = new URLSearchParams({ companyName: query });
            const response = await fetch(`/api/companies/company-search?${queryParams.toString()}`);
            const data = await response.json();
            setResults(data.data || []);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);


    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Search Company</h2>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search companies..."
                        className={styles.searchInput}
                    />
                </div>

                {loading && <div className={styles.loadingText}>Loading...</div>}

                <ul className={styles.resultsList}>
                    {results.map((company) => (
                        <li
                            key={company.id}
                            className={styles.resultItem}
                            onClick={() => {
                                onSelect(company); // <-- pass the full object
                                onClose();
                            }}
                        >
                            {company.company_name}
                        </li>
                    ))}
                </ul>

                <button onClick={onClose} className={styles.closeButton}>
                    Close
                </button>
            </div>
        </div>
    );
}
