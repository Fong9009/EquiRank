'use client';

import { useEffect, useState, Suspense } from "react";
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// Layout
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages
import AdminFrontPage from "@/components/pages/admin/AdminFrontEnd";
import AdminHomePage from "@/components/pages/admin/AdminHomepage";
import AdminUserPage from "@/components/pages/admin/AdminUserPage";
import AddAdmin from "@/components/pages/admin/AddAdmin";
import ProfileSettings from "@/components/pages/settings/ProfileSettings";
import FileCleanup from "@/components/pages/admin/FileCleanup";

function AdminDashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('home');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || session.user.userType !== 'admin') {
            if(!session?.user){
                router.push('/login');
            } else if (session.user.userType === 'borrower') {
                router.push('/dashboard/borrower');
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
        if (tabParam && ['home', 'Manage Users', 'Manage Contact', 'Add Admin', 'File Cleanup', 'settings'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Update URL when activeTab changes (for browser back/forward)
    useEffect(() => {
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
            case "File Cleanup":
                return <FileCleanup/>;
            case "settings":
                return <ProfileSettings/>;
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

export default function AdminDashboard() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminDashboardContent />
        </Suspense>
    );
}
