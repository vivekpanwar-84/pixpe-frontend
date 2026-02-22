"use client";

import { useAuthContext } from "@/providers/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/login", "/signup"];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading, user } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
            const isOtpRoute = pathname === "/otp";
            const isSplash = pathname === "/";
            const hasUserInStorage = !!localStorage.getItem("user");
            const hasTokenInStorage = !!localStorage.getItem("token");

            if (isAuthenticated && hasTokenInStorage) {
                // Fully logged in - redirect away from auth pages
                if (isPublicRoute || isSplash || isOtpRoute) {
                    router.push("/role-detection");
                }
            } else if (!isAuthenticated && hasUserInStorage && !hasTokenInStorage) {
                // Pending OTP - force them to stay on /otp
                if (!isOtpRoute) {
                    router.push("/otp");
                }
            } else if (!isAuthenticated && !isPublicRoute && !isSplash) {
                // Not logged in at all - redirect to login
                router.push("/login");
            }
        }
    }, [isAuthenticated, loading, pathname, router, user]);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isSplash = pathname === "/";
    const isOtpRoute = pathname === "/otp";
    const hasUserInStorage = typeof window !== "undefined" && !!localStorage.getItem("user");
    const hasTokenInStorage = typeof window !== "undefined" && !!localStorage.getItem("token");

    // Allow rendering if:
    // 1. Authenticated
    // 2. Public route or Splash
    // 3. OTP route AND in pending state
    const isPendingOtp = !isAuthenticated && hasUserInStorage && !hasTokenInStorage;

    if (!isAuthenticated && !isPublicRoute && !isSplash && !(isOtpRoute && isPendingOtp)) {
        return null;
    }

    return <>{children}</>;
};
