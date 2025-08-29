'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/lender/loanRequestDetails.module.css';

interface LoanRequestDetails {
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
  created_at: string;
  expires_at?: string;
  borrower_name: string;
  borrower_company?: string;
  borrower_entity_type: string;
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
    
    setIsFunding(true);
    try {
      const response = await fetch(`/api/loan-requests/${requestId}/fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lender_id: session.user.id,
          funded_amount: request.amount_requested,
          currency: request.currency
        }),
      });

      if (response.ok) {
        onFund(requestId);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fund loan request');
      }
    } catch (error) {
      console.error('Error funding loan request:', error);
      setError('An error occurred while funding the request');
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
              <div className={styles.infoRow}>
                <span className={styles.label}>Entity Type:</span>
                <span className={styles.value}>
                  {request.borrower_entity_type.charAt(0).toUpperCase() + request.borrower_entity_type.slice(1)}
                </span>
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

          {/* Company Information (if available) */}
          {request.company_description && (
            <div className={styles.section}>
              <h3>Company Information</h3>
              <p className={styles.companyDescription}>{request.company_description}</p>
            </div>
          )}

          {/* Social Media Links (if available) */}
          {request.social_media_links && Object.values(request.social_media_links).some(link => link) && (
            <div className={styles.section}>
              <h3>Social Media & Links</h3>
              <div className={styles.socialLinks}>
                {request.social_media_links.linkedin && (
                  <a href={request.social_media_links.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    LinkedIn
                  </a>
                )}
                {request.social_media_links.website && (
                  <a href={request.social_media_links.website} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    Website
                  </a>
                )}
                {request.social_media_links.twitter && (
                  <a href={request.social_media_links.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    Twitter
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actions}>
            {request.status === 'pending' && (
              <button
                onClick={handleFund}
                disabled={isFunding}
                className={styles.fundButton}
              >
                {isFunding ? 'Funding...' : 'Fund This Loan'}
              </button>
            )}
            <button onClick={onClose} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
