"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Users, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function RoleDetection() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    const checkAndRedirect = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(userStr);
      const role = typeof user.role === 'string' ? user.role : user.role?.slug;
      const rolePath = String(role || "").toLowerCase();

      try {
        const { kycService } = await import("@/services/kyc.service");
        const kycData = await kycService.getKYCStatus();

        if (rolePath === 'surveyor' && kycData?.status !== 'APPROVED') {
          if (kycData?.status === 'PENDING' || kycData?.status === 'REJECTED') {
            router.push("/kyc");
          } else {
            router.push("/kyc-status");
          }
          return;
        }

        switch (rolePath) {
          case 'admin': router.push("/admin"); break;
          case 'manager': router.push("/manager"); break;
          case 'editor': router.push("/editor"); break;
          case 'surveyor': router.push("/surveyor"); break;
          default: router.push("/login"); break;
        }
      } catch (error) {
        console.error("KYC Check Error:", error);
        if (rolePath) router.push(`/${rolePath}`);
        else router.push("/login");
      }
    };

    const redirectTimer = setTimeout(checkAndRedirect, 2000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto bg-blue-600 rounded-full p-6 w-fit mb-6"
        >
          <Users className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-bold mb-2">Detecting Your Role</h2>
        <p className="text-gray-600 mb-8">
          Please wait while we verify your access level...
        </p>

        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{progress}% Complete</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
