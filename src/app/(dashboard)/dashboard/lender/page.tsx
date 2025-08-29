'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import LenderHomepage from "@/components/pages/lender/LenderHomepage";
import ProfileSettings from "@/components/pages/settings/ProfileSettings";
import LoanRequestsList from "@/components/pages/lender/LoanRequestsList";

function LenderDashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || session.user.userType !== 'lender') {
            if(!session?.user){
                router.push('/login');
            } else if (session.user.userType === 'admin') {
                router.push('/dashboard/admin');
            } else {
                router.push('/dashboard/borrower');
            }
            return;
        }

        setIsReady(true);
    }, [session, status, router]);

    useEffect(() => {
        // Check if there's a tab parameter in the URL
        const tabParam = searchParams.get('tab');
        if (tabParam && ['home', 'loan-requests', 'settings'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!isReady || !session?.user || (session.user as any).userType !== 'lender') {
        return null;
    }

    const role = (session.user as any).userType;

    const renderTab = () => {
        switch (activeTab) {
            case "home":
                return <LenderHomepage/>;
            case "loan-requests":
                return <LoanRequestsList/>;
            case "settings":
                return <ProfileSettings/>;
            default:
                return <LenderHomepage/>;
        }
    };

    return (
        <DashboardLayout role={role} activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderTab()}
        </DashboardLayout>
    );
}

export default function LenderDashboard() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LenderDashboardContent />
        </Suspense>
    );
}