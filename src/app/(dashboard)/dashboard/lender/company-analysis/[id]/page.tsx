"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CompanyAnalysis from "@/components/pages/lender/CompanyAnalysis";

interface Props {
    params: Promise<{ id: string }>;
}

export default function CompanyAnalysisDetail({ params }: Props) {
    const [id, setId] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function resolveParams() {
            const resolved = await params;
            setId(resolved.id);
        }
        resolveParams();
    }, [params]);

    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user || session.user.userType !== "lender") {
            if (!session?.user) {
                router.push("/login");
            } else if (session.user.userType === "borrower") {
                router.push("/dashboard/borrower");
            } else {
                router.push("/dashboard/admin");
            }
            return;
        }

        setIsReady(true);
    }, [session, status, router]);

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!isReady || !session?.user || session.user.userType !== "lender") {
        return null;
    }

    const role = session.user.userType;

    return (
        <DashboardLayout role={role} activeTab="company-analysis" setActiveTab={() => {}}>
            {!id ? (
                <div className="error">
                    Company ID is missing or invalid. Please go back to the Company list.
                </div>
            ) : (
                <CompanyAnalysis companyId={id} />
            )}
        </DashboardLayout>
    );
}
