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
    XCircle,
    FileText,
    Phone,
    ArrowRight
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

interface POIManagementProps {
    aoiId?: string;
}

export default function POIManagement({ aoiId }: POIManagementProps) {
    const { useAllPhotos, assignPhoto, updatePhotoStatus } = useManager();
    const { useAllUsers } = useAdmin();
    const { data: photos, isLoading: photosLoading } = useAllPhotos({ aoiId });
    const { data: editors } = useAllUsers("editor");

    const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
    const [selectedEditor, setSelectedEditor] = useState<string>("");
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [isFormDetailOpen, setIsFormDetailOpen] = useState(false);
    const [selectedForm, setSelectedForm] = useState<any>(null);

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

    const filteredPhotos = photos?.filter((photo: any) => {
        const matchesSearch = photo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            photo.uploaded_by?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAoi = !aoiId || photo.aoi_id === aoiId;

        return matchesSearch && matchesAoi;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "ASSIGNED": return "bg-blue-100 text-blue-700 border-blue-200";
            case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
            case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const handleViewForm = (photo: any) => {
        if (photo.form) {
            setSelectedPhoto(photo);
            setSelectedForm(photo.form);
            setIsFormDetailOpen(true);
        } else {
            toast.error("No form data available for this photo");
        }
    };

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {!aoiId ? (
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold mb-1">POI Management</h1>
                        <p className="text-gray-600">Review and assign points of interest (Photos)</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold px-3 py-1">
                            <Camera className="w-3.5 h-3.5 mr-1.5" /> Photos Gallery
                        </Badge>
                    </div>
                )}
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
                            className="pl-9 h-9"
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
                                                    className="cursor-pointer"
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
                                                    className="text-green-600 focus:text-green-600 focus:bg-green-50 cursor-pointer"
                                                    onClick={() => handleApprove(photo)}
                                                    disabled={photo.status === "APPROVED"}
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Approve POI
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedPhoto(photo);
                                                        setIsRejectModalOpen(true);
                                                    }}
                                                    disabled={photo.status === "REJECTED"}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject POI
                                                </DropdownMenuItem>
                                                {photo.form && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-blue-600 focus:text-blue-600 focus:bg-blue-50 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewForm(photo);
                                                            }}
                                                        >
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            View Form Details
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
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
                                    {photo.form ? (
                                        <Button
                                            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-9"
                                            onClick={() => handleViewForm(photo)}
                                        >
                                            <FileText className="w-4 h-4 mr-2" /> View Form Details
                                        </Button>
                                    ) : (
                                        ["ASSIGNED", "IN_REVIEW", "FORM_SUBMITTED", "APPROVED", "REJECTED"].includes(photo.status) && (
                                            <div className="mt-2 py-2 px-3 bg-orange-50 rounded-lg border border-orange-100 text-xs text-orange-700 font-medium flex items-center justify-center gap-1.5">
                                                <AlertCircle className="w-3.5 h-3.5" /> No form filled by editor
                                            </div>
                                        )
                                    )}
                                </div>

                                {photo.status === "ASSIGNED" && photo.assigned_to && (
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md text-sm text-blue-700 border border-blue-100">
                                        <Users className="w-4 h-4" />
                                        <span className="truncate">Assigned to: <strong>{photo.assigned_to.name}</strong></span>
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
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedPhoto(photo);
                                                        setIsRejectModalOpen(true);
                                                    }}
                                                    disabled={photo.status === "REJECTED"}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject POI
                                                </DropdownMenuItem>
                                                {photo.form && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-blue-600 focus:text-blue-600 focus:bg-blue-50 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewForm(photo);
                                                            }}
                                                        >
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            View Form Details
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
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
                                                <p className="font-medium text-gray-700 truncate">{photo.latitude}, {photo.longitude}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {photo.form ? (
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                                                    onClick={() => handleViewForm(photo)}
                                                >
                                                    <FileText className="w-3.5 h-3.5 mr-1.5" /> View Form
                                                </Button>
                                            ) : (
                                                ["ASSIGNED", "IN_REVIEW", "FORM_SUBMITTED", "APPROVED", "REJECTED"].includes(photo.status) && (
                                                    <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700 text-[10px] font-bold">
                                                        No form fill by editor
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 ml-auto">
                                                {photo.status === "ASSIGNED" && photo.assigned_to && (
                                                    <div className="flex items-center gap-2 text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                                        <Users className="w-4 h-4" />
                                                        <span className="text-xs">{photo.assigned_to.name}</span>
                                                    </div>
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
            {/* Form Detail Modal */}
            <Dialog open={isFormDetailOpen} onOpenChange={setIsFormDetailOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedForm ? (
                        <>
                            <div className="bg-blue-600 p-6 text-white text-left">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                        {selectedForm.form_type || "BUSINESS_DETAILS"}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-2xl font-bold text-white">
                                    {selectedForm.form_data?.business_name || "Form Details"}
                                </DialogTitle>
                                <DialogDescription className="text-blue-100 italic">
                                    Submitted {selectedForm.created_at ? format(new Date(selectedForm.created_at), "PPP p") : ""}
                                </DialogDescription>
                            </div>

                            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto bg-white text-left">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Users className="w-3 h-3" /> Owner Name
                                            </label>
                                            <p className="text-gray-900 font-medium">{selectedForm.form_data?.owner_name || "N/A"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Phone className="w-3 h-3" /> Contact Phone
                                            </label>
                                            <p className="text-gray-900 font-medium">{selectedForm.form_data?.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 text-left">
                                                <Clock className="w-3 h-3" /> Timings
                                            </label>
                                            <p className="text-gray-900 font-medium">{selectedForm.form_data?.timings || "N/A"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Calendar className="w-3 h-3" /> Days Open
                                            </label>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedForm.form_data?.days_open?.map((day: string) => (
                                                    <Badge key={day} variant="secondary" className="text-[10px] py-0 px-1.5 bg-gray-100 text-gray-600">
                                                        {day}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Categories</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedForm.form_data?.categories?.map((cat: string) => (
                                            <Badge key={cat} className="bg-blue-50 text-blue-600 border-blue-100">
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {selectedForm.form_data?.details && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Additional Details</label>
                                        <p className="text-sm text-gray-600 leading-relaxed">{selectedForm.form_data.details}</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => {
                                            setIsFormDetailOpen(false);
                                            setIsRejectModalOpen(true);
                                        }}
                                        disabled={selectedPhoto?.status === "REJECTED"}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" /> Reject POI
                                    </Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => {
                                            handleApprove(selectedPhoto);
                                            setIsFormDetailOpen(false);
                                        }}
                                        disabled={selectedPhoto?.status === "APPROVED"}
                                    >
                                        <Check className="w-4 h-4 mr-2" /> Approve POI
                                    </Button>
                                </div>
                                <Button variant="ghost" onClick={() => setIsFormDetailOpen(false)}>Close</Button>
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                            <FileText className="w-12 h-12 opacity-20" />
                            <p>No form data found for this photo.</p>
                            <Button variant="ghost" onClick={() => setIsFormDetailOpen(false)} className="mt-4">Close</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
