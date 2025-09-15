'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/admin/adminArchivedLoanRequestsList.module.css';
import clsx from "clsx";
import AdminArchivedLoanRequestDetails from './AdminArchivedLoanRequestDetails';

interface ArchivedLoanRequest {
  id: number;
  borrower_id: number;
  amount_requested: number;
  currency: string;
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
  original_status?: string; 
  closed_by?: number;
  closed_at?: string;
  closed_reason?: string;
  created_at: string;
  expires_at?: string;
  borrower_name: string;
  borrower_company?: string;
  closed_by_name?: string;
}

export default function AdminArchivedLoanRequestsList() {
  const { data: session } = useSession();
  const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [archivedRequests, setArchivedRequests] = useState<ArchivedLoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    closedReason: 'all'
  });
  const windowBackground = theme === "light" ? styles.lightPage : styles.darkPage;
  const cardBackground = theme === "light" ? styles.lightBackground : styles.darkBackground;
  const textColour = theme === "light" ? styles.lightTextColour : styles.darkTextColour;

  useEffect(() => {
    if (session?.user) {
      fetchArchivedRequests();
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

  const fetchArchivedRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/archived-loan-requests');
      
      if (response.ok) {
        const data = await response.json();
        setArchivedRequests(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch archived loan requests');
      }
    } catch (error) {
      console.error('Error fetching archived loan requests:', error);
      setError('An error occurred while fetching archived loan requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (requestId: number) => {
    try {
      const response = await fetch(`/api/admin/loan-requests/${requestId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from archived list
        setArchivedRequests(prev => prev.filter(req => req.id !== requestId));
        // Show success message
        alert('Loan request restored successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to restore: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error restoring loan request:', error);
      alert('An error occurred while restoring the loan request');
    }
  };

  const handleDelete = async (requestId: number) => {
    if (!confirm('Are you sure you want to permanently delete this loan request? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/loan-requests/${requestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from archived list
        setArchivedRequests(prev => prev.filter(req => req.id !== requestId));
        // Show success message
        alert('Loan request deleted permanently!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting loan request:', error);
      alert('An error occurred while deleting the loan request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed':
        return styles.statusClosed;
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

  const filteredRequests = archivedRequests.filter(request => {
    if (filters.closedReason !== 'all' && request.closed_reason !== filters.closedReason) return false;
    return true;
  });

  if (!session?.user) {
    return <div>Please log in to view archived loan requests.</div>;
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading archived loan requests...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchArchivedRequests} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
      <div className={windowBackground}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Archived Loan Requests</h2>
          <p className={styles.subtitle}>Closed loan requests that can be restored or permanently deleted</p>
        </div>

        {/* Filters */}
        <div className={clsx(styles.filters, cardBackground)}>
          <div className={styles.filterGroup}>
            <label htmlFor="closed-reason-filter">Closed Reason:</label>
            <select
              id="closed-reason-filter"
              value={filters.closedReason}
              onChange={(e) => handleFilterChange('closedReason', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Reasons</option>
              <option value="incomplete">Incomplete Information</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className={styles.resultsCount}>
          Showing {filteredRequests.length} of {archivedRequests.length} archived loan requests
        </div>

        {/* Archived Loan Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={textColour}>No Archived Loan Requests</h3>
            <p className={textColour}>There are currently no closed loan requests in the archive.</p>
          </div>
        ) : (
          <div className={styles.requestsGrid}>
            {filteredRequests.map((request) => (
              <div key={request.id} className={clsx(styles.requestCard, cardBackground)}>
                <div className={styles.requestHeader}>
                  <div className={styles.amountSection}>
                    <span className={styles.amount}>
                      {formatCurrency(request.amount_requested, request.currency)}
                    </span>
                    <span className={styles.currency}>{request.currency}</span>
                  </div>
                  <div className={styles.statusSection}>
                    <div className={`${styles.status} ${getStatusColor(request.original_status || request.status)}`}>
                      {(request.original_status || request.status).charAt(0).toUpperCase() + (request.original_status || request.status).slice(1)}
                    </div>
                    <div className={styles.closedIndicator}>
                      <span className={styles.closedLabel}>Closed</span>
                    </div>
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

                  <div className={styles.detailRow}>
                    <span className={styles.label}>Purpose:</span>
                    <span className={styles.value}>
                      {request.loan_purpose.length > 80
                        ? `${request.loan_purpose.substring(0, 80)}...`
                        : request.loan_purpose
                      }
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.label}>Closed:</span>
                    <span className={styles.value}>{formatDate(request.closed_at || '')}</span>
                  </div>

                  {request.closed_by_name && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Closed By:</span>
                      <span className={styles.value}>{request.closed_by_name}</span>
                    </div>
                  )}

                  {request.closed_reason && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Close Reason:</span>
                      <span className={styles.value} title={request.closed_reason}>
                        {request.closed_reason.length > 60
                          ? `${request.closed_reason.substring(0, 60)}...`
                          : request.closed_reason
                        }
                      </span>
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
                  {request.original_status !== 'funded' && (
                    <button
                      onClick={() => handleRestore(request.id)}
                      className={styles.restoreButton}
                    >
                      Restore
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(request.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Archived Loan Request Details Modal */}
        {selectedRequest && (
          <AdminArchivedLoanRequestDetails
            requestId={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onRestore={handleRestore}
            onDelete={handleDelete}
          />
        )}
      </div>
      </div>
    );
}
