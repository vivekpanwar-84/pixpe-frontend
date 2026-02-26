"use client";
import { ImageIcon, ChevronRight, User, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEditor } from "@/hooks/useEditor";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/components/ui/utils";

export default function AssignedPhotos() {
    const { useAssignedPhotos } = useEditor();
    const { data: photos, isLoading } = useAssignedPhotos();

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold mb-1">Assigned Photos</h1>
                    <p className="text-gray-600">Review and verify photos assigned to you</p>
                </div>
            </div>

            <div className="grid gap-3 max-w-5xl mx-auto">
                {isLoading ? (
                    [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
                ) : !photos || photos.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>No assigned photos found.</p>
                        </CardContent>
                    </Card>
                ) : (
                    photos.map((photo: any) => (
                        <Card key={photo.id} className="hover:border-blue-200 transition-colors group">
                            <CardContent className="p-0">
                                <div className="flex flex-row items-center h-20 md:h-24 px-2">
                                    {/* Photo Preview Section */}
                                    <div className="w-24 h-16 md:w-32 md:h-20 relative bg-gray-100 overflow-hidden rounded-md border border-gray-200 shrink-0">
                                        {photo.photo_url ? (
                                            <img
                                                src={photo.photo_url}
                                                alt={photo.photo_type}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0.5 right-0.5">
                                            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-[8px] px-1 h-3.5 leading-none">
                                                {photo.photo_type}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 px-3 flex flex-row items-center justify-between min-w-0">
                                        <div className="min-w-0 flex-1 pr-4">
                                            <h3 className="font-semibold text-sm md:text-base leading-tight truncate">
                                                {photo.aoi?.aoi_name || "Untitled AOI"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge className={cn(
                                                    "text-[9px] px-1.5 h-4 shrink-0 font-medium",
                                                    photo.status === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
                                                        photo.status === 'ASSIGNED' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                                )}>
                                                    {photo.status}
                                                </Badge>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                    <span className="flex items-center gap-1 shrink-0">
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        {photo.aoi?.city || "Unknown"}
                                                    </span>
                                                    <span className="flex items-center gap-1 shrink-0">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {new Date(photo.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
                                                <User className="w-2.5 h-2.5" />
                                                <span className="truncate">By: {photo.uploaded_by?.name || "Surveyor"}</span>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            <Button asChild size="sm" className="h-8 text-xs px-4 rounded-full">
                                                <Link href={`/editor/review/${photo.id}`}>
                                                    Review
                                                    <ChevronRight className="w-3 h-3 ml-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
