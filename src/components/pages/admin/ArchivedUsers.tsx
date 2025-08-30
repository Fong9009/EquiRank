'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/pages/admin/adminActiveUser.module.css';
import CustomConfirmation from '@/components/common/CustomConfirmation';
import {useSession} from "next-auth/react";
import clsx from 'clsx';

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
  updated_at: string;
}

export default function ArchivedUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'borrower' | 'lender' | 'admin'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'email'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { data: session } = useSession();
  const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  //Colour Mode Editing
  const textColour = theme === "light" ? styles.lightTextColour : styles.darkTextColour;
  const backgroundColour = theme === "light" ? styles.lightBackground : styles.darkBackground;
  
  // Custom confirmation states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    action: 'restore' | 'delete';
    userName: string;
    userId: number;
  } | null>(null);

  // Separate users by type
  const borrowers = users.filter(user => user.user_type === 'borrower');
  const lenders = users.filter(user => user.user_type === 'lender');
  const admins = users.filter(user => user.user_type === 'admin');

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

  useEffect(() => {
    if (!session) return;
    fetch("/api/users/theme")
        .then(res => res.json())
        .then(data => {
          if (data.theme) {
            setTheme(data.theme.theme);
          } else {
            setTheme("auto");
          }
        });
  }, [session]);

  const restore = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setConfirmationData({
      action: 'restore',
      userName: `${user.first_name} ${user.last_name}`,
      userId: userId,
    });
    setShowConfirmation(true);
  };

  const remove = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setConfirmationData({
      action: 'delete',
      userName: `${user.first_name} ${user.last_name}`,
      userId: userId,
    });
    setShowConfirmation(true);
  };

  const handleConfirmation = async (confirmed: boolean) => {
    if (!confirmed) {
      setShowConfirmation(false);
      setConfirmationData(null);
      return;
    }

    if (!confirmationData) return;

    if (confirmationData.action === 'restore') {
      try {
        const res = await fetch('/api/admin/users/archive', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: confirmationData.userId, archived: false })
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
    } else if (confirmationData.action === 'delete') {
      try {
        const res = await fetch(`/api/admin/users/${confirmationData.userId}`, { method: 'DELETE' });
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
    }

    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const filteredAndSortedUsers = (userList: User[]) => {
    let filtered = userList;
    
    // Apply user type filter
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.user_type === userTypeFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'name':
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  if (loading) return <div className={styles.loading}>Loading Archived Users...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={clsx(styles.headerContent,textColour)}>
          <div>
            <h2>Archived Users</h2>
            <p>Users removed from active access. Restore if needed.</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmation && confirmationData && (
        <CustomConfirmation
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setConfirmationData(null);
          }}
          onConfirm={() => handleConfirmation(true)}
          title={
            confirmationData.action === 'restore'
              ? 'Restore User'
              : 'Delete User Permanently'
          }
          message={
            confirmationData.action === 'restore'
              ? 'Are you sure you want to restore this user? They will regain access to the system.'
              : 'This action is irreversible. Are you sure you want to permanently delete this user?'
          }
          userName={confirmationData.userName}
          action={confirmationData.action === 'restore' ? 'restore' : 'delete'}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      )}

      {/* Search and Filter Controls */}
      <div className={styles.searchFilterContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search users by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterControls}>
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="borrower">Borrowers</option>
            <option value="lender">Lenders</option>
            <option value="admin">Admins</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
          </select>
          
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className={styles.sortButton}
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className={clsx(styles.noUsers,textColour)}><p>No Archived Users</p></div>
      ) : (
        <>
          {/* Borrowers Section */}
          {borrowers.length > 0 && (
            <div className={clsx(styles.sectionHeader, backgroundColour)}>
              <h2 className={styles.sectionTitleBorrower}>Borrowers ({borrowers.length})</h2>
            </div>
          )}
          {borrowers.length > 0 && (
            <div className={styles.userList}>
              {filteredAndSortedUsers(borrowers).map((u) => (
                <div key={u.id} className={`${clsx(styles.userCard, backgroundColour)} ${styles.borrowerCard}`}>
                  <div className={styles.userInfo}>
                    <h3>{u.first_name} {u.last_name}</h3>
                    <p><strong>Email:</strong> {u.email}</p>
                    {u.company && <p><strong>Company:</strong> {u.company}</p>}
                    {u.phone && <p><strong>Phone:</strong> {u.phone}</p>}
                    {u.address && <p><strong>Address:</strong> {u.address}</p>}
                    <p><strong>Archived Since:</strong> {new Date(u.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.approveButton} onClick={() => restore(u.id)} disabled={String(u.id) === String(currentUserId)}>Restore</button>
                    <button className={styles.deleteButton} onClick={() => remove(u.id)} disabled={String(u.id) === String(currentUserId)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lenders Section */}
          {lenders.length > 0 && (
            <div className={clsx(styles.sectionHeader, backgroundColour)}>
              <h2 className={styles.sectionTitleLender}>Lenders ({lenders.length})</h2>
            </div>
          )}
          {lenders.length > 0 && (
            <div className={styles.userList}>
              {filteredAndSortedUsers(lenders).map((u) => (
                <div key={u.id} className={`${clsx(styles.userCard,backgroundColour)} ${styles.lenderCard}`}>
                  <div className={styles.userInfo}>
                    <h3>{u.first_name} {u.last_name}</h3>
                    <p><strong>Email:</strong> {u.email}</p>
                    {u.company && <p><strong>Company:</strong> {u.company}</p>}
                    {u.phone && <p><strong>Phone:</strong> {u.phone}</p>}
                    {u.address && <p><strong>Address:</strong> {u.address}</p>}
                    <p><strong>Archived Since:</strong> {new Date(u.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.approveButton} onClick={() => restore(u.id)} disabled={String(u.id) === String(currentUserId)}>Restore</button>
                    <button className={styles.deleteButton} onClick={() => remove(u.id)} disabled={String(u.id) === String(currentUserId)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Admins Section */}
          {admins.length > 0 && (
            <div className={clsx(styles.sectionHeader, backgroundColour)}>
              <h2 className={styles.sectionTitleAdmin}>Admins ({admins.length})</h2>
            </div>
          )}
          {admins.length > 0 && (
            <div className={styles.userList}>
              {filteredAndSortedUsers(admins).map((u) => (
                <div key={u.id} className={`${clsx(styles.userCard, backgroundColour)} ${styles.adminCard}`}>
                  <div className={styles.userInfo}>
                    <h3>{u.first_name} {u.last_name}</h3>
                    <p><strong>Email:</strong> {u.email}</p>
                    {u.company && <p><strong>Company:</strong> {u.company}</p>}
                    {u.phone && <p><strong>Phone:</strong> {u.phone}</p>}
                    {u.address && <p><strong>Address:</strong> {u.address}</p>}
                    <p><strong>Archived Since:</strong> {new Date(u.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.approveButton} onClick={() => restore(u.id)} disabled={String(u.id) === String(currentUserId)}>Restore</button>
                    <button className={styles.deleteButton} onClick={() => remove(u.id)} disabled={String(u.id) === String(currentUserId)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


