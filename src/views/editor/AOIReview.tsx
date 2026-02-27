"use client";

import { useEditor } from "@/hooks/useEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    Users,
    User,
    AlertCircle,
    MapPin,
    Image as ImageIcon,
    XCircle,
    CheckCircle,
    Clock,
    Search,
    Filter,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useState, useMemo } from "react";

function AOIStats({ aoiId }: { aoiId: string }) {
    const { useAoiStats } = useEditor();
    const { data: stats, isLoading } = useAoiStats(aoiId);

    if (isLoading) {
        return <Skeleton className="h-4 w-32 rounded" />;
    }

    if (!stats) return null;

    return (
        <>
            <div className="flex items-center gap-1.5 px-2 py-0.5 font-bold text-[11px] text-gray-500 bg-transparent h-7">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>{stats.totalPhotos} Total</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 font-bold text-[11px] text-gray-500 bg-transparent h-7">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>{stats.reviewedPhotos} Reviewed</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 font-bold text-[11px] text-gray-500 bg-transparent h-7">
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>{stats.rejectedPhotos} Rejected</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 font-bold text-[11px] text-gray-500 bg-transparent h-7">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{stats.pendingPhotos} Pending</span>
            </div>
        </>
    );
}

export default function AOIReview() {
    const { useAssignedAois } = useEditor();
    const { data: aois, isLoading, error } = useAssignedAois();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredAois = useMemo(() => {
        if (!aois) return [];
        return aois.filter((aoi: any) => {
            const matchesSearch =
                (aoi.aoi_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                (aoi.aoi_code?.toLowerCase() || "").includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "ALL" || aoi.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [aois, searchQuery, statusFilter]);

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
        <div className="p-3 lg:p-4 space-y-6 w-full max-w-7xl">
            {/* Header matches reference */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-2xl lg:text-3xl font-semibold mb-1 text-gray-900">
                        AOI Review
                    </h1>
                    <p className="text-gray-500 font-medium text-xs">
                        Review and manage your assigned areas
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search name or code..."
                            className="pl-9 h-10 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm font-medium text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            className="pl-9 pr-4 h-10 w-full sm:w-40 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm font-medium text-xs appearance-none cursor-pointer outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="ASSIGNED">Assigned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredAois.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 bg-gray-50/50 rounded-[32px]">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No survey areas matching your filters.</p>
                    {(searchQuery || statusFilter !== "ALL") && (
                        <button
                            onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}
                            className="mt-4 text-blue-600 font-bold text-sm hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredAois.map((aoi: any, index: number) => (
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
                                        <div className="flex justify-between items-start">
                                            <h2 className="text-base lg:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                                {aoi.aoi_name || `Area #${aoi.aoi_code}`}
                                            </h2>
                                        </div>

                                        {/* Metadata Badge Row */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Status Badge */}
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-2.5 py-0.5 font-bold text-[11px] rounded-md h-7 uppercase tracking-wider">
                                                {aoi.status || "PENDING"}
                                            </Badge>

                                            {/* Code Badge */}
                                            <Badge variant="outline" className="border-gray-200 text-gray-500 px-2.5 py-0.5 font-bold text-[11px] rounded-md h-7">
                                                {aoi.aoi_code}
                                            </Badge>

                                            {/* Surveyor Link Info */}
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 font-bold text-[11px] text-gray-500 bg-transparent h-7">
                                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                                <span>S: {aoi.assigned_to_surveyor?.name || "Surveyor"}</span>
                                            </div>

                                            {/* Editor Link Info */}
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 font-bold text-[11px] text-gray-500 bg-transparent h-7">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                <span>E: {aoi.assigned_to_editor?.name || "Editor"}</span>
                                            </div>

                                            {/* Separator */}
                                            <div className="w-px h-4 bg-gray-200 mx-1 hidden sm:block" />

                                            {/* AOI Stats */}
                                            <AOIStats aoiId={aoi.id} />
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
