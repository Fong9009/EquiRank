'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/admin/adminLoanRequestsList.module.css';
import clsx from 'clsx';
import AdminLoanRequestDetails from './AdminLoanRequestDetails';
import { LoanRequestWithBorrower } from '@/database/loanRequest';

export default function AdminLoanRequestsList() {
  const { data: session } = useSession();
  const [loanRequests, setLoanRequests] = useState<LoanRequestWithBorrower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    loanType: 'all'
  });
  const windowBackground = theme === "light" ? styles.lightPage : styles.darkPage;
  const cardBackground = theme === "light" ? styles.lightBackground : styles.darkBackground;
  const textColour = theme === "light" ? styles.lightTextColour : styles.darkTextColour;

  useEffect(() => {
    if (session?.user) {
      fetchLoanRequests();
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

  const fetchLoanRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/loan-requests');
      
      if (response.ok) {
        const data = await response.json();
        setLoanRequests(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch loan requests');
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

  const handleCloseRequest = async (requestId: number) => {
    const reason = prompt('Please provide a reason for closing this loan request:');
    if (!reason || !reason.trim()) {
      alert('Please provide a reason for closing the request');
      return;
    }

    try {
      const response = await fetch(`/api/admin/loan-requests/${requestId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (response.ok) {
        // Remove from active list
        setLoanRequests(prev => prev.filter(req => req.id !== requestId));
        // Show success message
        alert('Loan request closed successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to close request: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error closing loan request:', error);
      alert('An error occurred while closing the request');
    }
  };

  const filteredRequests = loanRequests.filter(request => {
    if (filters.status !== 'all' && request.status !== filters.status) return false;
    if (filters.loanType !== 'all' && request.loan_type !== filters.loanType) return false;
    return true;
  });

  if (!session?.user) {
    return <div>Please log in to view loan requests.</div>;
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading all loan requests...</div>;
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
            <h2 className={styles.title}>All Loan Requests</h2>
            <p className={styles.subtitle}>Administrative view of all loan requests in the system</p>
          </div>

          {/* Filters */}
          <div className={clsx(styles.filters,cardBackground)}>
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
                <option value="active">Active</option>
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
                <option value="equipment">Equipment</option>
                <option value="expansion">Expansion</option>
                <option value="working_capital">Working Capital</option>
                <option value="inventory">Inventory</option>
                <option value="real_estate">Real Estate</option>
                <option value="startup">Startup</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className={styles.resultsCount}>
            Showing {filteredRequests.length} of {loanRequests.length} loan requests
          </div>

          {/* Loan Requests Grid */}
          {filteredRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No Loan Requests Available</h3>
              <p>There are currently no loan requests matching your criteria.</p>
            </div>
          ) : (
            <div className={styles.requestsGrid}>
              {filteredRequests.map((request) => (
                <div key={request.id} className={clsx(styles.requestCard,cardBackground)}>
                  <div className={styles.requestHeader}>
                    <div className={styles.amountSection}>
                      <span className={styles.amount}>
                        {formatCurrency(request.amount_requested, request.currency)}
                      </span>
                      <span className={styles.currency}>{request.currency}</span>
                    </div>
                    <div className={styles.statusSection}>
                      <div className={`${styles.status} ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                      {request.status === 'closed' && (
                        <div className={styles.closedIndicator}>
                          <span className={styles.closedLabel}>Closed</span>
                          {request.closed_reason && (
                            <span className={styles.closedReason}>• {request.closed_reason}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.requestDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Borrower:</span>
                      <span className={styles.value}>{request.borrower_name}</span>
                    </div>

                    {request.borrower_company && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Company:</span>
                        <span className={styles.value}>{request.borrower_company}</span>
                      </div>
                    )}

                    <div className={styles.detailRow}>
                      <span className={styles.label}>Type:</span>
                      <span className={styles.value}>
                        {request.loan_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <span className={styles.label}>Purpose:</span>
                      <span className={styles.value}>
                        {request.loan_purpose.length > 80
                          ? `${request.loan_purpose.substring(0, 80)}...`
                          : request.loan_purpose
                        }
                      </span>
                    </div>
                    {request.company_description && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Company:</span>
                        <span className={styles.value}>
                          {request.company_description.length > 60
                            ? `${request.company_description.substring(0, 60)}...`
                            : request.company_description
                          }
                        </span>
                      </div>
                    )}

                    <div className={styles.detailRow}>
                      <span className={styles.label}>Posted:</span>
                      <span className={styles.value}>{request.created_at ? formatDate(request.created_at.toString()) : 'N/A'}</span>
                    </div>

                    {request.expires_at && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Expires:</span>
                        <span className={styles.value}>{formatDate(request.expires_at.toString())}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.requestActions}>
                    <button
                      onClick={() => request.id && setSelectedRequest(request.id)}
                      className={styles.viewButton}
                    >
                      View Details
                    </button>
                    {request.status === 'funded' && (
                      <button
                        onClick={() => request.id && handleCloseRequest(request.id)}
                        className={styles.closeButton}
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loan Request Details Modal */}
          {selectedRequest && (
            <AdminLoanRequestDetails
              requestId={selectedRequest}
              onClose={() => setSelectedRequest(null)}
            />
          )}
        </div>
      </div>
  );
}
