'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {redirect, useRouter} from 'next/navigation';
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";

export default async function BorrowerDashboard(){
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('home');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || session.user.userType !== 'borrower') {
            router.push('/login');
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
                return <div>PLACEHOLDER</div>;
            case "PLACEHOLDER1":
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