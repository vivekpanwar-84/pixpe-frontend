"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardCheck, Mail, Lock, Eye, EyeOff, User, Phone, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Signup() {
    const router = useRouter();
    const { signup, verifyOtp, requestOtp } = useAuth();
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "surveyor",
    });

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        signup.mutate(
            {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
                role: formData.role,
            },
            {
                onSuccess: () => {
                    toast.success("Account created! Verify code has been sent.");
                    setStep(2); // Move to OTP step
                },
                onError: (error: any) => {
                    toast.error(
                        error.response?.data?.message || "Signup failed. Please try again."
                    );
                },
            }
        );
    };

    const handleVerify = () => {
        if (otp.length === 6) {
            verifyOtp.mutate(
                { email: formData.email, otp },
                {
                    onSuccess: () => {
                        toast.success("Email verified successfully! Welcome.");
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
        requestOtp.mutate(formData.email, {
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
                className="w-full max-w-md space-y-4"
            >
                {step === 2 && (
                    <Button
                        variant="ghost"
                        className="w-full flex items-center justify-start"
                        onClick={() => setStep(1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Signup
                    </Button>
                )}

                <Card className="shadow-xl">
                    <CardHeader className="text-center space-y-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={`mx-auto rounded-2xl p-4 w-fit ${step === 1 ? 'bg-blue-600' : 'bg-green-600'}`}
                            >
                                {step === 1 ? (
                                    <ClipboardCheck className="w-10 h-10 text-white" />
                                ) : (
                                    <Shield className="w-10 h-10 text-white" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                        <div>
                            <CardTitle className="text-2xl md:text-3xl">
                                {step === 1 ? "Create Account" : "Verify Email"}
                            </CardTitle>
                            <CardDescription className="mt-2 flex flex-col items-center">
                                <span>{step === 1 
                                    ? "Join Pixpe — sign up to get started" 
                                    : "Enter the 6-digit code sent to:"}</span>
                                {step === 2 && (
                                    <span className="font-medium text-gray-800 mt-1 flex items-center gap-1">
                                        {formData.email}
                                        <button 
                                            onClick={() => setStep(1)} 
                                            className="text-xs text-blue-600 hover:text-blue-700 underline font-normal ml-1"
                                        >
                                            Change
                                        </button>
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.form
                                    key="signup-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleSignup}
                                    className="space-y-4"
                                >
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="John Doe"
                                                className="pl-10"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                className="pl-10"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            Phone Number{" "}
                                            <span className="text-gray-400 font-normal text-xs">(optional)</span>
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                className="pl-10"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Min. 6 characters"
                                                className="pl-10 pr-10"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={signup.isPending}
                                    >
                                        {signup.isPending ? "Creating Account..." : "Create Account"}
                                    </Button>

                                    <div className="text-center text-sm text-gray-600">
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => router.push("/login")}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Sign In
                                        </button>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="otp-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
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
                                        disabled={otp.length !== 6 || verifyOtp.isPending}
                                    >
                                        {verifyOtp.isPending ? "Verifying..." : "Verify Code"}
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
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-500 mt-6">
                    © 2026 Pixpe. Enterprise Survey Management System
                </p>
            </motion.div>
        </div>
    );
}
