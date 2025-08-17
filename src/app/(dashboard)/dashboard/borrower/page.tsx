'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BorrowerDashboard(){
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || (session.user as any).userType !== 'borrower') {
            router.push('/login');
            return;
        }

        setIsReady(true);
    }, [session, status, router]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!isReady || !session?.user || (session.user as any).userType !== 'borrower') {
        return null;
    }

    const role = (session.user as any).userType;

    const renderTab = () => {
        switch (activeTab) {
            case "dashboard":
                return <div><h1>Borrower Dashboard</h1></div>;
            case "home":
                return <div>PLACEHOLDER</div>;
            case "PLACEHOLDER1":
                return <div>PLACEHOLDER</div>;
            case "PLACEHOLDER2":
                return <div>PLACEHOLDER</div>;
            default:
                return <div><h1>Borrower Dashboard</h1></div>;
        }
    };

    return (
        <DashboardLayout role={role} activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderTab()}
        </DashboardLayout>
    );
}