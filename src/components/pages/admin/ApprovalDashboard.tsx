'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import styles from '@/styles/pages/admin/approvalDashboard.module.css';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: 'borrower' | 'lender' | 'admin';
  entity_type: 'company' | 'individual';
  company?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export default function ApprovalDashboard() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/pending');
      if (response.ok) {
        const users = await response.json();
        setPendingUsers(users);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch pending users' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching pending users' });
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
        body: JSON.stringify({ userId, action }),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `User ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
        });
        // Refresh the list
        fetchPendingUsers();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Action failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error processing request' });
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
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
            <h2>User Approval Dashboard</h2>
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
        <div className={styles.noUsers}>
          <p>No users pending approval</p>
        </div>
      ) : (
        <div className={styles.userList}>
          {pendingUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userInfo}>
                <h3>{user.first_name} {user.last_name}</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Type:</strong> {user.user_type}</p>
                <p><strong>Entity:</strong> {user.entity_type}</p>
                {user.company && <p><strong>Company:</strong> {user.company}</p>}
                {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                {user.address && <p><strong>Address:</strong> {user.address}</p>}
                <p><strong>Registered:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div className={styles.actions}>
                <button
                  onClick={() => handleApproval(user.id, 'approve')}
                  className={styles.approveButton}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(user.id, 'reject')}
                  className={styles.rejectButton}
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
