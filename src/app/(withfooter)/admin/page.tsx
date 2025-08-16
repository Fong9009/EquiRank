'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ApprovalDashboard from '@/components/pages/admin/ApprovalDashboard';
import ContactMessages from '@/components/pages/admin/ContactMessages';
import ArchivedMessages from '@/components/pages/admin/ArchivedMessages';
import styles from '@/styles/pages/admin/adminPage.module.css';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'approvals' | 'messages' | 'archived'>('approvals');
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || (session.user as any).userType !== 'admin') {
      router.push('/login?redirect=/admin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className={styles.adminPage}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Loading admin panel...
        </div>
      </div>
    );
  }

  if (!session?.user || (session.user as any).userType !== 'admin') {
    return null; // Will redirect
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'approvals' ? styles.active : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          User Approvals
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'messages' ? styles.active : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Contact Messages
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'archived' ? styles.active : ''}`}
          onClick={() => setActiveTab('archived')}
        >
          Archived
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'approvals' && <ApprovalDashboard />}
        {activeTab === 'messages' && <ContactMessages />}
        {activeTab === 'archived' && <ArchivedMessages />}
      </div>
    </div>
  );
}
