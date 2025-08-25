'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ForgotPasswordForm from '@/components/pages/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center text-white">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // If user is logged in, don't render the form (they'll be redirected)
  if (session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center text-white">
          <div>Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
