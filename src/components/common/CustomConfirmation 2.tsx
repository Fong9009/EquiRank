'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/components/customConfirmation.module.css';

interface CustomConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  userName?: string;
  action?: 'delete' | 'archive' | 'restore' | 'approve' | 'reject';
}

export default function CustomConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  userName,
  action = 'delete'
}: CustomConfirmationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow for exit animation
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const getActionIcon = () => {
    switch (action) {
      case 'delete':
        return '🗑️';
      case 'archive':
        return '📁';
      case 'restore':
        return '🔄';
      case 'approve':
        return '✅';
      case 'reject':
        return '❌';
      default:
        return '⚠️';
    }
  };

  const getActionColor = () => {
    switch (action) {
      case 'delete':
        return styles.danger;
      case 'archive':
        return styles.warning;
      case 'restore':
        return styles.info;
      case 'approve':
        return styles.success;
      case 'reject':
        return styles.danger;
      default:
        return styles.warning;
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.show : ''}`} onClick={handleBackdropClick}>
      <div className={`${styles.modal} ${isOpen ? styles.show : ''}`}>
        <div className={`${styles.header} ${getActionColor()}`}>
          <div className={styles.icon}>{getActionIcon()}</div>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
          
          {userName && (
            <div className={styles.userInfo}>
              <span className={styles.label}>User:</span>
              <span className={styles.userName}>{userName}</span>
            </div>
          )}
        </div>
        
        <div className={styles.actions}>
          <button 
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.button} ${styles.confirmButton} ${getActionColor()}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
