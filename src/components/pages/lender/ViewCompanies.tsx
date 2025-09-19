"use client";
import styles from "@/styles/pages/lender/viewCompanies.module.css";
import {useEffect, useState, useCallback} from "react";
import {type Theme, useEffectiveTheme} from "@/lib/theme";
import {useSession} from "next-auth/react";
import Link from "next/link";
import clsx from "clsx";

interface CompanyRequests {
    id: number;
    company_name?: string;
    industry?: string;
    revenue_range?: string;
    borrower_name?: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface ApiResponse {
    data: CompanyRequests[];
    pagination: PaginationInfo;
}


export default function ViewCompanies() {
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [companyRequests, setCompaniesRequest] = useState<CompanyRequests[]>([]);
    const [userTheme, setUserTheme] = useState<Theme>('auto');
    const [error, setError] = useState<string | null>(null);
    const [itemsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        companyName: '',
        companyOwner: '',
        revenueRange: 'all',
    });

    // Use the effective theme hook to handle 'auto' theme
    const effectiveTheme = useEffectiveTheme(userTheme);

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


    const fetchCompanies = useCallback(async (page = 1, customFilters = filters) => {
        try {
            setIsLoading(true);
            setError(null);

            const queryParams = new URLSearchParams();

            // Only add filters if they have values
            if (customFilters.revenueRange !== 'all') {
                queryParams.append('revenueRange', customFilters.revenueRange);
            }
            if (customFilters.companyName.trim()) {
                queryParams.append('companyName', customFilters.companyName.trim());
            }
            if (customFilters.companyOwner.trim()) {
                queryParams.append('companyOwner', customFilters.companyOwner.trim());
            }

            queryParams.append('page', page.toString());
            queryParams.append('limit', itemsPerPage.toString());

            const response = await fetch(`/api/companies?${queryParams.toString()}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();

            // Update state with the new response structure
            setCompaniesRequest(result.data);
            setCurrentPage(result.pagination.page);
            setTotalPages(result.pagination.totalPages);
            setTotalItems(result.pagination.total);
            setHasNextPage(result.pagination.hasNextPage);
            setHasPrevPage(result.pagination.hasPrevPage);

        } catch (error) {
            console.error('Error fetching companies:', error);
            setError('An error occurred while fetching companies');
            // Reset data on error
            setCompaniesRequest([]);
            setTotalPages(1);
            setTotalItems(0);
            setHasNextPage(false);
            setHasPrevPage(false);
        } finally {
            setIsLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        if (session?.user) {
            const emptyFilters = { companyName: '', companyOwner: '', revenueRange: 'all' };
            fetchCompanies(1, emptyFilters);
        }
    }, [session, fetchCompanies]);

    const handleFilterChange = (filterType: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page when searching
        fetchCompanies(1, filters); // Pass current filters explicitly
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            companyName: '',
            companyOwner: '',
            revenueRange: 'all',
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        // Auto-fetch with cleared filters
        fetchCompanies(1, clearedFilters);
    };

    // ADDED: Handle Enter key in filter inputs
    const handleFilterKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    if (!session?.user) {
        return <div>Please log in to view Companies.</div>;
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading  Companies...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                <button onClick={() => fetchCompanies(1)} className={styles.retryButton}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className={windowBackground}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={clsx(styles.title, textColour)}>Company Viewer</h2>
                    <p className={styles.subtitle}>View the Companies on Equirank</p>
                </div>

                {/*Search Bar For Companies*/}
                {/* Filters */}
                <div className={clsx(styles.filters, cardBackground)}>
                    <div className={styles.filterRow}>
                        <div className={styles.filterGroup}>
                            <label htmlFor="company-name">Company Name:</label>
                            <input
                                type="text"
                                id="company-name"
                                value={filters.companyName}
                                onChange={(e) => handleFilterChange('companyName', e.target.value)}
                                onKeyDown={handleFilterKeyDown}
                                className={styles.filterInput}
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <label htmlFor="company-owner">Company Owner:</label>
                            <input
                                type="text"
                                id="company-owner"
                                value={filters.companyOwner}
                                onChange={(e) => handleFilterChange('companyOwner', e.target.value)}
                                onKeyDown={handleFilterKeyDown}
                                className={styles.filterInput}
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <label htmlFor="company-revenue-filter">Revenue Range</label>
                            <select
                                id="company-revenue-filter"
                                value={filters.revenueRange}
                                onChange={(e) => handleFilterChange('revenueRange', e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">All Revenue</option>
                                <option value="0-50k">0-50k</option>
                                <option value="50k-100k">50k-100k</option>
                                <option value="100k-500k">100k-500k</option>
                                <option value="500k-1m">500k-1m</option>
                                <option value="1m-5m">1m-5m</option>
                                <option value="5m-10m">5m-10m</option>
                                <option value="10m-50m">10m-50m</option>
                                <option value="50m+">50m+</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.filterRowButton}>
                        <button
                            onClick={handleSearch}
                            className={styles.searchButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>

                        {/* ADDED: Clear filters button */}
                        <button
                            onClick={handleClearFilters}
                            className={styles.clearButton} // You'll need to add this CSS class
                            disabled={isLoading}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
                <div className={styles.cardGrid}>
                    {companyRequests.length === 0 ? (
                        <p className={styles.noResults}>No Companies Available</p>
                    ) : (
                        companyRequests.map((company, index) => (
                            <div key={index} className={styles.card}>
                                <h2 className={styles.companyName}>{company.company_name}</h2>
                                <p className={styles.companyDetail}>
                                    <strong>Industry:</strong> {company.industry || "N/A"}
                                </p>
                                <p className={styles.companyDetail}>
                                    <strong>Revenue:</strong> {company.revenue_range || "N/A"}
                                </p>
                                <p className={styles.companyDetail}>
                                    <strong>Company Owner:</strong> {company.borrower_name || "N/A"}
                                </p>
                                <div className={styles.requestActions}>
                                    <Link href={`/dashboard/lender/company-analysis/${company.id}`} passHref>
                                        <button className={styles.analyseButton}>
                                            Analyse
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            onClick={() => fetchCompanies(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                        >
                            Prev
                        </button>

                        <span>Page {currentPage} of {totalPages}</span>

                        <button
                            onClick={() => fetchCompanies(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}