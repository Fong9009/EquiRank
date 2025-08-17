'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/pages/admin/contactMessages.module.css';

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

  useEffect(() => {
    fetchArchivedMessages();
  }, []);

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
    if (!confirm('Are you sure you want to restore this conversation? It will be moved back to the main inbox.')) return;

    try {
      const response = await fetch(`/api/admin/contact-messages/conversation/${conversationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ archived: false }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Conversation restored successfully.' });
        setArchivedThreads(prev => {
          const updated = { ...prev };
          delete updated[conversationId];
          return updated;
        });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Failed to restore: ${error.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while restoring.' });
    }
  };

  const deleteConversationPermanently = async (conversationId: string) => {
    if (!confirm('This action is irreversible. Are you sure you want to permanently delete this conversation?')) return;
    
    try {
      const response = await fetch(`/api/admin/contact-messages/conversation/${conversationId}`, { method: 'DELETE' });
      console.log("response check", response);
      if (response.ok) {
        setMessage({ type: 'success', text: 'Conversation permanently deleted.' });
        setArchivedThreads(prev => {
          const updated = { ...prev };
          delete updated[conversationId];
          return updated;
        });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Failed to delete: ${error.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while deleting.' });
    }
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

  if (loading) return <div className={styles.loading}>Loading archived messages...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Archived Messages</h2>
        <p>Conversations stored here can be restored to the inbox or permanently deleted.</p>
      </div>

      {message && <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>}

      {Object.keys(archivedThreads).length === 0 ? (
        <div className={styles.emptyState}><p>No archived messages found.</p></div>
      ) : (
        <div className={styles.messageList}>
          {Object.entries(archivedThreads).map(([conversationId, thread]) => {
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
    </div>
  );
}
