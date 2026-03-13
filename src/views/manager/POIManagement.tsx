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
import { ImageWithLoader } from "@/components/ImageWithLoader";

interface POIManagementProps {
    aoiId?: string;
}

export default function POIManagement({ aoiId }: POIManagementProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const { useAllPhotos, assignPhoto, updatePhotoStatus } = useManager();
    const { useAllUsers } = useAdmin();
    const { data: photosPaginated, isLoading: photosLoading } = useAllPhotos({ aoiId, page, limit, search: searchQuery });
    const { data: usersPaginated } = useAllUsers("editor");
    const editors = usersPaginated?.data || usersPaginated || [];

    const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
    const [selectedEditor, setSelectedEditor] = useState<string>("");
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
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

    const photosList = photosPaginated?.data || photosPaginated || [];
    const totalPhotos = photosPaginated?.total || 0;

    const filteredPhotos = photosList.filter((photo: any) => {
        const matchesAoi = !aoiId || photo.aoi_id === aoiId;
        return matchesAoi;
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
                                <ImageWithLoader
                                    src={photo.photo_url}
                                    alt="POI"
                                    className="w-full h-full"
                                />
                                <div className="absolute top-3 right-3 z-20">
                                    <Badge className={`${getStatusColor(photo.status)} border shadow-sm`}>
                                        {photo.status}
                                    </Badge>
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
                                    className="relative w-24 h-24 md:w-32 md:h-24 flex-shrink-0 rounded-md overflow-hidden"
                                >
                                    <ImageWithLoader
                                        src={photo.photo_url}
                                        alt="POI"
                                    />
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

            {/* Pagination Controls */}
            {totalPhotos > limit && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-500">
                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalPhotos)} of {totalPhotos} photos
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </Button>
                        <div className="text-sm font-medium px-2">
                            Page {page} of {Math.ceil(totalPhotos / limit)}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= Math.ceil(totalPhotos / limit)}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
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
                            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3 text-sm border border-gray-100 overflow-hidden">
                                <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                                    <ImageWithLoader
                                        src={selectedPhoto.photo_url}
                                        alt="Preview"
                                        showViewFull={false}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{selectedPhoto.photo_type}</p>
                                    <p className="text-gray-500 truncate text-xs">Uploaded by {selectedPhoto.uploaded_by?.name}</p>
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
                            <div className="p-3 bg-red-50 rounded-lg flex items-center gap-3 text-sm border border-red-100 overflow-hidden">
                                <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                                    <ImageWithLoader
                                        src={selectedPhoto.photo_url}
                                        alt="Preview"
                                        showViewFull={false}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-red-900 truncate">{selectedPhoto.photo_type}</p>
                                    <p className="text-red-700 opacity-70 truncate text-xs">Uploaded by {selectedPhoto.uploaded_by?.name}</p>
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
                <DialogContent className="sm:max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl md:h-[80vh] flex flex-col">
                    {selectedForm ? (() => {
                        // Handle potential nesting: photo.form.form (PoiForm relation) vs flattened data
                        const displayForm = selectedForm.form || selectedForm;
                        const formData = displayForm.form_data || {};

                        // Extracting values with fallbacks for both top-level and form_data properties
                        const businessName = displayForm.business_name || formData.business_name || "Business Details";
                        const businessCategory = displayForm.business_category || formData.business_category || 'Business Entity';
                        const businessSubCategory = displayForm.business_sub_category || formData.business_sub_category;
                        const contactName = displayForm.contact_person_name || formData.contact_person_name || formData.owner_name || 'N/A';
                        const contactDesignation = displayForm.contact_person_designation || formData.contact_person_designation || '';
                        const phone = displayForm.phone || formData.phone || 'N/A';
                        const altPhone = displayForm.alternate_phone || formData.alternate_phone;
                        const address1 = displayForm.address_line1 || formData.address_line1;
                        const address2 = displayForm.address_line2 || formData.address_line2;
                        const landmark = displayForm.landmark || formData.landmark;
                        const city = displayForm.city || formData.city;
                        const state = displayForm.state || formData.state;
                        const pinCode = displayForm.pin_code || formData.pin_code;
                        const email = displayForm.email || formData.email;
                        const website = displayForm.website || formData.website;

                        return (
                            <div className="flex flex-col md:flex-row h-full overflow-hidden">
                                {/* Photo Section */}
                                <div className="md:w-3/5 bg-slate-900 relative min-h-[300px] md:min-h-0 flex items-center justify-center">
                                    {selectedPhoto?.photo_url ? (
                                        <div className="absolute inset-0 p-4">
                                            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm group">
                                                <ImageWithLoader
                                                    src={selectedPhoto.photo_url}
                                                    alt="POI Business"
                                                    objectFit="contain"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />
                                                <div className="absolute bottom-4 left-4 right-4 text-white text-left z-20">
                                                    <Badge className="mb-2 bg-blue-600/80 backdrop-blur-md border-none text-[10px] uppercase font-bold tracking-wider">
                                                        {selectedPhoto.photo_type?.replace('_', ' ') || 'POI Photo'}
                                                    </Badge>
                                                    <div className="flex items-center gap-1.5 text-xs text-blue-100">
                                                        <MapPin className="w-3 h-3" />
                                                        {selectedPhoto.latitude}, {selectedPhoto.longitude}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Camera className="w-12 h-12 opacity-20" />
                                            <p className="text-sm">No photo available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Details Section */}
                                <div className="md:w-2/5 flex flex-col bg-white overflow-hidden border-l border-gray-100">
                                    <div className="p-6 bg-white border-b border-gray-50 text-left">
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="outline" className="border-blue-100 bg-blue-50 text-blue-600 text-[10px] uppercase font-bold px-2 py-0.5">
                                                {businessCategory}
                                            </Badge>
                                            <Badge variant="outline" className={`${displayForm.verification_status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'} text-[10px] font-bold`}>
                                                {displayForm.verification_status || 'PENDING'}
                                            </Badge>
                                        </div>
                                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                            {businessName}
                                        </DialogTitle>
                                        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            Last Updated: {displayForm.updated_at ? format(new Date(displayForm.updated_at), "PPP p") : "N/A"}
                                        </p>
                                    </div>

                                    <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left custom-scrollbar">
                                        {/* Sub Category */}
                                        {businessSubCategory && (
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.1em] block">Offerings / Sub-Category</label>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium capitalize">
                                                    {businessSubCategory}
                                                </p>
                                            </div>
                                        )}

                                        {/* Contact Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.1em] flex items-center gap-1.5">
                                                    <Users className="w-3 h-3 text-blue-500" /> Contact Person
                                                </label>
                                                <p className="text-sm text-gray-800 font-semibold truncate">
                                                    {contactName}
                                                </p>
                                                {contactDesignation && (
                                                    <p className="text-[10px] text-gray-500 font-medium">
                                                        {contactDesignation}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.1em] flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-green-500" /> Phone Numbers
                                                </label>
                                                <p className="text-sm text-gray-800 font-semibold">
                                                    {phone}
                                                </p>
                                                <p className="text-[10px] font-medium">
                                                    <span className="text-gray-400">Alt: </span>
                                                    <span className={altPhone && altPhone !== "Not Provided" ? "text-gray-500" : "text-gray-300 italic"}>
                                                        {altPhone || "Not Provided"}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Address Info */}
                                        <div className="space-y-3 pt-4 border-t border-gray-50">
                                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.1em] flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3 text-red-500" /> Complete Address
                                            </label>
                                            {(address1 || city) ? (
                                                <div className="space-y-1.5 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                                        {address1}
                                                        {address2 && (
                                                            <span className={address2 === "Not Provided" ? "text-gray-300 italic text-xs ml-1" : ""}>
                                                                , {address2}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500 font-medium">
                                                        {landmark && (
                                                            <span className={landmark === "Not Provided" ? "text-gray-300 italic" : ""}>
                                                                {landmark === "Not Provided" ? "No Landmark" : `Near ${landmark}`} •{" "}
                                                            </span>
                                                        )}
                                                        <span>{city || "N/A"}, {state || "N/A"} - {pinCode || "N/A"}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No address provided</p>
                                            )}
                                        </div>

                                        {/* Other Details */}
                                        <div className="grid grid-cols-2 gap-4 pb-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.1em]">Email</label>
                                                {email && email !== 'Not Provided' ? (
                                                    <p className="text-xs text-blue-600 font-medium truncate underline">
                                                        {email}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-300 italic">Not Provided</p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.1em]">Website</label>
                                                {website && website !== 'Not Provided' ? (
                                                    <p className="text-xs text-blue-600 font-medium truncate underline">
                                                        {website}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-300 italic">Not Provided</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white px-6 py-4 flex items-center justify-between gap-3 border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                className="h-9 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold text-xs"
                                                onClick={() => {
                                                    setIsFormDetailOpen(false);
                                                    setIsRejectModalOpen(true);
                                                }}
                                                disabled={selectedPhoto?.status === "REJECTED"}
                                            >
                                                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                                            </Button>
                                            <Button
                                                className="h-9 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs shadow-sm"
                                                onClick={() => {
                                                    handleApprove(selectedPhoto);
                                                    setIsFormDetailOpen(false);
                                                }}
                                                disabled={selectedPhoto?.status === "APPROVED"}
                                            >
                                                <Check className="w-3.5 h-3.5 mr-1.5" /> Approve
                                            </Button>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setIsFormDetailOpen(false)} className="text-gray-400 hover:text-gray-600 font-medium h-9">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })() : (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                            <FileText className="w-12 h-12 opacity-20" />
                            <p className="font-medium">No form data found for this photo.</p>
                            <Button variant="outline" onClick={() => setIsFormDetailOpen(false)} className="mt-4 px-8">Close</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
