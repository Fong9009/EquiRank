'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/borrower/loanRequestList.module.css';

interface LoanRequest {
  id: number;
  amount_requested: number;
  currency: string;
  loan_purpose: string;
  loan_type: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  company_description?: string;
}

export default function LoanRequestList() {
  const { data: session } = useSession();
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchLoanRequests();
    }
  }, [session]);

  const fetchLoanRequests = async () => {
    try {
      const response = await fetch('/api/loan-requests/my-requests');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'active':
        return styles.statusActive;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (!session?.user) {
    return <div>Please log in to view your loan requests.</div>;
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading your loan requests...</div>;
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

  if (loanRequests.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No Loan Requests Yet</h3>
        <p>You haven't submitted any loan requests yet. Start by creating your first request!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Loan Requests</h2>
        <p className={styles.subtitle}>Track the status of your funding requests</p>
      </div>

      <div className={styles.requestsGrid}>
        {loanRequests.map((request) => (
          <div key={request.id} className={styles.requestCard}>
            <div className={styles.requestHeader}>
              <div className={styles.amountSection}>
                <span className={styles.amount}>
                  {formatCurrency(request.amount_requested, request.currency)}
                </span>
                <span className={styles.currency}>{request.currency}</span>
              </div>
              <div className={`${styles.status} ${getStatusColor(request.status)}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </div>
            </div>

            <div className={styles.requestDetails}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Type:</span>
                <span className={styles.value}>
                  {request.loan_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.label}>Purpose:</span>
                <span className={styles.value}>
                  {request.loan_purpose.length > 100 
                    ? `${request.loan_purpose.substring(0, 100)}...` 
                    : request.loan_purpose
                  }
                </span>
              </div>

              {request.company_description && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>Company:</span>
                  <span className={styles.value}>
                    {request.company_description.length > 80 
                      ? `${request.company_description.substring(0, 80)}...` 
                      : request.company_description
                    }
                  </span>
                </div>
              )}

              <div className={styles.detailRow}>
                <span className={styles.label}>Submitted:</span>
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
              <button className={styles.viewButton}>
                View Details
              </button>
              {request.status === 'pending' && (
                <button className={styles.editButton}>
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
