'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/lender/fundedLoansList.module.css';
import clsx from 'clsx';
import FundedLoanDetails from './FundedLoanDetails';

interface FundedLoan {
  id: number;
  borrower_id: number;
  amount_requested: number;
  currency: string;
  company_name: string;
  company_description?: string;
  social_media_links?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  } | null;
  loan_purpose: string;
  loan_type: string;
  status: string;
  created_at: string;
  expires_at?: string;
  borrower_name: string;
  borrower_company?: string;
  funded_by?: number;
  funded_at?: string;
  funded_by_name?: string;
}

export default function FundedLoansList() {
  const { data: session } = useSession();
  const [fundedLoans, setFundedLoans] = useState<FundedLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<number | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  // Colour Mode Editing
  const textColour = theme === "light" ? styles.lightTextColour : styles.darkTextColour;
  const backgroundColour = theme === "light" ? styles.lightBackground : styles.darkBackground;

  useEffect(() => {
    if (session?.user) {
      fetchFundedLoans();
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/users/theme")
        .then(res => res.json())
        .then(data => {
          if (data.theme) {
            setTheme(data.theme.theme);
          } else {
            setTheme("auto");
          }
        });
  }, [session]);

  const fetchFundedLoans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/loan-requests/funded');
      if (response.ok) {
        const data = await response.json();
        setFundedLoans(data);
      } else {
        setError('Failed to fetch funded loans');
      }
    } catch (error) {
      console.error('Error fetching funded loans:', error);
      setError('An error occurred while fetching funded loans');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLoanTypeDisplay = (loanType: string) => {
    return loanType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className={backgroundColour}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={textColour}>Loading your funded loans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={backgroundColour}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchFundedLoans} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (fundedLoans.length === 0) {
    return (
      <div className={backgroundColour}>
        <div className={styles.emptyState}>
          <h3 className={textColour}>No Funded Loans Yet</h3>
          <p className={textColour}>You haven't funded any loan requests yet. Start by browsing available opportunities!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={backgroundColour}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={clsx(styles.title, textColour)}>My Funded Loans</h2>
          <p className={styles.subtitle}>Track your investment portfolio</p>
        </div>

        <div className={styles.loansGrid}>
          {fundedLoans.map((loan) => (
            <div key={loan.id} className={styles.loanCard}>
              <div className={styles.loanHeader}>
                <div className={styles.amountSection}>
                  <span className={styles.amount}>
                    {formatCurrency(loan.amount_requested, loan.currency)}
                  </span>
                  <span className={styles.currency}>{loan.currency}</span>
                </div>
                <div className={styles.statusSection}>
                  <span className={clsx(styles.status, styles.statusFunded)}>
                    Funded
                  </span>
                </div>
              </div>

              <div className={styles.loanDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Borrower:</span>
                  <span className={styles.value}>{loan.borrower_name}</span>
                </div>
                
                {loan.company_name && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Company:</span>
                    <span className={styles.value}>{loan.company_name}</span>
                  </div>
                )}

                <div className={styles.detailRow}>
                  <span className={styles.label}>Purpose:</span>
                  <span className={styles.value}>{loan.loan_purpose}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.label}>Type:</span>
                  <span className={styles.value}>{getLoanTypeDisplay(loan.loan_type)}</span>
                </div>

                {loan.company_description && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Company Info:</span>
                    <span className={styles.value}>{loan.company_description}</span>
                  </div>
                )}

                <div className={styles.detailRow}>
                  <span className={styles.label}>Funded On:</span>
                  <span className={styles.value}>
                    {loan.funded_at ? formatDate(loan.funded_at) : 'N/A'}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.label}>Created:</span>
                  <span className={styles.value}>{formatDate(loan.created_at)}</span>
                </div>
              </div>

              {loan.social_media_links && (
                <div className={styles.socialLinks}>
                  {loan.social_media_links.website && (
                    <a 
                      href={loan.social_media_links.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                    >
                      Website
                    </a>
                  )}
                  {loan.social_media_links.linkedin && (
                    <a 
                      href={loan.social_media_links.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              )}

              <div className={styles.loanActions}>
                <button 
                  onClick={() => setSelectedLoan(loan.id)}
                  className={styles.viewButton}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Funded Loan Details Modal */}
        {selectedLoan && (
          <FundedLoanDetails 
            loanId={selectedLoan}
            onClose={() => setSelectedLoan(null)}
          />
        )}
      </div>
    </div>
  );
}
