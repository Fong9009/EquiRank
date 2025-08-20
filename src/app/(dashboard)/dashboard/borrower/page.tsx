'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import BorrowerHomepage from "@/components/pages/borrower/BorrowerHomepage";
import ProfileSettings from "@/components/pages/profile/ProfileSettings";

function BorrowerDashboardContent(){
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
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

    useEffect(() => {
        // Check if there's a tab parameter in the URL
        const tabParam = searchParams.get('tab');
        if (tabParam && ['home', 'settings'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

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
                return <ProfileSettings/>;
            case "PLACEHOLDER2":
                return <div>PLACEHOLDER</div>;
            default:
                return <BorrowerHomepage/>;
        }
    };

    return (
        <DashboardLayout role={role} activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderTab()}
        </DashboardLayout>
    );
}

export default function BorrowerDashboard() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BorrowerDashboardContent />
        </Suspense>
    );
}