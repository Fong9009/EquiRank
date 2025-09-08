"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

interface Props {
    params: { id: string } | Promise<{ id: string }>;
}

export default function LoanRequestDetail({ params }: Props) {
    const [id, setId] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function resolveParams() {
            const resolved = 'then' in params ? await params : params;
            setId(resolved.id);
        }
        resolveParams();
    }, [params]);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || session.user.userType !== 'lender') {
            if(!session?.user){
                router.push('/login');
            } else if (session.user.userType === 'borrower') {
                router.push('/dashboard/borrower');
            } else {
                router.push('/dashboard/admin');
            }
            return;
        }

        setIsReady(true);
    }, [session, status, router]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!isReady || !session?.user || session.user.userType !== 'lender') {
        return null;
    }

    const role = session.user.userType;
    // Example: fetch details for this request
    // const request = await fetch(`${process.env.API_URL}/loan-requests/${id}`).then(r => r.json());

    return (
        <DashboardLayout role={role} activeTab="archived-loan-requests" setActiveTab={() => {}}>
            <div>
                <h1>Loan Request Detail for ID: {id}</h1>
                {/* More page content */}
            </div>
        </DashboardLayout>
    );
}