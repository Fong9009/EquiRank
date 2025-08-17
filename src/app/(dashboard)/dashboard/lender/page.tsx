'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {useRouter} from 'next/navigation';
import {useSession} from 'next-auth/react';
import {useEffect, useState} from 'react';
import LenderHomepage from "@/components/pages/lender/LenderHomepage";

export default function LenderDashboard(){
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('home');
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

    if (!isReady || !session?.user) {
        return <p>Loading...</p>;
    }

    const role = session.user.userType;

    const renderTab = () => {
        switch (activeTab) {
            case "home":
                return <LenderHomepage/>;
            case "settings":
                return <div>PLACEHOLDER</div>;
            case "PLACEHOLDER2":
                return <div>PLACEHOLDER</div>;
            default:
                return <div>PLACEHOLDER</div>;
        }
    };

    return (
        <DashboardLayout role={role} activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderTab()}
        </DashboardLayout>
    );
}