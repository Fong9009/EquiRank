'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/pages/admin/contactMessages.module.css';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
  updated_at: string;
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  useEffect(() => {
    fetchContactMessages();
  }, [statusFilter]);

  const fetchContactMessages = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/api/admin/contact-messages'
        : `/api/admin/contact-messages?status=${statusFilter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to fetch contact messages'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error while fetching messages'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: number, newStatus: 'read' | 'replied') => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Message status updated successfully'
        });
        
        // Update the local state
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: newStatus } : msg
        ));
        
        // Clear message after delay
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.error || 'Failed to update message status'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error while updating status'
      });
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Message deleted successfully'
        });
        
        // Remove from local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        
        // Clear message after delay
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.error || 'Failed to delete message'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error while deleting message'
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new': return styles.new;
      case 'read': return styles.read;
      case 'replied': return styles.replied;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading contact messages...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Contact Messages</h2>
        <div className={styles.filters}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={styles.statusFilter}
          >
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No contact messages found</p>
        </div>
      ) : (
        <div className={styles.messageList}>
          {messages.map((msg) => (
            <div key={msg.id} className={styles.messageCard}>
              <div className={styles.messageHeader}>
                <div className={styles.messageInfo}>
                  <h3>{msg.subject}</h3>
                  <div className={styles.messageMeta}>
                    <span className={styles.name}>{msg.name}</span>
                    <span className={styles.email}>{msg.email}</span>
                    <span className={styles.date}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={styles.messageStatus}>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(msg.status)}`}>
                    {msg.status}
                  </span>
                </div>
              </div>
              
              <div className={styles.messageContent}>
                <p>{msg.message}</p>
              </div>

              <div className={styles.messageActions}>
                {msg.status === 'new' && (
                  <button
                    onClick={() => updateMessageStatus(msg.id, 'read')}
                    className={`${styles.actionButton} ${styles.markRead}`}
                  >
                    Mark as Read
                  </button>
                )}
                {msg.status !== 'replied' && (
                  <button
                    onClick={() => updateMessageStatus(msg.id, 'replied')}
                    className={`${styles.actionButton} ${styles.markReplied}`}
                  >
                    Mark as Replied
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className={`${styles.actionButton} ${styles.delete}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
