'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/pages/borrower/loanRequestDetailModal.module.css';

interface LoanRequestDetail {
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

interface LoanRequestDetailModalProps {
  requestId: number;
  onClose: () => void;
}

export default function LoanRequestDetailModal({ requestId, onClose }: LoanRequestDetailModalProps) {
  const [request, setRequest] = useState<LoanRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                {request.social_media_links.facebook && (
                  <a href={request.social_media_links.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    Facebook
                  </a>
                )}
                {request.social_media_links.instagram && (
                  <a href={request.social_media_links.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button onClick={onClose} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
