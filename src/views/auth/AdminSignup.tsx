"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ClipboardCheck, Mail, Lock, Eye, EyeOff, UserPlus, User, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ROLES = [
    { value: "admin", label: "Admin — Full system access" },
    { value: "manager", label: "Manager — AOI & team management" },
    { value: "editor", label: "Editor — Photo review & analysis" },
    { value: "surveyor", label: "Surveyor — Field photo capture" },
];

export default function Signup() {
    const router = useRouter();
    const { signup } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
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
                onSuccess: (data) => {
                    toast.success(`Account created! Welcome, ${data.user?.name}!`);
                    router.push("/role-detection");
                },
                onError: (error: any) => {
                    toast.error(
                        error.response?.data?.message || "Signup failed. Please try again."
                    );
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
                            <CardTitle className="text-2xl md:text-3xl">Create Account</CardTitle>
                            <CardDescription className="mt-2">
                                Join Pixpe — sign up to get started
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">

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

                            {/* Phone (optional) */}
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


                            {/* Submit */}
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
