'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/common/profileCompletionCard.module.css';

interface ProfileCompletionCardProps {
  completionPercentage: number;
  userType: 'borrower' | 'lender' | 'admin';
  onDismiss: () => void;
}

const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  completionPercentage,
  userType,
  onDismiss
}) => {
  const router = useRouter();
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
    if (completionPercentage === 0) return '#ef4444';
    if (completionPercentage < 50) return '#f59e0b';
    if (completionPercentage < 100) return '#22c55e';
    return '#38a169';
  };

  const isComplete = completionPercentage >= 100;

  const handleGoToSettings = () => {
    // Navigate to the appropriate dashboard settings tab
    const dashboardUrl = userType === 'admin' 
      ? '/dashboard/admin?tab=settings' 
      : `/dashboard/${userType}?tab=settings`;
    router.push(dashboardUrl);
  };

  if (isComplete) {
    return null; // Don't show card if profile is complete
  }

  return (
    <div className={styles.profileCard}>
      <div className={styles.cardHeader}>
        <div className={styles.iconSection}>
          <div className={styles.icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>Profile Incomplete</h3>
            <span className={styles.percentage}>{completionPercentage}%</span>
          </div>
        </div>
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

      <div className={styles.cardContent}>
        <p className={styles.message}>{getCompletionMessage()}</p>
        
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${completionPercentage}%`,
                backgroundColor: getCompletionColor()
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button
          onClick={handleGoToSettings}
          className={styles.completeButton}
        >
          Go to Settings
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
