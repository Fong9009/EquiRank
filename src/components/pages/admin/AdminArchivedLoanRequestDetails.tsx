'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/admin/adminArchivedLoanRequestDetails.module.css';

interface ArchivedLoanRequestDetails {
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
  original_status?: string; // The status before it was closed
  closed_by?: number;
  closed_at?: string;
  closed_reason?: string;
  created_at: string;
  expires_at?: string;
  borrower_name: string;
  borrower_company?: string;
  closed_by_name?: string;
}

interface AdminArchivedLoanRequestDetailsProps {
  requestId: number;
  onClose: () => void;
  onRestore: (requestId: number) => void;
  onDelete: (requestId: number) => void;
}

export default function AdminArchivedLoanRequestDetails({ requestId, onClose, onRestore, onDelete }: AdminArchivedLoanRequestDetailsProps) {
  const { data: session } = useSession();
  const [request, setRequest] = useState<ArchivedLoanRequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requestId) {
      fetchArchivedLoanRequestDetails();
    }
  }, [requestId]);

  const fetchArchivedLoanRequestDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/loan-requests/${requestId}`);
      
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        setError('Failed to fetch archived loan request details');
      }
    } catch (error) {
      console.error('Error fetching archived loan request details:', error);
      setError('An error occurred while fetching details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = () => {
    if (request) {
      onRestore(request.id);
      onClose();
    }
  };

  const handleDelete = () => {
    if (request) {
      onDelete(request.id);
      onClose();
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

  if (isLoading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>Loading archived loan request details...</div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.error}>
            <h3>Error</h3>
            <p>{error || 'Failed to load archived loan request details'}</p>
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Archived Loan Request Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Amount and Status Section */}
          <div className={styles.amountSection}>
            <div className={styles.amount}>
              {formatCurrency(request.amount_requested, request.currency)}
            </div>
            <div className={styles.statusSection}>
              <div className={`${styles.status} ${styles[`status${(request.original_status || request.status).charAt(0).toUpperCase() + (request.original_status || request.status).slice(1)}`]}`}>
                {(request.original_status || request.status).charAt(0).toUpperCase() + (request.original_status || request.status).slice(1)}
              </div>
            </div>
          </div>

          {/* Borrower Information */}
          <div className={styles.section}>
            <h3>Borrower Information</h3>
            <div className={styles.borrowerInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{request.borrower_name}</span>
              </div>
              {request.borrower_company && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Company:</span>
                  <span className={styles.value}>{request.borrower_company}</span>
                </div>
              )}
              {request.company_description && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Company Info:</span>
                  <span className={styles.value}>{request.company_description}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.label}>Borrower ID:</span>
                <span className={styles.value}>{request.borrower_id}</span>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className={styles.section}>
            <h3>Loan Details</h3>
            <div className={styles.loanInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Type:</span>
                <span className={styles.value}>
                  {request.loan_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Purpose:</span>
                <span className={styles.value}>{request.loan_purpose}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Requested:</span>
                <span className={styles.value}>{formatDate(request.created_at)}</span>
              </div>
              {request.expires_at && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Expires:</span>
                  <span className={styles.value}>{formatDate(request.expires_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Archive Information */}
          <div className={styles.section}>
            <h3>Archive Information</h3>
            <div className={styles.archiveInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Closed Date:</span>
                <span className={styles.value}>{formatDate(request.closed_at || '')}</span>
              </div>
              {request.closed_by_name && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Closed By:</span>
                  <span className={styles.value}>{request.closed_by_name}</span>
                </div>
              )}
              {request.closed_reason && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Reason for Closing:</span>
                  <span className={styles.value}>{request.closed_reason}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button 
              onClick={handleRestore}
              className={styles.restoreButton}
            >
              Restore Request
            </button>
            <button 
              onClick={handleDelete}
              className={styles.deleteButton}
            >
              Delete Permanently
            </button>
            <button 
              onClick={onClose} 
              className={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
