'use client';

import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/pages/login/LoginForm';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading, wait

    if (session?.user) {
      // User is logged in, redirect to their dashboard
      const userType = session.user.userType;
      switch (userType) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'lender':
          router.push('/dashboard/lender');
          break;
        case 'borrower':
          router.push('/dashboard/borrower');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="loginPage">
        <div>Loading...</div>
      </div>
    );
  }

  // If user is logged in, don't render the login form (they'll be redirected)
  if (session?.user) {
    return (
      <div className="loginPage">
        <div>Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="loginPage">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
