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

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'closed'>('all');
  const [showReplyModal, setShowReplyModal] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [adminName, setAdminName] = useState('EquiRank Support Team');
  const [replying, setReplying] = useState(false);
  const [originalMessage, setOriginalMessage] = useState<ContactMessage | null>(null);
  const [conversationThreads, setConversationThreads] = useState<{ [key: string]: ContactMessage[] }>({});
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'subject'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
        
        // Group messages by conversation_id
        const threads: { [key: string]: ContactMessage[] } = {};
        data.forEach((msg: ContactMessage) => {
          if (!threads[msg.conversation_id]) {
            threads[msg.conversation_id] = [];
          }
          threads[msg.conversation_id].push(msg);
        });
        
        // Sort each thread by creation date
        Object.keys(threads).forEach(conversationId => {
          threads[conversationId].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });
        
        setConversationThreads(threads);
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

  const updateMessageStatus = async (messageId: number, newStatus: 'read' | 'replied' | 'closed') => {
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
        
        // Update conversationThreads to reflect the status change
        setConversationThreads(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(conversationId => {
            updated[conversationId] = updated[conversationId].map(msg => 
              msg.id === messageId ? { ...msg, status: newStatus } : msg
            );
          });
          return updated;
        });
        
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

  const archiveConversation = async (conversationId: string) => {
    const thread = conversationThreads[conversationId];
    if (!thread) return;

    const userMessageCount = thread.filter(msg => msg.message_type === 'user_message').length;
    const adminReplyCount = thread.filter(msg => msg.message_type === 'admin_reply').length;

    if (!confirm(`Are you sure you want to archive this conversation?\n\nThis will move the following to the archive:\n• ${userMessageCount} user message(s)\n• ${adminReplyCount} admin reply(s)`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contact-messages/conversation/${conversationId}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Conversation archived successfully'
        });
        
        // Remove the conversation from local state
        setConversationThreads(prev => {
          const updated = { ...prev };
          delete updated[conversationId];
          return updated;
        });

        setMessages(prev => prev.filter(msg => msg.conversation_id !== conversationId));
        
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.error || 'Failed to archive conversation'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error while archiving conversation'
      });
    }
  };

  const handleReplyClick = (messageId: number) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      setOriginalMessage(message);
      setShowReplyModal(messageId);
      setReplyText('');
    }
  };

  const sendReply = async (messageId: number) => {
    if (!replyText.trim()) {
      setMessage({ type: 'error', text: 'Please enter a reply message' });
      return;
    }

    setReplying(true);
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminReply: replyText.trim(),
          adminName: adminName.trim() || 'EquiRank Support Team'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({
          type: 'success',
          text: `${result.message}. ${result.emailSent ? 'Email sent successfully!' : 'Email delivery failed.'}`
        });
        
        // Update message status to replied
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'replied' } : msg
        ));
        
        // Add new reply to conversation thread and update status
        const newReply = await response.json();
        setConversationThreads(prev => {
            const updated = {...prev};
            const thread = Object.values(updated).find(t => t.some(m => m.id === messageId));
            if(thread){
                thread.push(newReply.newMessage);
                const messageToUpdate = thread.find(m => m.id === messageId);
                if(messageToUpdate) messageToUpdate.status = 'replied';
            }
            return updated;
        });

        // Close modal and clear reply
        setShowReplyModal(null);
        setReplyText('');
        
        // Clear message after delay
        setTimeout(() => setMessage(null), 5000);
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.error || 'Failed to send reply'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error while sending reply'
      });
    } finally {
      setReplying(false);
    }
  };

  const cancelReply = () => {
    setShowReplyModal(null);
    setReplyText('');
    setOriginalMessage(null);
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
    let filtered = Object.entries(conversationThreads);
    
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new': return styles.new;
      case 'read': return styles.read;
      case 'replied': return styles.replied;
      default: return '';
    }
  };

  const markAllAsRead = async () => {
    if (!confirm('Are you sure you want to mark all new messages as read?')) {
      return;
    }

    try {
      const newMessages = messages.filter(msg => msg.status === 'new');
      if (newMessages.length === 0) {
        setMessage({
          type: 'success',
          text: 'No new messages to mark as read'
        });
        return;
      }

      // Update all new messages to read status
      const updatePromises = newMessages.map(msg => 
        updateMessageStatus(msg.id, 'read')
      );

      await Promise.all(updatePromises);

      setMessage({
        type: 'success',
        text: `Marked ${newMessages.length} messages as read`
      });

      // Refresh messages to update the UI
      fetchContactMessages();

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to mark messages as read'
      });
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
        <div className={styles.headerTop}>
          <h2>Contact Messages</h2>
          <div className={styles.messageStats}>
            <span className={styles.statItem}>
              <span className={styles.statLabel}>Inquiries:</span>
              <span className={styles.statValue}>
                {Object.keys(conversationThreads).length}
              </span>
            </span>
            <span className={styles.statItem}>
              <span className={styles.statLabel}>New:</span>
              <span className={styles.statValue}>
                {Object.values(conversationThreads).filter(thread => 
                  thread.some(msg => msg.status === 'new')
                ).length}
              </span>
            </span>
            <span className={styles.statItem}>
              <span className={styles.statLabel}>Replies:</span>
              <span className={styles.statValue}>
                {Object.values(conversationThreads).flat().filter(msg => msg.message_type === 'admin_reply').length}
              </span>
            </span>
          </div>
        </div>
        <div className={styles.filters}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={styles.statusFilter}
          >
            <option value="all">All Inquiries</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
          <div className={styles.sortContainer}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.sortSelect}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="subject">Sort by Subject</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className={styles.sortOrderButton}
              title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          {messages.some(msg => msg.status === 'new') && (
            <button
              onClick={markAllAsRead}
              className={styles.markAllReadButton}
              title="Mark all new messages as read"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {Object.keys(conversationThreads).length === 0 ? (
        <div className={styles.emptyState}>
          <p>No contact messages found</p>
        </div>
      ) : (
        <div className={styles.messageList}>
          {filteredAndSortedThreads().map(([conversationId, thread]) => {
            const firstMessage = thread[0];
            const lastMessage = thread[thread.length - 1];
            const isExpanded = expandedConversations.has(conversationId);
            
            return (
              <div key={conversationId} className={styles.conversationCard}>
                <div className={styles.conversationHeader} onClick={() => toggleConversation(conversationId)}>
                  <div className={styles.conversationInfo}>
                    <h3>{firstMessage.subject}</h3>
                    <div className={styles.conversationMeta}>
                      <span className={styles.name}>{firstMessage.name}</span>
                      <span className={styles.email}>{firstMessage.email}</span>
                      <span className={styles.date}>
                        {new Date(lastMessage.created_at).toLocaleDateString()}
                      </span>
                      <span className={styles.messageCount}>
                        {thread.filter(msg => msg.message_type === 'user_message').length} message{thread.filter(msg => msg.message_type === 'user_message').length !== 1 ? 's' : ''}
                        {thread.filter(msg => msg.message_type === 'admin_reply').length > 0 && (
                          <span className={styles.replyCount}>
                            {' • '}
                            {thread.filter(msg => msg.message_type === 'admin_reply').length} repl{thread.filter(msg => msg.message_type === 'admin_reply').length !== 1 ? 'ies' : 'y'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className={styles.conversationStatus}>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(lastMessage.status)}`}>
                      {lastMessage.status}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveConversation(conversationId);
                      }}
                      className={`${styles.actionButton} ${styles.archive}`}
                      title="Archive entire conversation"
                    >
                      Archive
                    </button>
                    <button className={styles.expandButton} onClick={(e) => {
                      e.stopPropagation();
                      toggleConversation(conversationId)
                    }}>
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className={styles.conversationThread}>
                    {thread.map((msg) => (
                      <div key={msg.id} className={`${styles.messageItem} ${msg.message_type === 'admin_reply' ? styles.adminMessage : styles.userMessage}`}>
                        <div className={styles.messageLabel}>
                          {msg.message_type === 'admin_reply' ? 'Admin Reply:' : 'User Message:'}
                        </div>
                        <div className={styles.messageContent}>
                          {msg.message}
                        </div>

                        {msg.message_type === 'user_message' && (
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
                                onClick={() => handleReplyClick(msg.id)}
                                className={`${styles.actionButton} ${styles.reply}`}
                              >
                                Reply
                              </button>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <div className={styles.replyModal}>
          <div className={styles.replyContent}>
            <h3>Reply to Message</h3>
            
            {/* Original Message Context */}
            {originalMessage && (
              <div className={styles.originalMessage}>
                <h4>Original Message</h4>
                <div className={styles.messageContext}>
                  <div className={styles.messageHeader}>
                    <div className={styles.messageInfo}>
                      <h5>{originalMessage.subject}</h5>
                      <div className={styles.messageMeta}>
                        <span className={styles.name}>{originalMessage.name}</span>
                        <span className={styles.email}>{originalMessage.email}</span>
                        <span className={styles.date}>
                          {new Date(originalMessage.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.messageContent}>
                    <p>{originalMessage.message}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className={styles.replyForm}>
              <div className={styles.formGroup}>
                <label htmlFor="adminName">Your Name/Title:</label>
                <input
                  type="text"
                  id="adminName"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="EquiRank Support Team"
                  className={styles.replyInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="replyText">Your Reply:</label>
                <textarea
                  id="replyText"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={6}
                  className={styles.replyTextarea}
                />
              </div>
              
              <div className={styles.replyActions}>
                <button
                  onClick={() => sendReply(showReplyModal)}
                  disabled={replying || !replyText.trim()}
                  className={styles.sendReplyButton}
                >
                  {replying ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  onClick={cancelReply}
                  className={styles.cancelReplyButton}
                  disabled={replying}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
