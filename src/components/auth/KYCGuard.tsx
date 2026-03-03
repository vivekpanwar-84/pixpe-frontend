"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { kycService } from "@/services/kyc.service";
import { Loader2 } from "lucide-react";

export function KYCGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const checkKYC = async () => {
            try {
                const { status } = await kycService.getKYCStatus();

                if (status === "APPROVED") {
                    setIsVerifying(false);
                } else if (status === "PENDING" || status === "REJECTED") {
                    router.push("/kyc");
                } else {
                    router.push("/kyc-status");
                }
            } catch (error) {
                console.error("KYC check failed", error);
                router.push("/login");
            }
        };

        checkKYC();
    }, [router]);

    if (isVerifying) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600 font-medium">Verifying KYC Status...</p>
            </div>
        );
    }

    return <>{children}</>;
}
