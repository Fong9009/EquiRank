'use client';

import React from 'react';
import styles from '@/styles/common/profileCompletionBanner.module.css';

interface ProfileCompletionBannerProps {
  completionPercentage: number;
  userType: 'borrower' | 'lender' | 'admin';
  onStartWizard: () => void;
  onDismiss: () => void;
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({
  completionPercentage,
  userType,
  onStartWizard,
  onDismiss
}) => {
  const getCompletionMessage = () => {
    if (completionPercentage === 0) {
      return `Complete your ${userType} profile to start using the platform`;
    } else if (completionPercentage < 50) {
      return `Your profile is ${completionPercentage}% complete. Finish it to unlock all features`;
    } else if (completionPercentage < 100) {
      return `Almost there! Your profile is ${completionPercentage}% complete`;
    }
    return 'Profile complete!';
  };

  const getCompletionColor = () => {
    if (completionPercentage === 0) return '#e53e3e';
    if (completionPercentage < 50) return '#f6ad55';
    if (completionPercentage < 100) return '#68d391';
    return '#38a169';
  };

  const isComplete = completionPercentage >= 100;

  if (isComplete) {
    return null; // Don't show banner if profile is complete
  }

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
        
        <div className={styles.text}>
          <h3 className={styles.title}>Profile Incomplete</h3>
          <p className={styles.message}>{getCompletionMessage()}</p>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${completionPercentage}%`,
                backgroundColor: getCompletionColor()
              }}
            />
          </div>
          <span className={styles.percentage}>{completionPercentage}%</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={onStartWizard}
          className={styles.completeButton}
        >
          Complete Profile
        </button>
        <button
          onClick={onDismiss}
          className={styles.dismissButton}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;