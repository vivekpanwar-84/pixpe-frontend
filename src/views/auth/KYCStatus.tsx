"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CircleCheck as CheckCircle, Clock, CircleX as XCircle, CircleAlert as AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { kycService } from "@/services/kyc.service";
import { toast } from "sonner";

type KYCStatusType = "APPROVED" | "PENDING" | "SUBMITTED" | "REJECTED";

export default function KYCStatus() {
  const router = useRouter();
  const [status, setStatus] = useState<KYCStatusType>("PENDING");
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const data = await kycService.getKYCStatus();
      setStatus(data.status);
      setRejectionReason(data.rejection_reason || "");
    } catch (error) {
      toast.error("Failed to load KYC status");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const statusConfig = {
    APPROVED: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
      title: "KYC Approved",
      description: "Your account has been verified successfully!",
      badge: "Approved",
      badgeVariant: "default" as const,
    },
    PENDING: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      title: "KYC Pending",
      description: "Please complete your KYC verification to continue.",
      badge: "Pending",
      badgeVariant: "secondary" as const,
    },
    SUBMITTED: {
      icon: AlertCircle,
      color: "text-blue-600",
      bg: "bg-blue-100",
      title: "Under Review",
      description: "Your KYC documents are being reviewed by our team.",
      badge: "Under Review",
      badgeVariant: "secondary" as const,
    },
    REJECTED: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
      title: "KYC Rejected",
      description: "Your KYC verification was rejected. Please resubmit with correct documents.",
      badge: "Rejected",
      badgeVariant: "destructive" as const,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const config = statusConfig[status];
  const Icon = config.icon;

  const handleContinue = () => {
    router.push("/role-detection");
  };

  const handleAction = () => {
    if (status === "PENDING" || status === "REJECTED") {
      router.push("/kyc");
    }
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
            {status === "APPROVED" && (
              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue to Dashboard
              </Button>
            )}

            {(status === "PENDING" || status === "REJECTED") && (
              <>
                {status === "REJECTED" && rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm mb-4">
                    <p className="font-medium text-red-900 mb-1">Rejection Reason:</p>
                    <p className="text-red-700">{rejectionReason}</p>
                  </div>
                )}
                <Button onClick={handleAction} className="w-full" size="lg">
                  {status === "REJECTED" ? "Resubmit Documents" : "Complete KYC Verification"}
                </Button>
              </>
            )}

            {status === "SUBMITTED" && (
              <div className="text-center text-sm text-gray-600">
                Expected review time: 24-48 hours
                <Button variant="ghost" onClick={fetchStatus} size="sm" className="block mx-auto mt-4">
                  Refresh Status
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
