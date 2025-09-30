'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoanRequestDetails from './LoanRequestDetails';
import clsx from "clsx";
import styles from '@/styles/pages/lender/loanRequestsList.module.css';
import Link from "next/link";
import { useEffectiveTheme, type Theme } from '@/lib/theme';

interface LoanRequest {
  id: number;
  amount_requested: number;
  currency: string;
  loan_purpose: string;
  loan_type: string;
  status: string;
  created_at: string;
  expires_at?: string;
  company_description?: string;
  borrower_name: string;
  borrower_company?: string;
  company_name?:string;
  risk?: { score: number; band: 'low' | 'medium' | 'high'; drivers?: { liquidityScore: number; solvencyScore: number; profitabilityScore: number; efficiencyScore: number } };
}

export default function LoanRequestsList() {
  const { data: session } = useSession();
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [userTheme, setUserTheme] = useState<Theme>('auto');
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    loanType: 'all',
    minAmount: '',
    maxAmount: '',
    riskBand: 'all'
  });
  const [lenderAppetite, setLenderAppetite] = useState<'conservative' | 'moderate' | 'aggressive' | null>(null);
  
  // Use the effective theme hook to handle 'auto' theme
  const effectiveTheme = useEffectiveTheme(userTheme);
  
  const windowBackground = effectiveTheme === "light" ? styles.lightPage : styles.darkPage;
  const cardBackground = effectiveTheme === "light" ? styles.lightBackground : styles.darkBackground;
  const textColour = effectiveTheme === "light" ? styles.lightTextColour : styles.darkTextColour;

  useEffect(() => {
    if (!session?.user) return;
    const t = setTimeout(() => {
      fetchLoanRequests();
    }, 300);
    return () => clearTimeout(t);
  }, [session, filters]);

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
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/users/profile', { signal: controller.signal });
        if (res.ok) {
          const p = await res.json();
          if (p?.risk_appetite) setLenderAppetite(p.risk_appetite);
        }
      } catch {}
    };
    loadProfile();
    
    return () => {
      controller.abort();
    };
  }, [session]);

  const fetchLoanRequests = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.loanType !== 'all') queryParams.append('loanType', filters.loanType);
      if (filters.minAmount) queryParams.append('minAmount', filters.minAmount);
      if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount);
      if (filters.riskBand !== 'all') queryParams.append('riskBand', filters.riskBand);

      const response = await fetch(`/api/loan-requests/available?${queryParams.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setLoanRequests(data);
      } else {
        setError('Failed to fetch loan requests');
      }
    } catch (error) {
      console.error('Error fetching loan requests:', error);
      setError('An error occurred while fetching loan requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFund = (requestId: number) => {
    // Remove the funded request from the list
    setLoanRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const appetiteAcceptsBand = (appetite: string | null, band: string | undefined) => {
    if (!appetite || !band) return false;
    if (appetite === 'conservative') return band === 'low';
    if (appetite === 'moderate') return band === 'low' || band === 'medium';
    if (appetite === 'aggressive') return band === 'low' || band === 'medium' || band === 'high';
    return false;
  };

  const riskSummary = (r: NonNullable<LoanRequest['risk']>) => {
    const ds = r.drivers || { liquidityScore: 0, solvencyScore: 0, profitabilityScore: 0, efficiencyScore: 0 };
    
    // Map categories to human-readable names
    const categoryNames: Record<string, string> = {
      liquidityScore: 'Cash flow',
      solvencyScore: 'Debt management',
      profitabilityScore: 'Profit margins',
      efficiencyScore: 'Operational efficiency'
    };
    
    // Find strongest and weakest categories
    const scores = [
      { key: 'liquidityScore', name: categoryNames.liquidityScore, value: ds.liquidityScore },
      { key: 'solvencyScore', name: categoryNames.solvencyScore, value: ds.solvencyScore },
      { key: 'profitabilityScore', name: categoryNames.profitabilityScore, value: ds.profitabilityScore },
      { key: 'efficiencyScore', name: categoryNames.efficiencyScore, value: ds.efficiencyScore }
    ].sort((a, b) => b.value - a.value);
    
    const strongest = scores[0];
    const weakest = scores[scores.length - 1];
    
    // Generate contextual message based on the scores
    const getContext = () => {
      if (r.score >= 75) {
        return `Strong ${strongest.name.toLowerCase()}, stable ${scores[1].name.toLowerCase()}.`;
      } else if (r.score >= 50) {
        return `Good ${strongest.name.toLowerCase()}, but ${weakest.name.toLowerCase()} could improve.`;
      } else {
        return `${weakest.name} needs attention. Consider risk carefully.`;
      }
    };
    
    // Build tooltip content - horizontal format
    const strongItems = scores.filter(s => s.value >= 70).map(s => s.name).join(', ');
    const watchItems = scores.filter(s => s.value < 70).map(s => s.name).join(', ');
    
    return {
      title: `${r.band.toUpperCase()} RISK (${r.score}/100)`,
      strong: strongItems,
      watch: watchItems,
      context: getContext()
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'funded':
        return styles.statusFunded;
      case 'closed':
        return styles.statusClosed;
      case 'expired':
        return styles.statusExpired;
      default:
        return styles.statusDefault;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (!session?.user) {
    return <div>Please log in to view loan requests.</div>;
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading available loan requests...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchLoanRequests} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
      <div className={windowBackground}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Available Loan Requests</h2>
            <p className={styles.subtitle}>Browse and fund loan requests from borrowers</p>
          </div>

          {/* Filters */}
          <div className={clsx(styles.filters, cardBackground)}>
            <div className={styles.filterGroup}>
              <label htmlFor="risk-band-filter">Risk:</label>
              <select
                id="risk-band-filter"
                value={filters.riskBand}
                onChange={(e) => handleFilterChange('riskBand', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="status-filter">Status:</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="funded">Funded</option>
                <option value="closed">Closed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="loan-type-filter">Loan Type:</label>
              <select
                id="loan-type-filter"
                value={filters.loanType}
                onChange={(e) => handleFilterChange('loanType', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Types</option>
                <option value="working_capital">Working Capital</option>
                <option value="equipment">Equipment</option>
                <option value="expansion">Expansion</option>
                <option value="inventory">Inventory</option>
                <option value="real_estate">Real Estate</option>
                <option value="startup">Startup</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="min-amount">Min Amount:</label>
              <input
                type="number"
                id="min-amount"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className={styles.filterInput}
                placeholder="0"
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="max-amount">Max Amount:</label>
              <input
                type="number"
                id="max-amount"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className={styles.filterInput}
                placeholder="∞"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className={styles.resultsCount}>
            {loanRequests.length} loan request{loanRequests.length !== 1 ? 's' : ''} available
          </div>

          {/* Loan Requests Grid */}
          {loanRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={textColour}>No Loan Requests Available</h3>
              <p className={textColour}>There are currently no loan requests matching your criteria.</p>
            </div>
          ) : (
            <div className={styles.requestsGrid}>
              {loanRequests.map((request) => (
                <div key={request.id} className={clsx(styles.requestCard, cardBackground)}>
                  {request.risk && appetiteAcceptsBand(lenderAppetite, request.risk.band) && (
                    <div className={styles.recommendBanner}>
                      Recommended for your risk appetite ({String(lenderAppetite)}).
                    </div>
                  )}
                  <div className={styles.requestHeader}>
                    <div className={styles.amountSection}>
                      <span className={styles.amount}>
                        {formatCurrency(request.amount_requested, request.currency)}
                      </span>
                      <span className={styles.currency}>{request.currency}</span>
                    {request.risk && (
                      <div className={styles.riskBadge} data-band={request.risk.band}>
                        {request.risk.band.toUpperCase()} RISK • {request.risk.score}
                        <button className={styles.riskHelp} aria-label="Risk details">?
                          <div className={styles.riskTooltip}>
                            {(() => {
                              const summary = riskSummary(request.risk);
                              return (
                                <>
                                  <div className={styles.tooltipTitle}>{summary.title}</div>
                                  <div className={styles.tooltipBody}>
                                    {summary.strong && <span className={styles.tooltipStrong}>✓ Strong: {summary.strong}</span>}
                                    {summary.strong && summary.watch && <span className={styles.tooltipSep}>•</span>}
                                    {summary.watch && <span className={styles.tooltipWatch}>⚠ Watch: {summary.watch}</span>}
                                  </div>
                                  <div className={styles.tooltipContext}>{summary.context}</div>
                                </>
                              );
                            })()}
                          </div>
                        </button>
                      </div>
                    )}
                    </div>
                    <div className={`${styles.status} ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </div>
                  </div>

                  <div className={styles.requestDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Borrower:</span>
                      <span className={styles.value}>{request.borrower_name}</span>
                    </div>
                    
                    {request.company_name && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Company:</span>
                        <span className={styles.value}>{request.company_name}</span>
                      </div>
                    )}

                    {request.company_description && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Company Info:</span>
                        <span className={styles.value}>
                          {request.company_description.length > 60 
                            ? `${request.company_description.substring(0, 60)}...` 
                            : request.company_description
                          }
                        </span>
                      </div>
                    )}

                    <div className={styles.detailRow}>
                      <span className={styles.label}>Type:</span>
                      <span className={styles.value}>
                        {request.loan_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    <div className={`${styles.detailRow} ${styles.detailRowPurpose}`}>
                      <span className={styles.label}>Purpose:</span>
                      <span className={styles.value}>
                        {request.loan_purpose.length > 80 
                          ? `${request.loan_purpose.substring(0, 80)}...` 
                          : request.loan_purpose
                        }
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <span className={styles.label}>Posted:</span>
                      <span className={styles.value}>{formatDate(request.created_at)}</span>
                    </div>

                    {request.expires_at && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Expires:</span>
                        <span className={styles.value}>{formatDate(request.expires_at)}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.requestActions}>
                    <button 
                      onClick={() => setSelectedRequest(request.id)}
                      className={styles.viewButton}
                    >
                      View Details
                    </button>
                    {request.status === 'pending' && (
                      <button 
                        onClick={() => setSelectedRequest(request.id)}
                        className={styles.fundButton}
                      >
                        Fund
                      </button>
                    )}
                  </div>
                  <div className={styles.requestActions}>
                    <Link href={`/dashboard/lender/loan-analysis/${request.id}`} passHref>
                      <button className={styles.analyseButton}>
                        Analyse
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loan Request Details Modal */}
          {selectedRequest && (
            <LoanRequestDetails
              requestId={selectedRequest}
              onClose={() => setSelectedRequest(null)}
              onFund={handleFund}
            />
          )}
        </div>
      </div>
    );
}
