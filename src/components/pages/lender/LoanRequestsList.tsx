'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoanRequestDetails from './LoanRequestDetails';
import styles from '@/styles/pages/lender/loanRequestsList.module.css';

interface LoanRequest {
  id: number;
  amount_requested: number;
  currency: string;
  loan_purpose: string;
  loan_type: string;
  status: string;
  created_at: string;
  expires_at?: string;
  company_description?: string;
  borrower_name: string;
  borrower_company?: string;
}

export default function LoanRequestsList() {
  const { data: session } = useSession();
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    loanType: 'all',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    if (session?.user) {
      fetchLoanRequests();
    }
  }, [session, filters]);

  const fetchLoanRequests = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.loanType !== 'all') queryParams.append('loanType', filters.loanType);
      if (filters.minAmount) queryParams.append('minAmount', filters.minAmount);
      if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount);

      const response = await fetch(`/api/loan-requests/available?${queryParams.toString()}`);
      
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

  const handleFund = (requestId: number) => {
    // Remove the funded request from the list
    setLoanRequests(prev => prev.filter(req => req.id !== requestId));
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

  if (!session?.user) {
    return <div>Please log in to view loan requests.</div>;
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading available loan requests...</div>;
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Available Loan Requests</h2>
        <p className={styles.subtitle}>Browse and fund loan requests from borrowers</p>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
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
            <option value="working_capital">Working Capital</option>
            <option value="equipment">Equipment</option>
            <option value="expansion">Expansion</option>
            <option value="inventory">Inventory</option>
            <option value="real_estate">Real Estate</option>
            <option value="startup">Startup</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="min-amount">Min Amount:</label>
          <input
            type="number"
            id="min-amount"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            className={styles.filterInput}
            placeholder="0"
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="max-amount">Max Amount:</label>
          <input
            type="number"
            id="max-amount"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            className={styles.filterInput}
            placeholder="∞"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className={styles.resultsCount}>
        {loanRequests.length} loan request{loanRequests.length !== 1 ? 's' : ''} available
      </div>

      {/* Loan Requests Grid */}
      {loanRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Loan Requests Available</h3>
          <p>There are currently no loan requests matching your criteria.</p>
        </div>
      ) : (
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
                  <span className={styles.label}>Posted:</span>
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
                  onClick={() => setSelectedRequest(request.id)}
                  className={styles.viewButton}
                >
                  View Details
                </button>
                {request.status === 'pending' && (
                  <button 
                    onClick={() => setSelectedRequest(request.id)}
                    className={styles.fundButton}
                  >
                    Fund
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loan Request Details Modal */}
      {selectedRequest && (
        <LoanRequestDetails
          requestId={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onFund={handleFund}
        />
      )}
    </div>
  );
}
