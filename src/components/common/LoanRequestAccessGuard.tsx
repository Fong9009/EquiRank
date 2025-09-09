'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/common/loanRequestAccessGuard.module.css';

interface LoanRequestAccessGuardProps {
  children: React.ReactNode;
  userType: 'borrower' | 'lender';
  profileCompletionPercentage: number;
}

const LoanRequestAccessGuard: React.FC<LoanRequestAccessGuardProps> = ({
  children,
  userType,
  profileCompletionPercentage
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const isProfileComplete = profileCompletionPercentage >= 100;

  const handleGoToSettings = () => {
    const dashboardUrl = `/dashboard/${userType}?tab=settings`;
    router.push(dashboardUrl);
  };

  if (!session) {
    return (
      <div className={styles.guard}>
        <div className={styles.message}>
          <h3>Authentication Required</h3>
          <p>Please log in to access loan requests.</p>
        </div>
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className={styles.guard}>
        <div className={styles.message}>
          <div className={styles.icon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h3>Profile Completion Required</h3>
          <p>
            Please complete your profile to access this feature.
          </p>
          <div className={styles.progress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${profileCompletionPercentage}%` }}
              />
            </div>
            <span className={styles.percentage}>{profileCompletionPercentage}%</span>
          </div>
          <button
            onClick={handleGoToSettings}
            className={styles.completeButton}
          >
            Go to Profile Settings
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoanRequestAccessGuard;
