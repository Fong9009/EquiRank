"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoanAnalysis from "@/components/pages/lender/LoanAnalysis";

export default function LoanRequestDetail() {
    const [id, setId] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams(); // <-- get params from next/navigation
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (params?.id) {
            // Handle both string and string[] cases
            const idValue = Array.isArray(params.id) ? params.id[0] : params.id;
            setId(idValue);
        }
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
        <DashboardLayout role={role} activeTab="loan-analysis" setActiveTab={() => {}}>
            {!id ? (
                <div className="error">
                    Loan ID is missing or invalid. Please go back to the loan requests list.
                </div>
            ) : (
                <LoanAnalysis loanId={id} />
            )}
        </DashboardLayout>
    );
}
