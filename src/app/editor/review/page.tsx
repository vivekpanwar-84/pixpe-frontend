"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ReviewPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the first item or dashboard for now
        // In a real app, this would list items
        router.push("/editor");
    }, [router]);

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Redirecting to workspace...</span>
        </div>
    );
}
