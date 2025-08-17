'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BorrowerHomepage from "@/components/pages/borrower/BorrowerHomepage";

export default function BorrowerDashboard(){
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || session.user.userType !== 'borrower') {
            if(!session?.user){
                router.push('/login');
            } else if (session.user.userType === 'admin') {
                router.push('/dashboard/admin');
            } else {
                router.push('/dashboard/lender');
            }
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
            case "home":
                return <BorrowerHomepage/>;
            case "settings":
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