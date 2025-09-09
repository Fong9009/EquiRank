'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/lender/loanRequestDetails.module.css';

interface LoanRequestDetails {
  id: number;
  borrower_id: number;
  amount_requested: number;
  currency: string;
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
  company_description?: string;
}

interface LoanRequestDetailsProps {
  requestId: number;
  onClose: () => void;
  onFund: (requestId: number) => void;
}

export default function LoanRequestDetails({ requestId, onClose, onFund }: LoanRequestDetailsProps) {
  const { data: session } = useSession();
  const [request, setRequest] = useState<LoanRequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFunding, setIsFunding] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleFund = async () => {
    if (!request || !session?.user) return;
    
    console.log('Starting funding process for request:', requestId);
    // Clear any previous errors when starting a new funding process
    setError(null);
    setSuccessMessage(null);
    setIsFunding(true);
    try {
      const requestBody = {
        lender_id: session.user.id,
        funded_amount: request.amount_requested,
        currency: request.currency
      };
      console.log('Sending funding request with body:', requestBody);
      
      const response = await fetch(`/api/loan-requests/${requestId}/fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Funding response received:', response);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        console.log('Funding successful, response:', response);
        setSuccessMessage('Loan request funded successfully! The borrower will be notified.');
        
        // Update the request status to 'funded' immediately for visual feedback
        setRequest(prev => prev ? { ...prev, status: 'funded' } : null);
        
        // Show toast notification for better visibility
        const toast = document.createElement('div');
        toast.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
            z-index: 10000;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease-out;
          ">
            ✅ Loan Funded Successfully!
          </div>
        `;
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
          const toastDiv = toast.querySelector('div');
          if (toastDiv) {
            toastDiv.style.transform = 'translateX(0)';
            toastDiv.style.opacity = '1';
          }
        }, 10);
        
        // Remove toast after 4 seconds
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 4000);
        
        // Wait to show success message, then close
        setTimeout(() => {
          onFund(requestId);
          onClose();
        }, 3000);
      } else {
        const errorData = await response.json();
        console.log('Funding failed, error data:', errorData);
        const errorMessage = errorData.error || 'Failed to fund loan request';
        setError(errorMessage);
        
        // Show error toast notification
        const toast = document.createElement('div');
        toast.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            z-index: 10000;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease-out;
            max-width: 300px;
          ">
            ❌ ${errorMessage}
          </div>
        `;
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
          const toastDiv = toast.querySelector('div');
          if (toastDiv) {
            toastDiv.style.transform = 'translateX(0)';
            toastDiv.style.opacity = '1';
          }
        }, 10);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Error funding loan request:', error);
      const errorMessage = 'Network error occurred while funding the request';
      setError(errorMessage);
      
      // Show error toast notification
      const toast = document.createElement('div');
      toast.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          z-index: 10000;
          transform: translateX(100%);
          opacity: 0;
          transition: all 0.3s ease-out;
          max-width: 300px;
        ">
          ❌ ${errorMessage}
        </div>
      `;
      document.body.appendChild(toast);
      
      // Trigger animation
      setTimeout(() => {
        const toastDiv = toast.querySelector('div');
        if (toastDiv) {
          toastDiv.style.transform = 'translateX(0)';
          toastDiv.style.opacity = '1';
        }
      }, 10);
      
      // Remove toast after 5 seconds
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 5000);
    } finally {
      setIsFunding(false);
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
          <h2>Loan Request Details</h2>
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
            <div className={`${styles.status} ${styles[`status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`]}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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



          {/* Success Message */}
          {successMessage && (
            <div className={styles.successMessage}>
              <p>{successMessage}</p>
            </div>
          )}

          {/* Funding Status */}
          {isFunding && (
            <div className={styles.fundingStatus}>
              <div className={styles.spinner}></div>
              <p>Processing your funding request...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actions}>
            {request.status === 'pending' && !successMessage && (
              <button
                onClick={handleFund}
                disabled={isFunding}
                className={styles.fundButton}
              >
                {isFunding ? 'Processing...' : 'Fund This Loan'}
              </button>
            )}
            <button 
              onClick={onClose} 
              className={styles.closeButton}
              disabled={isFunding}
            >
              {successMessage ? 'Done' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
