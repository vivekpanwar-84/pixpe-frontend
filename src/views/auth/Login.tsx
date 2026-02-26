"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ClipboardCheck, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const { login, requestOtp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    login.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          toast.success("Login successful!");
          router.push("/role-detection");
          /* 
          // Original OTP Flow:
          toast.success("Credentials verified! Sending OTP...");
          requestOtp.mutate(email, {
            onSuccess: () => {
              toast.success("OTP sent to your email!");
              router.push("/otp");
            },
            onError: (error: any) => {
              toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
            }
          });
          */
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
        },
      }
    );
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
            <div className="mx-auto bg-blue-600 rounded-2xl p-4 w-fit">
              <ClipboardCheck className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl md:text-3xl">Welcome Back</CardTitle>
              <CardDescription className="mt-2">
                Sign in to your Pixpe account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-blue-600 hover:text-blue-700">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
                {login.isPending ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button type="button" onClick={() => router.push("/signup")} className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign Up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 Pixpe. Enterprise Survey Management System
        </p>
      </motion.div>
    </div>
  );
}
