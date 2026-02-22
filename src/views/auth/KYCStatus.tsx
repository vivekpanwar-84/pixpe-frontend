"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CircleCheck as CheckCircle, Clock, CircleX as XCircle, CircleAlert as AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type KYCStatusType = "approved" | "pending" | "under_review" | "rejected";

export default function KYCStatus() {
  const router = useRouter();
  const [status, setStatus] = useState<KYCStatusType>("pending");

  useEffect(() => {
    // Simulate KYC check
    const timer = setTimeout(() => {
      setStatus("approved");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const statusConfig = {
    approved: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
      title: "KYC Approved",
      description: "Your account has been verified successfully!",
      badge: "Approved",
      badgeVariant: "default" as const,
    },
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      title: "KYC Pending",
      description: "Please complete your KYC verification to continue.",
      badge: "Pending",
      badgeVariant: "secondary" as const,
    },
    under_review: {
      icon: AlertCircle,
      color: "text-blue-600",
      bg: "bg-blue-100",
      title: "Under Review",
      description: "Your KYC documents are being reviewed by our team.",
      badge: "Under Review",
      badgeVariant: "secondary" as const,
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
      title: "KYC Rejected",
      description: "Your KYC verification was rejected. Please resubmit with correct documents.",
      badge: "Rejected",
      badgeVariant: "destructive" as const,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const handleContinue = () => {
    // Navigate based on role (mocked as surveyor)
    router.push("/surveyor");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className={`mx-auto ${config.bg} rounded-2xl p-4 w-fit`}>
              <Icon className={`w-12 h-12 ${config.color}`} />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-2xl md:text-3xl">{config.title}</CardTitle>
                <Badge variant={config.badgeVariant}>{config.badge}</Badge>
              </div>
              <CardDescription className="mt-2">
                {config.description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "approved" && (
              <>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">Surveyor</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="font-medium">SRV-2026-001</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Verified On:</span>
                    <span className="font-medium">Feb 17, 2026</span>
                  </div>
                </div>

                <Button onClick={handleContinue} className="w-full" size="lg">
                  Continue to Dashboard
                </Button>
              </>
            )}

            {status === "pending" && (
              <Button className="w-full" size="lg">
                Complete KYC Verification
              </Button>
            )}

            {status === "under_review" && (
              <div className="text-center text-sm text-gray-600">
                Expected review time: 24-48 hours
              </div>
            )}

            {status === "rejected" && (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                  <p className="font-medium text-red-900 mb-1">Rejection Reason:</p>
                  <p className="text-red-700">
                    Document quality is not clear. Please upload a high-resolution copy of your ID.
                  </p>
                </div>
                <Button className="w-full" size="lg">
                  Resubmit Documents
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
