
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata = {
    title: "Pixpe",
    description: "Pixpe Application",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <QueryProvider>
                    <AuthProvider>
                        <AuthGuard>
                            {children}
                        </AuthGuard>
                    </AuthProvider>
                </QueryProvider>
                <Toaster position="top-center" />
            </body>
        </html>
    );
}
