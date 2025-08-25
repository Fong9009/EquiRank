'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/pages/admin/contactMessages.module.css';
import CustomConfirmation from '@/components/common/CustomConfirmation';

interface ContactMessage {
  id: number;
  conversation_id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  message_type: 'user_message' | 'admin_reply';
  parent_message_id?: number;
  status: 'new' | 'read' | 'replied' | 'closed';
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export default function ArchivedMessages() {
  const [archivedThreads, setArchivedThreads] = useState<{ [key: string]: ContactMessage[] }>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'closed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'subject'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Custom confirmation states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    action: 'restore' | 'delete';
    conversationId?: string;
    userName?: string;
  } | null>(null);

  useEffect(() => {
    fetchArchivedMessages();
  }, [statusFilter]);

  const fetchArchivedMessages = async () => {
    try {
      const response = await fetch('/api/admin/archived-messages');
      if (response.ok) {
        const data = await response.json();
        const threads: { [key: string]: ContactMessage[] } = {};
        data.forEach((msg: ContactMessage) => {
          if (!threads[msg.conversation_id]) {
            threads[msg.conversation_id] = [];
          }
          threads[msg.conversation_id].push(msg);
        });
        Object.keys(threads).forEach(id => threads[id].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        setArchivedThreads(threads);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch archived messages.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while fetching archived messages.' });
    } finally {
      setLoading(false);
    }
  };

  const restoreConversation = async (conversationId: string) => {
    const thread = archivedThreads[conversationId];
    if (!thread) return;
    
    setConfirmationData({
      action: 'restore',
      conversationId: conversationId,
      userName: thread[0]?.name,
    });
    setShowConfirmation(true);
  };

  const deleteConversationPermanently = async (conversationId: string) => {
    const thread = archivedThreads[conversationId];
    if (!thread) return;
    
    setConfirmationData({
      action: 'delete',
      conversationId: conversationId,
      userName: thread[0]?.name,
    });
    setShowConfirmation(true);
  };

  const handleConfirmation = async (confirmed: boolean) => {
    if (!confirmed) {
      setShowConfirmation(false);
      setConfirmationData(null);
      return;
    }

    if (!confirmationData?.conversationId) return;

    if (confirmationData.action === 'restore') {
      try {
        const response = await fetch(`/api/admin/contact-messages/conversation/${confirmationData.conversationId}`, {
          method: 'PATCH',
          body: JSON.stringify({ archived: false }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          setMessage({ type: 'success', text: 'Conversation restored successfully.' });
          setArchivedThreads(prev => {
            const updated = { ...prev };
            delete updated[confirmationData.conversationId!];
            return updated;
          });
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: `Failed to restore: ${error.error}` });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error while restoring.' });
      }
    } else if (confirmationData.action === 'delete') {
      try {
        const response = await fetch(`/api/admin/contact-messages/conversation/${confirmationData.conversationId}`, { method: 'DELETE' });
        if (response.ok) {
          setMessage({ type: 'success', text: 'Conversation permanently deleted.' });
          setArchivedThreads(prev => {
            const updated = { ...prev };
            delete updated[confirmationData.conversationId!];
            return updated;
          });
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: `Failed to delete: ${error.error}` });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error while deleting.' });
      }
    }

    setShowConfirmation(false);
    setConfirmationData(null);
  };
  
  const toggleConversation = (conversationId: string) => {
    setExpandedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  const filteredAndSortedThreads = () => {
    let filtered = Object.entries(archivedThreads);
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(([conversationId, thread]) => {
        const firstMessage = thread[0];
        return firstMessage.status === statusFilter;
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(([conversationId, thread]) => {
        const firstMessage = thread[0];
        return (
          firstMessage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          firstMessage.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          firstMessage.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          firstMessage.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Apply sorting
    filtered.sort(([conversationIdA, threadA], [conversationIdB, threadB]) => {
      const firstMessageA = threadA[0];
      const firstMessageB = threadB[0];
      
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(firstMessageA.created_at).getTime() - new Date(firstMessageB.created_at).getTime();
          break;
        case 'name':
          comparison = firstMessageA.name.localeCompare(firstMessageB.name);
          break;
        case 'subject':
          comparison = firstMessageA.subject.localeCompare(firstMessageB.subject);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  if (loading) return <div className={styles.loading}>Loading archived messages...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2>Archived Messages</h2>
          <div className={styles.messageStats}>
            <span className={styles.statItem}>
              <span className={styles.statLabel}>Archived:</span>
              <span className={styles.statValue}>
                {Object.keys(archivedThreads).length}
              </span>
            </span>
          </div>
        </div>
        {/* Search and Filter Controls */}
        <div className={styles.searchFilterContainer}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search messages by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterControls}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="subject">Sort by Subject</option>
            </select>
            
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className={styles.sortButton}
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>
      </div>

      {message && <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>}

      {Object.keys(archivedThreads).length === 0 ? (
        <div className={styles.emptyState}><p>No archived messages found.</p></div>
      ) : (
        <div className={styles.messageList}>
          {filteredAndSortedThreads().map(([conversationId, thread]) => {
            const firstMessage = thread[0];
            const isExpanded = expandedConversations.has(conversationId);
            return (
              <div key={conversationId} className={styles.conversationCard}>
                <div className={styles.conversationHeader} onClick={() => toggleConversation(conversationId)}>
                    <div className={styles.conversationInfo}>
                      <h3>{firstMessage.subject}</h3>
                      <div className={styles.conversationMeta}>
                        <span className={styles.name}>{firstMessage.name}</span>
                        <span className={styles.email}>{firstMessage.email}</span>
                        <span className={styles.date}>{new Date(thread[thread.length - 1].created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {/* Actions for archived messages */}
                    <div className={styles.conversationStatus}>
                        <button onClick={(e) => { e.stopPropagation(); restoreConversation(conversationId); }} className={`${styles.actionButton} ${styles.reply}`}>Restore</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteConversationPermanently(conversationId); }} className={`${styles.actionButton} ${styles.delete}`}>Delete Permanently</button>
                        <button className={styles.expandButton}>{isExpanded ? '▼' : '▶'}</button>
                    </div>
                </div>
                {isExpanded && (
                  <div className={styles.conversationThread}>
                    {thread.map(msg => (
                      <div key={msg.id} className={`${styles.messageItem} ${msg.message_type === 'admin_reply' ? styles.adminMessage : styles.userMessage}`}>
                        <div className={styles.messageLabel}>
                          {msg.message_type === 'admin_reply' ? 'Admin Reply' : 'User Message'}
                          <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.7)' }}>
                            • {msg.name} • {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className={styles.messageContent}>{msg.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
              ? 'Restore Conversation'
              : 'Delete Conversation Permanently'
          }
          message={
            confirmationData.action === 'restore'
              ? 'Are you sure you want to restore this conversation? It will be moved back to the main inbox.'
              : 'This action is irreversible. Are you sure you want to permanently delete this conversation?'
          }
          userName={confirmationData.userName || 'User'}
          action={confirmationData.action === 'restore' ? 'restore' : 'delete'}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      )}
    </div>
  );
}
