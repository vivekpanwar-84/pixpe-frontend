"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ClipboardCheck, Mail, Lock, Eye, EyeOff, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function AdminSignup() {
    const router = useRouter();
    const { signupAdmin } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        signupAdmin.mutate(formData, {
            onSuccess: () => {
                toast.success("Admin account created successfully! Please login.");
                router.push("/login");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Signup failed. Please try again.");
            },
        });
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
                            <UserPlus className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl md:text-3xl">Admin Registration</CardTitle>
                            <CardDescription className="mt-2">
                                Create a new administrator account
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
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

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@pixpe.com"
                                        className="pl-10"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                        placeholder="Create a strong password"
                                        className="pl-10 pr-10"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                            <Button type="submit" className="w-full" size="lg" disabled={signupAdmin.isPending}>
                                {signupAdmin.isPending ? "Registering..." : "Register Admin"}
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
