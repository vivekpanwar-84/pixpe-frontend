"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
    Users,
    Search,
    Camera,
    MapPin,
    Calendar,
    Clock,
    LayoutGrid,
    List as ListIcon,
    ArrowLeft,
    ExternalLink,
    Sparkles,
    CheckCircle2,
    XCircle,
    Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEditor } from "@/hooks/useEditor";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithLoader } from "@/components/ImageWithLoader";

export default function AOIDetail() {
    const { id } = useParams();
    const router = useRouter();
    const { useAoiPhotos, useAoiDetails } = useEditor();
    const { useProfile } = useAuth();

    const { data: profile } = useProfile();
    const { data: aoi, isLoading: aoiLoading } = useAoiDetails(id as string);
    const { data: photos, isLoading: photosLoading } = useAoiPhotos(id as string, profile?.id as string);

    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const filteredPhotos = photos?.filter((photo: any) =>
        photo.photo_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.uploaded_by?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (photo.uploaded_by?.city?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    ) || [];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
            case "ASSIGNED": return "bg-blue-100 text-blue-700 border-blue-200";
            case "APPROVED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "REJECTED": return "bg-rose-100 text-rose-700 border-rose-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    if (aoiLoading || photosLoading) {
        return (
            <div className="p-4 lg:p-6 space-y-8 w-full max-w-7xl">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <div className="space-y-4">
                    <Skeleton className="h-16 w-3/4 rounded-2xl" />
                    <Skeleton className="h-6 w-1/2 rounded-lg" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
                </div>
            </div>
        );
    }

    if (!aoi) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-amber-50 p-6 rounded-full mb-6">
                    <Info className="w-12 h-12 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Area workspace not found</h3>
                <p className="text-gray-500 mb-8 max-w-sm">This area might have been removed or you may not have permission to view it.</p>
                <Button
                    onClick={() => router.push('/editor/aoi')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-500/20"
                >
                    Return to Assignments
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-8 w-full max-w-7xl">
            {/* Header & Controls */}
            <div className="flex flex-col gap-6">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit -ml-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold group"
                        onClick={() => router.push('/editor/aoi')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Workspace
                    </Button>
                </motion.div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg lg:text-xl font-black tracking-tight text-gray-900 uppercase">
                            {aoi.aoi_name || `Area #${aoi.aoi_code}`}
                        </h1>
                        <div className="flex items-center gap-2.5 mt-1 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            {aoi.city}, {aoi.state}
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <Camera className="w-3 h-3 text-blue-500" />
                            {photos?.length || 0} Assets
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Find asset by type or city..."
                                className="pl-11 h-12 bg-white border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 shadow-sm font-bold text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 h-9">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-full px-2.5 rounded-md transition-all ${viewMode === 'grid' ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="w-3 h-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-full px-2.5 rounded-md transition-all ${viewMode === 'list' ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
                                onClick={() => setViewMode('list')}
                            >
                                <ListIcon className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Display */}
            <AnimatePresence mode="wait">
                {filteredPhotos.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                        <Card className="p-16 border-dashed border-2 border-gray-100 bg-gray-50/30 rounded-[40px] max-w-lg mx-auto">
                            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900">No assets found</h3>
                            <p className="text-gray-500 mt-2">There are no photos captured for this location yet.</p>
                        </Card>
                    </motion.div>
                ) : viewMode === 'list' ? (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {filteredPhotos.map((photo: any, idx: number) => (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl border border-gray-100 group">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 p-2">
                                        <div
                                            className="relative w-full md:w-24 h-24 md:h-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg group/img"
                                            onClick={() => window.open(photo.photo_url, '_blank')}
                                        >
                                            <ImageWithLoader
                                                src={photo.photo_url}
                                                alt="Asset"
                                                showViewFull={false}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                <ExternalLink className="w-5 h-5 text-white" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-black text-sm text-gray-900 uppercase truncate">
                                                        {photo.photo_type.replace('_', ' ')}
                                                    </h3>
                                                    <Badge className={`${getStatusStyles(photo.status)} border-none shadow-none px-2 py-0.5 font-black text-[8px] tracking-widest rounded-md uppercase`}>
                                                        {photo.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-blue-500" />
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-gray-400">Surveyor</p>
                                                        <p className="font-semibold text-gray-700">{photo.uploaded_by?.name || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-purple-500" />
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-gray-400">Captured At</p>
                                                        <p className="font-semibold text-gray-700">{format(new Date(photo.created_at), "MMM d, HH:mm")}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-green-500" />
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-gray-400">Coordinates</p>
                                                        <p className="font-semibold text-gray-700 truncate">{photo.latitude}, {photo.longitude}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end">
                                                    <Button
                                                        className="h-8 px-4 rounded-md font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 transition-all active:scale-95 text-[10px] uppercase tracking-wider"
                                                        onClick={() => router.push(`/editor/review/${photo.id}`)}
                                                    >
                                                        {photo.status === "APPROVED" || photo.status === "REJECTED" ? (
                                                            <>
                                                                <Info className="w-3 h-3 mr-1.5" />
                                                                View Details
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Sparkles className="w-3 h-3 mr-1.5" />
                                                                Review
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPhotos.map((photo: any, idx: number) => (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -8 }}
                            >
                                <Card className="overflow-hidden border-none bg-white shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] group h-full flex flex-col">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <ImageWithLoader
                                            src={photo.photo_url}
                                            alt="Asset"
                                            showViewFull={false}
                                        />
                                        <div className="absolute top-4 right-4">
                                            <Badge className={`${getStatusStyles(photo.status)} border-none shadow-xl backdrop-blur-md px-3 py-1 font-black text-[8px] tracking-widest rounded-full uppercase`}>
                                                {photo.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="font-black text-lg text-gray-900 truncate tracking-tight uppercase mb-3">
                                                {photo.photo_type.replace('_', ' ')}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Clock className="w-3 h-3 text-blue-400" />
                                                    {format(new Date(photo.created_at), "MMM d, HH:mm")}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Users className="w-3 h-3 text-purple-400" />
                                                    S: {photo.uploaded_by?.name || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-11 rounded-xl shadow-lg shadow-blue-600/10 transition-all active:scale-95 text-xs uppercase tracking-wider"
                                            onClick={() => router.push(`/editor/review/${photo.id}`)}
                                        >
                                            {photo.status === "APPROVED" || photo.status === "REJECTED" ? (
                                                <>
                                                    <Info className="w-4 h-4 mr-2" />
                                                    View Details
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    Start Review
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
