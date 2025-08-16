import DashboardLayout from '@/components/layout/DashboardLayout';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function BorrowerDashboard(){
    const session = await auth();

    if (!session || !session.user || session.user.userType !== 'borrower') {
        redirect('/login'); // or redirect somewhere else
    }

    const role = session.user.userType;

    return (
        <DashboardLayout role={role}>
            <div>
                <h1>Borrower Dashboard</h1>
            </div>
        </DashboardLayout>
    );
}