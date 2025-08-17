'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BorrowerDashboard(){
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (status === 'loading') return;
        
        if (!session || !session.user || (session.user as any).userType !== 'borrower') {
            router.push('/login');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session || !session.user || (session.user as any).userType !== 'borrower') {
        return null;
    }

    const role = (session.user as any).userType;

    return (
        <DashboardLayout role={role} activeTab={activeTab} setActiveTab={setActiveTab}>
            <div>
                <h1>Borrower Dashboard</h1>
            </div>
        </DashboardLayout>
    );
}