'use client';
{/*Utility*/}
import { useEffect, useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

{/*Layout*/}
import DashboardLayout from '@/components/layout/DashboardLayout';

{/*Pages*/}
import AdminFrontPage from "@/components/pages/admin/AdminFrontEnd";
import AdminHomePage from "@/components/pages/admin/AdminHomepage";
import AdminUserPage from "@/components/pages/admin/AdminUserPage";
import AddAdmin from "@/components/pages/admin/AddAdmin";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('home');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || session.user.userType !== 'admin') {
            router.push('/login');
            return;
        }

        setIsReady(true);
    }, [session, status, router]);

    if (!isReady || !session?.user) {
        return <p>Loading...</p>;
    }

    const role = session.user.userType;
    const isSuperAdmin = Boolean((session.user as any).isSuperAdmin);

    const renderTab = () => {
        switch (activeTab) {
            case "home":
                return <AdminHomePage/>;
            case "Manage Users":
                return <AdminUserPage/>;
            case "Manage Contact":
                return <AdminFrontPage/>;
            case "Add Admin":
                return isSuperAdmin ? <AddAdmin/> : <div>Forbidden</div>;
            default:
                return <div>Welcome to Admin Home</div>;
        }
    };

    return (
        <DashboardLayout role={role} activeTab={activeTab} setActiveTab={setActiveTab} isSuperAdmin={isSuperAdmin}>
            {renderTab()}
        </DashboardLayout>
    );
}
