"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function OTPVerification() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const { verifyOtp, requestOtp } = useAuth();
  const [loading, setLoading] = useState(false);

  const getEmail = () => {
    if (typeof window === 'undefined') return "";
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return "";
      const user = JSON.parse(userStr);
      return user.email || "";
    } catch (e) {
      console.error("Error parsing user from storage", e);
      return "";
    }
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      const email = getEmail();
      if (!email) {
        toast.error("User email not found. Please login again.");
        router.push("/login");
        return;
      }

      verifyOtp.mutate(
        { email, otp },
        {
          onSuccess: (data: any) => {
            toast.success("Login successful! Welcome to Pixpe.");
            router.push("/role-detection");
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
          },
        }
      );
    }
  };

  const handleResend = () => {
    const email = getEmail();
    if (!email) {
      toast.error("User email not found. Please login again.");
      router.push("/login");
      return;
    }

    requestOtp.mutate(email, {
      onSuccess: () => {
        toast.success("A new OTP has been sent to your email!");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to resend OTP.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/login")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-green-600 rounded-2xl p-4 w-fit">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl md:text-3xl">Verify OTP</CardTitle>
              <CardDescription className="mt-2">
                Enter the 6-digit code sent to your Pixpe email
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full"
              size="lg"
              disabled={otp.length !== 6}
            >
              Verify Code
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="link"
                className="text-blue-600"
                onClick={handleResend}
                disabled={requestOtp.isPending}
              >
                {requestOtp.isPending ? "Sending..." : "Resend Code"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
