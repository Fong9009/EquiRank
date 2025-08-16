import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {

  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const role = session.user.userType;

  switch (role) {
    case 'admin':
      return redirect('/dashboard/admin');
    case 'lender':
      return redirect('/dashboard/lender');
    case 'borrower':
      return redirect('/dashboard/borrower');
    default:
      return redirect('/');
  }
}
