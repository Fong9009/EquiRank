'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ApprovalDashboard from '@/components/pages/admin/ApprovalDashboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated as admin
    const checkAuth = async () => {
      try {
        // For now, we'll use a simple session check
        // In a real application, you'd want proper JWT tokens or session management
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
          // Redirect to login if no admin token
          router.push('/login?redirect=/admin');
          return;
        }

        // Verify admin token (this would be a proper API call in production)
        // For now, we'll assume the token is valid
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login?redirect=/admin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="adminPage">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          Loading admin panel...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="adminPage">
      <ApprovalDashboard />
    </div>
  );
}
