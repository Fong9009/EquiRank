'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoanRequestDetailModal from './LoanRequestDetailModal';
import EditLoanRequestModal from './EditLoanRequestModal';
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [editingRequest, setEditingRequest] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchLoanRequests();
    }
  }, [session]);

  const fetchLoanRequests = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
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

  const handleViewDetails = (requestId: number) => {
    setSelectedRequest(requestId);
  };

  const handleEditRequest = (requestId: number) => {
    setEditingRequest(requestId);
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (confirm('Are you sure you want to delete this loan request? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/loan-requests/${requestId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove from list and show success message
          setLoanRequests(prev => prev.filter(req => req.id !== requestId));
          setSuccessMessage('Loan request deleted successfully');
          setError(null);
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          const result = await response.json();
          setError(result.error || 'Failed to delete loan request');
          setSuccessMessage(null);
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        setError('An error occurred while deleting the request');
        setSuccessMessage(null);
      }
    }
  };

  const handleRequestUpdated = () => {
    // Refresh the list after update
    fetchLoanRequests();
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

      {successMessage && (
        <div className={`${styles.message} ${styles.success}`}>
          {successMessage}
        </div>
      )}

      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}

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
              <button 
                className={styles.viewButton}
                onClick={() => handleViewDetails(request.id)}
              >
                View Details
              </button>
              {request.status === 'pending' && (
                <>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEditRequest(request.id)}
                  >
                    Edit
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteRequest(request.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Details Modal */}
      {selectedRequest && (
        <LoanRequestDetailModal
          requestId={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {/* Edit Request Modal */}
      {editingRequest && (
        <EditLoanRequestModal
          requestId={editingRequest}
          onClose={() => setEditingRequest(null)}
          onUpdate={handleRequestUpdated}
        />
      )}
    </div>
  );
}
