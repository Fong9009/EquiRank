'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/pages/admin/adminActiveUser.module.css';

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
}

export default function ArchivedUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users/archived');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch archived users' });
      }
    } catch (_) {
      setMessage({ type: 'error', text: 'Network error while fetching archived users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(s => setCurrentUserId(s?.user?.id ?? null)).catch(()=>{});
    fetchUsers();
  }, []);

  const restore = async (userId: number) => {
    try {
      const res = await fetch('/api/admin/users/archive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, archived: false })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'User restored' });
        fetchUsers();
      } else {
        const e = await res.json();
        setMessage({ type: 'error', text: e.error || 'Failed to restore user' });
      }
    } catch (_) {
      setMessage({ type: 'error', text: 'Network error while restoring user' });
    }
  };

  const remove = async (userId: number) => {
    if (!confirm('This action is irreversible. Delete this user permanently?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'User deleted' });
        fetchUsers();
      } else {
        const e = await res.json();
        setMessage({ type: 'error', text: e.error || 'Failed to delete user' });
      }
    } catch (_) {
      setMessage({ type: 'error', text: 'Network error while deleting user' });
    }
  };

  if (loading) return <div className={styles.loading}>Loading Archived Users...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h2>Archived Users</h2>
            <p>Users removed from active access. Restore if needed.</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
      )}

      {users.length === 0 ? (
        <div className={styles.noUsers}><p>No Archived Users</p></div>
      ) : (
        <div className={styles.userList}>
          {users.map((u) => (
            <div key={u.id} className={styles.userCard}>
              <div className={styles.userInfo}>
                <h3>{u.first_name} {u.last_name}</h3>
                <p><strong>Email:</strong> {u.email}</p>
                {u.company && <p><strong>Company:</strong> {u.company}</p>}
                {u.phone && <p><strong>Phone:</strong> {u.phone}</p>}
                {u.address && <p><strong>Address:</strong> {u.address}</p>}
              </div>
              <div className={styles.actions}>
                <button className={styles.approveButton} onClick={() => restore(u.id)} disabled={String(u.id) === String(currentUserId)}>Restore</button>
                <button className={styles.deleteButton} onClick={() => remove(u.id)} disabled={String(u.id) === String(currentUserId)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


