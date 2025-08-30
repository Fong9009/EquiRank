'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import AdminArchivedLoanRequestsList from "@/components/pages/admin/AdminArchivedLoanRequestsList";

function AdminArchivedLoanRequestsContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || session.user.userType !== 'admin') {
            if(!session?.user){
                router.push('/login');
            } else {
                router.push('/dashboard/borrower');
            }
            return;
        }

        setIsReady(true);
    }, [session, status, router]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!isReady || !session?.user || session.user.userType !== 'admin') {
        return null;
    }

    const role = session.user.userType;

    return (
        <DashboardLayout role={role} activeTab="archived-loan-requests" setActiveTab={() => {}}>
            <AdminArchivedLoanRequestsList />
        </DashboardLayout>
    );
}

export default function AdminArchivedLoanRequests() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminArchivedLoanRequestsContent />
        </Suspense>
    );
}
