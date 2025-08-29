'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import BorrowerHomepage from "@/components/pages/borrower/BorrowerHomepage";
import ProfileSettings from "@/components/pages/settings/ProfileSettings";
import LoanRequestForm from "@/components/pages/borrower/LoanRequestForm";
import LoanRequestList from "@/components/pages/borrower/LoanRequestList";

function BorrowerDashboardContent(){
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('home');
    const [isReady, setIsReady] = useState(false);

    // Load active tab from localStorage on component mount
    useEffect(() => {
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab && ['home', 'loan-requests', 'new-request', 'settings'].includes(savedTab)) {
            setActiveTab(savedTab);
        }
    }, []);

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
        if (tabParam && ['home', 'loan-requests', 'new-request', 'settings'].includes(tabParam)) {
            setActiveTab(tabParam);
        } else if (!tabParam) {
            // If no tab parameter, default to home
            setActiveTab('home');
        }
    }, [searchParams]);

    // Update URL when activeTab changes (for browser back/forward)
    useEffect(() => {
        console.log('activeTab changed to:', activeTab);
        if (activeTab && activeTab !== 'home') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', activeTab);
            window.history.replaceState({}, '', url.toString());
        } else if (activeTab === 'home') {
            const url = new URL(window.location.href);
            url.searchParams.delete('tab');
            window.history.replaceState({}, '', url.toString());
        }
    }, [activeTab]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!isReady || !session?.user || (session.user as any).userType !== 'borrower') {
        return null;
    }

    const role = (session.user as any).userType;

    const renderTab = () => {
        console.log('Rendering tab:', activeTab);
        switch (activeTab) {
            case "home":
                return <BorrowerHomepage/>;
            case "loan-requests":
                return <LoanRequestList/>;
            case "new-request":
                return <LoanRequestForm/>;
            case "settings":
                return <ProfileSettings/>;
            default:
                console.log('Default case, returning BorrowerHomepage');
                return <BorrowerHomepage/>;
        }
    };

    return (
        <DashboardLayout role={role} activeTab={activeTab} setActiveTab={setActiveTab}>
            <div key={activeTab}>
                {renderTab()}
            </div>
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