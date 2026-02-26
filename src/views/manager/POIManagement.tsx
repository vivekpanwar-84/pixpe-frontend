"use client";

import { useState } from "react";
import {
    Users,
    MoreHorizontal,
    UserPlus,
    Search,
    Filter,
    Camera,
    MapPin,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    LayoutGrid,
    List as ListIcon,
    Check,
    XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useManager } from "@/hooks/useManager";
import { useAdmin } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

export default function POIManagement() {
    const { useAllPhotos, assignPhoto, updatePhotoStatus } = useManager();
    const { useAllUsers } = useAdmin();
    const { data: photos, isLoading: photosLoading } = useAllPhotos();
    const { data: editors } = useAllUsers("EDITOR");

    const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
    const [selectedEditor, setSelectedEditor] = useState<string>("");
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const handleAssign = async () => {
        if (!selectedPhoto || !selectedEditor) return;

        try {
            await assignPhoto.mutateAsync({
                id: selectedPhoto.id,
                editorId: selectedEditor
            });
            toast.success("Photo assigned successfully");
            setIsAssignModalOpen(false);
            setSelectedPhoto(null);
            setSelectedEditor("");
        } catch (error) {
            toast.error("Failed to assign photo");
        }
    };

    const handleApprove = async (photo: any) => {
        try {
            await updatePhotoStatus.mutateAsync({
                id: photo.id,
                data: { status: "APPROVED" }
            });
            toast.success("Photo approved successfully");
        } catch (error) {
            toast.error("Failed to approve photo");
        }
    };

    const handleReject = async () => {
        if (!selectedPhoto || !rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        try {
            await updatePhotoStatus.mutateAsync({
                id: selectedPhoto.id,
                data: {
                    status: "REJECTED",
                    rejection_reason: rejectionReason
                }
            });
            toast.success("Photo rejected successfully");
            setIsRejectModalOpen(false);
            setSelectedPhoto(null);
            setRejectionReason("");
        } catch (error) {
            toast.error("Failed to reject photo");
        }
    };

    const filteredPhotos = photos?.filter((photo: any) =>
        photo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.uploaded_by?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "ASSIGNED": return "bg-blue-100 text-blue-700 border-blue-200";
            case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
            case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold mb-1">POI Management</h1>
                    <p className="text-gray-600">Review and assign points of interest (Photos)</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <Button
                            variant={viewMode === 'grid' ? "outline" : "ghost"}
                            size="sm"
                            className={`h-8 w-8 p-0 ${viewMode === 'grid' ? "bg-white shadow-sm" : ""}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? "outline" : "ghost"}
                            size="sm"
                            className={`h-8 w-8 p-0 ${viewMode === 'list' ? "bg-white shadow-sm" : ""}`}
                            onClick={() => setViewMode('list')}
                        >
                            <ListIcon className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search photos..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {photosLoading ? (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className={viewMode === 'grid' ? "h-48 w-full" : "h-24 w-full"} />
                            {viewMode === 'grid' && (
                                <CardContent className="p-4 space-y-3">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            ) : filteredPhotos?.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="bg-gray-50 p-4 rounded-full w-fit mx-auto mb-4">
                        <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold">No Photos Found</h3>
                    <p className="text-gray-500">There are no photos to manage at the moment.</p>
                </Card>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPhotos?.map((photo: any) => (
                        <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200">
                            <div className="relative h-48 group">
                                <img
                                    src={photo.photo_url}
                                    alt="POI"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3">
                                    <Badge className={`${getStatusColor(photo.status)} border shadow-sm`}>
                                        {photo.status}
                                    </Badge>
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => window.open(photo.photo_url, '_blank')}
                                    >
                                        View Full Image
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 truncate flex items-center gap-2">
                                            <Camera className="w-4 h-4 text-blue-500" />
                                            {photo.photo_type.replace('_', ' ')}
                                        </h3>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedPhoto(photo);
                                                        setIsAssignModalOpen(true);
                                                    }}
                                                    disabled={photo.status !== "PENDING"}
                                                >
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Assign Editor
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                                                    onClick={() => handleApprove(photo)}
                                                    disabled={photo.status === "APPROVED"}
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Approve POI
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    onClick={() => {
                                                        setSelectedPhoto(photo);
                                                        setIsRejectModalOpen(true);
                                                    }}
                                                    disabled={photo.status === "REJECTED"}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject POI
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{photo.uploaded_by?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 justify-end">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{format(new Date(photo.created_at), "MMM d, HH:mm")}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="truncate">{photo.latitude}, {photo.longitude}</span>
                                        </div>
                                    </div>
                                </div>

                                {photo.status === "PENDING" && (
                                    <Button
                                        className="w-full mt-2"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedPhoto(photo);
                                            setIsAssignModalOpen(true);
                                        }}
                                    >
                                        Assign Editor
                                    </Button>
                                )}

                                {photo.status === "ASSIGNED" && photo.assigned_to && (
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md text-sm text-blue-700 border border-blue-100">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Assigned to: <strong>{photo.assigned_to.name}</strong></span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPhotos?.map((photo: any) => (
                        <Card key={photo.id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
                                <div
                                    className="relative w-24 h-24 md:w-32 md:h-24 flex-shrink-0 cursor-pointer group"
                                    onClick={() => window.open(photo.photo_url, '_blank')}
                                >
                                    <img
                                        src={photo.photo_url}
                                        alt="POI"
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                        <Search className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {photo.photo_type.replace('_', ' ')}
                                            </h3>
                                            <Badge className={`${getStatusColor(photo.status)} border shadow-sm`}>
                                                {photo.status}
                                            </Badge>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedPhoto(photo);
                                                        setIsAssignModalOpen(true);
                                                    }}
                                                    disabled={photo.status !== "PENDING"}
                                                >
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Assign Editor
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                                                    onClick={() => handleApprove(photo)}
                                                    disabled={photo.status === "APPROVED"}
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Approve POI
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    onClick={() => {
                                                        setSelectedPhoto(photo);
                                                        setIsRejectModalOpen(true);
                                                    }}
                                                    disabled={photo.status === "REJECTED"}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject POI
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-3">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Users className="w-4 h-4 text-blue-500" />
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400">Uploaded By</p>
                                                <p className="font-medium text-gray-700">{photo.uploaded_by?.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Calendar className="w-4 h-4 text-purple-500" />
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400">Captured At</p>
                                                <p className="font-medium text-gray-700">{format(new Date(photo.created_at), "MMM d, yyyy HH:mm")}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MapPin className="w-4 h-4 text-green-500" />
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400">Coordinates</p>
                                                <p className="font-medium text-gray-700 truncate">{photo.latitude}, {photo.longitude}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 ml-auto">
                                                {photo.status === "PENDING" && (
                                                    <Button
                                                        className="h-9 px-4"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedPhoto(photo);
                                                            setIsAssignModalOpen(true);
                                                        }}
                                                    >
                                                        Assign Editor
                                                    </Button>
                                                )}
                                                {photo.status === "ASSIGNED" && photo.assigned_to && (
                                                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>{photo.assigned_to.name}</span>
                                                    </div>
                                                )}
                                                {photo.status !== "APPROVED" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleApprove(photo)}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Assignment Modal */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Photo to Editor</DialogTitle>
                        <DialogDescription>
                            Select an editor to review this POI photo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Editor</label>
                            <Select onValueChange={setSelectedEditor} value={selectedEditor}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Search editors..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {editors?.map((editor: any) => (
                                        <SelectItem key={editor.id} value={editor.id}>
                                            <div className="flex flex-col">
                                                <span>{editor.name}</span>
                                                <span className="text-xs text-gray-500">{editor.email}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedPhoto && (
                            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3 text-sm border border-gray-100">
                                <img
                                    src={selectedPhoto.photo_url}
                                    className="w-12 h-12 rounded object-cover"
                                    alt="Preview"
                                />
                                <div>
                                    <p className="font-medium">{selectedPhoto.photo_type}</p>
                                    <p className="text-gray-500">Uploaded by {selectedPhoto.uploaded_by?.name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedEditor || assignPhoto.isPending}
                        >
                            {assignPhoto.isPending ? "Assigning..." : "Confirm Assignment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject POI Photo</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this photo. This will be visible to the surveyor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rejection Reason</label>
                            <Textarea
                                placeholder="e.g., Blurry image, retake needed"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        {selectedPhoto && (
                            <div className="p-3 bg-red-50 rounded-lg flex items-center gap-3 text-sm border border-red-100">
                                <img
                                    src={selectedPhoto.photo_url}
                                    className="w-12 h-12 rounded object-cover"
                                    alt="Preview"
                                />
                                <div>
                                    <p className="font-medium text-red-900">{selectedPhoto.photo_type}</p>
                                    <p className="text-red-700 opacity-70">Uploaded by {selectedPhoto.uploaded_by?.name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectionReason.trim() || updatePhotoStatus.isPending}
                        >
                            {updatePhotoStatus.isPending ? "Rejecting..." : "Reject Photo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
