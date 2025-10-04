'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/admin/adminLoanRequestDetails.module.css';
import { LoanRequestWithBorrower } from '@/database/loanRequest';

type LoanRequestDetails = LoanRequestWithBorrower;

interface AdminLoanRequestDetailsProps {
  requestId: number;
  onClose: () => void;
}

export default function AdminLoanRequestDetails({ requestId, onClose }: AdminLoanRequestDetailsProps) {
  const { data: session } = useSession();
  const [request, setRequest] = useState<LoanRequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchLoanRequestDetails();
    }
  }, [requestId]);

  const fetchLoanRequestDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/loan-requests/${requestId}`);
      
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        setError('Failed to fetch loan request details');
      }
    } catch (error) {
      console.error('Error fetching loan request details:', error);
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

  const handleCloseRequest = async () => {
    if (!request || !closeReason.trim()) {
      alert('Please provide a reason for closing the request');
      return;
    }

    setIsClosing(true);
    try {
      const response = await fetch(`/api/admin/loan-requests/${request.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: closeReason.trim() }),
      });

      if (response.ok) {
        alert('Loan request closed successfully!');
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Failed to close request: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error closing loan request:', error);
      alert('An error occurred while closing the request');
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>Loading loan request details...</div>
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
            <p>{error || 'Failed to load loan request details'}</p>
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
          <h2>Loan Request Details (Admin View)</h2>
        </div>

        <div className={styles.content}>
          {/* Amount and Status Section */}
          <div className={styles.amountSection}>
            <div className={styles.amount}>
              {formatCurrency(request.amount_requested, request.currency)}
            </div>
            <div className={styles.statusSection}>
              <div className={`${styles.status} ${styles[`status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`]}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
                <span className={styles.value}>{request.created_at ? formatDate(request.created_at.toString()) : 'N/A'}</span>
              </div>
              {request.expires_at && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Expires:</span>
                  <span className={styles.value}>{formatDate(request.expires_at.toString())}</span>
                </div>
              )}
            </div>
          </div>

          {/* Funding Information (if request was funded, current or previously) */}
          {(request.status === 'funded' || request.original_status === 'funded') && (
            <div className={styles.section}>
              <h3>Funding Information</h3>
              <div className={styles.loanInfo}>
                {request.funded_by_name && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Funded By:</span>
                    <span className={styles.value}>{request.funded_by_name}</span>
                  </div>
                )}
                {request.funded_at && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Funded On:</span>
                    <span className={styles.value}>{formatDate(request.funded_at.toString())}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actions}>
            {request.status === 'pending' ? (
              <button 
                onClick={() => setShowCloseModal(true)}
                className={styles.closeRequestButton}
              >
                Close Request
              </button>
            ) : null}
            <button 
              onClick={onClose} 
              className={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Close Request Modal */}
      {showCloseModal && (
        <div className={styles.overlay} onClick={() => setShowCloseModal(false)}>
          <div className={styles.closeModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.closeModalHeader}>
              <h3>Close Loan Request</h3>
              <button onClick={() => setShowCloseModal(false)} className={styles.closeButton}>
                ×
              </button>
            </div>
            <div className={styles.closeModalContent}>
              <p>Please provide a reason for closing this loan request:</p>
              <textarea
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="Enter reason for closing..."
                className={styles.closeReasonTextarea}
                rows={4}
                required
              />
              <div className={styles.closeModalActions}>
                <button
                  onClick={handleCloseRequest}
                  disabled={isClosing || !closeReason.trim()}
                  className={styles.confirmCloseButton}
                >
                  {isClosing ? 'Closing...' : 'Close Request'}
                </button>
                <button
                  onClick={() => setShowCloseModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
