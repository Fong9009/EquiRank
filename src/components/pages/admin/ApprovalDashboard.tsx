'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/pages/admin/approvalDashboard.module.css';

interface PendingUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'borrower' | 'lender';
  entity_type: 'company' | 'individual';
  company?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export default function ApprovalDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch('/api/admin/pending');
      if (response.ok) {
        const users = await response.json();
        setPendingUsers(users);
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to fetch pending approvals'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error while fetching approvals'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, userId }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({
          type: 'success',
          text: result.message
        });
        
        // Remove the user from the pending list
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        
        // Refresh the list after a short delay
        setTimeout(() => {
          fetchPendingApprovals();
        }, 1000);
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.error || 'Failed to process approval'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error while processing approval'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading pending approvals...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>User Approval Dashboard</h1>
            <p>Review and approve new user registrations</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {pendingUsers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No users pending approval</p>
        </div>
      ) : (
        <div className={styles.userList}>
          {pendingUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userInfo}>
                <div className={styles.userHeader}>
                  <h3>{user.first_name} {user.last_name}</h3>
                  <div className={styles.userBadges}>
                    <span className={`${styles.badge} ${styles[user.user_type]}`}>
                      {user.user_type}
                    </span>
                    <span className={`${styles.badge} ${styles[user.entity_type]}`}>
                      {user.entity_type}
                    </span>
                  </div>
                </div>
                
                <div className={styles.userDetails}>
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.company && <p><strong>Company:</strong> {user.company}</p>}
                  {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                  {user.address && <p><strong>Address:</strong> {user.address}</p>}
                  <p><strong>Registered:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  onClick={() => handleApproval(user.id, 'approve')}
                  className={`${styles.actionButton} ${styles.approve}`}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(user.id, 'reject')}
                  className={`${styles.actionButton} ${styles.reject}`}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
