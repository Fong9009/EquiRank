'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/lender/generalLoanDetails.module.css';

interface LoanDetails {
  id: number;
  borrower_id: number;
  amount_requested: number;
  currency: string;
  loan_purpose: string;
  loan_type: string;
  status: string;
  created_at: string;
  expires_at?: string;
  borrower_name: string;
  borrower_company?: string;
  company_description?: string;
  company_name?: string;
  funded_by?: number;
  funded_at?: string;
  funded_by_name?: string;
}

interface LoanDetailsProps {
  loanId: number;
  onClose: () => void;
}

export default function LoanDetails({ loanId, onClose }: LoanDetailsProps) {
  const { data: session } = useSession();
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  // Colour Mode Editing
  const textColour = theme === "light" ? styles.lightTextColour : styles.darkTextColour;
  const backgroundColour = theme === "light" ? styles.lightBackground : styles.darkBackground;

  useEffect(() => {
    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);

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

  const fetchLoanDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/loan-requests/${loanId}`);
      
      if (response.ok) {
        const data = await response.json();
        setLoan(data);
      } else {
        setError('Failed to fetch loan details');
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
      setError('An error occurred while fetching details');
    } finally {
      setIsLoading(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getLoanTypeDisplay = (loanType: string) => {
    return loanType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>Loading loan details...</div>
        </div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.error}>
            <h3>Error</h3>
            <p>{error || 'Failed to load loan details'}</p>
            <button onClick={onClose} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${backgroundColour}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={textColour}>Loan Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Amount and Status Section */}
          <div className={styles.amountSection}>
            <div className={styles.amountDisplay}>
              <span className={styles.amount}>{formatCurrency(loan.amount_requested, loan.currency)}</span>
              <span className={styles.currency}>{loan.currency}</span>
            </div>
            <div className={styles.statusSection}>
              <div className={`${styles.status} ${getStatusColor(loan.status)}`}>
                { loan.status.charAt(0).toUpperCase() +  loan.status.slice(1)}
              </div>
            </div>
          </div>

          {/* Borrower Information */}
          <div className={styles.section}>
            <h3 className={textColour}>Borrower Information</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Name:</span>
                <span className={`${styles.value} ${textColour}`}>{loan.borrower_name}</span>
              </div>
              
              {loan.borrower_company && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>Company:</span>
                  <span className={`${styles.value} ${textColour}`}>{loan.borrower_company}</span>
                </div>
              )}

              {loan.company_name && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>Company Name:</span>
                  <span className={`${styles.value} ${textColour}`}>{loan.company_name}</span>
                </div>
              )}

              {loan.company_description && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>Company Description:</span>
                  <span className={`${styles.value} ${textColour}`}>{loan.company_description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Loan Details */}
          <div className={styles.section}>
            <h3 className={textColour}>Loan Details</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Purpose:</span>
                <span className={`${styles.value} ${textColour}`}>{loan.loan_purpose}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>Type:</span>
                <span className={`${styles.value} ${textColour}`}>{getLoanTypeDisplay(loan.loan_type)}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>Amount Requested:</span>
                <span className={`${styles.value} ${textColour}`}>
                  {formatCurrency(loan.amount_requested, loan.currency)}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>Status:</span>
                <div className={`${styles.status} ${getStatusColor(loan.status)}`}>
                  { loan.status.charAt(0).toUpperCase() +  loan.status.slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Funding Information */}
          <div className={styles.section}>
            <h3 className={textColour}>Funding Information</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Funded By:</span>
                <span className={`${styles.value} ${textColour}`}>
                  {loan.funded_by_name || 'No Funder Currently'}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>Funded On:</span>
                <span className={`${styles.value} ${textColour}`}>
                  {loan.funded_at ? formatDate(loan.funded_at) : 'N/A'}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>Created:</span>
                <span className={`${styles.value} ${textColour}`}>{formatDate(loan.created_at)}</span>
              </div>

              {loan.expires_at && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>Expires:</span>
                  <span className={`${styles.value} ${textColour}`}>{formatDate(loan.expires_at)}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
