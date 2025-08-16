import DashboardLayout from '@/components/layout/DashboardLayout';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LenderDashboard(){
    const session = await auth();

    if (!session || !session.user && session.user.userType !== 'lender') {
        redirect('/login'); // or redirect somewhere else
    }

    const role = session.user.userType;

    return (
        <DashboardLayout role={role}>
            <div>
                <h1>Lender Dashboard</h1>
            </div>
        </DashboardLayout>
    );
}