"use client";

import { useEditor } from "@/hooks/useEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Users,
    User,
    AlertCircle,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/components/ui/utils";

export default function AOIReview() {
    const { useAssignedAois } = useEditor();
    const { data: aois, isLoading, error } = useAssignedAois();

    if (isLoading) {
        return (
            <div className="p-8 space-y-4 w-full max-w-[1400px]">
                <div className="mb-10 space-y-2">
                    <Skeleton className="h-12 w-64 rounded-lg" />
                    <Skeleton className="h-5 w-80 rounded-md" />
                </div>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 w-full max-w-[1400px]">
                <div className="bg-rose-50 border border-rose-100 rounded-3xl p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-rose-900 mb-2">Failed to load AOIs</h2>
                    <p className="text-rose-600 mb-6">There was an issue fetching the assigned areas.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-rose-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 lg:p-4 space-y-5 w-full max-w-7xl">
            {/* Header matches reference */}
            <div className="space-y-0.5">
                <h1 className="text-lg lg:text-xl font-black tracking-tight text-gray-900 uppercase">
                    AOI Management
                </h1>
                <p className="text-gray-500 font-medium text-xs">
                    Create and manage survey areas
                </p>
            </div>

            {aois?.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 bg-gray-50/50 rounded-[32px]">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No assigned areas found.</p>
                </Card>
            ) : (
                <div className="space-y-5">
                    {aois?.map((aoi: any, index: number) => (
                        <motion.div
                            key={aoi.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={`/editor/aoi/${aoi.id}`}>
                                <Card className="border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200 rounded-[16px] bg-white group cursor-pointer overflow-hidden">
                                    <CardContent className="p-3 lg:p-4 space-y-2">
                                        {/* AOI Title */}
                                        <h2 className="text-base lg:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {aoi.aoi_name || `AOI-${index + 1}`}
                                        </h2>

                                        {/* Metadata Badge Row - matches reference precisely */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Status Badge */}
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none px-2 py-0.5 font-bold text-[9px] rounded-md h-6">
                                                {aoi.status || "PENDING"}
                                            </Badge>

                                            {/* Code Badge */}
                                            <Badge variant="outline" className="border-gray-200 text-gray-500 px-2 py-0.5 font-bold text-[9px] rounded-md h-6">
                                                {aoi.aoi_code}
                                            </Badge>

                                            {/* Surveyor Link Info */}
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 font-bold text-[9px] text-gray-400 bg-transparent h-6">
                                                <Users className="w-3 h-3" />
                                                <span>S: {aoi.assigned_to_surveyor?.name || "Surveyor"}</span>
                                            </div>

                                            {/* Editor Link Info */}
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 font-bold text-[9px] text-gray-400 bg-transparent h-6">
                                                <User className="w-3 h-3" />
                                                <span>E: {aoi.assigned_to_editor?.name || "Editor"}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
