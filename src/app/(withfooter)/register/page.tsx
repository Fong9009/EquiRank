'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import RegistrationForm from '@/components/pages/register/RegistrationForm';

export default function RegisterPage() {
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
      <div className="registerPage">
        <div>Loading...</div>
      </div>
    );
  }

  // If user is logged in, don't render the registration form (they'll be redirected)
  if (session?.user) {
    return (
      <div className="registerPage">
        <div>Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="registerPage">
      <RegistrationForm />
    </div>
  );
}
