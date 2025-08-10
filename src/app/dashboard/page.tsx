import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Redirect admins to admin panel
  if ((session.user as any)?.userType === 'admin') {
    redirect('/admin');
  }

  return (
    <div style={{ 
      paddingTop: '100px', 
      minHeight: '100vh',
      backgroundColor: '#1f2123',
      color: 'white'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px' 
      }}>
        <h1>Welcome to Your Dashboard</h1>
        <p>Hello, {session.user?.name || session.user?.email}!</p>
        <p>This is your investment dashboard. More features coming soon!</p>
      </div>
    </div>
  );
}
