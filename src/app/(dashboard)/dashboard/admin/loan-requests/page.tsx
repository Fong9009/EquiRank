'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import AdminLoanRequestsList from "@/components/pages/admin/AdminLoanRequestsList";

function AdminLoanRequestsContent() {
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
        <DashboardLayout role={role} activeTab="loan-requests" setActiveTab={() => {}}>
            <AdminLoanRequestsList />
        </DashboardLayout>
    );
}

export default function AdminLoanRequests() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminLoanRequestsContent />
        </Suspense>
    );
}
