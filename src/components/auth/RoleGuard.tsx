"use client";

import { useAuthContext } from "@/providers/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { user, loading, isAuthenticated } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!loading && isAuthenticated && user) {
            const roleSlug = typeof user.role === 'string' ? user.role : user.role?.slug;
            if (roleSlug) {
                const userRole = roleSlug.toUpperCase();
                const hasRole = allowedRoles.includes(userRole);
                if (!hasRole) {
                    // Redirect to their default dashboard if they try to access unauthorized route
                    switch (userRole) {
                        case "ADMIN":
                            router.push("/admin");
                            break;
                        case "MANAGER":
                            router.push("/manager");
                            break;
                        case "EDITOR":
                            router.push("/editor");
                            break;
                        case "SURVEYOR":
                            router.push("/surveyor");
                            break;
                        default:
                            router.push("/login");
                    }
                }
            }
        }
    }, [user, loading, isAuthenticated, allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const roleSlug = typeof user?.role === 'string' ? user.role : user?.role?.slug;
    const userRole = roleSlug?.toUpperCase();

    if (!user || !userRole || !allowedRoles.includes(userRole)) {
        return null;
    }

    return <>{children}</>;
};
