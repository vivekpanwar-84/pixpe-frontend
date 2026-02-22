"use client";
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, UserPlus, User, Image as ImageIcon, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/components/ui/utils";
import { useManager } from "@/hooks/useManager";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";
import { RejectionModal } from "@/components/modals/RejectionModal";

export default function POIManagement() {
    const { useAllPhotos, assignPhoto, updatePhotoStatus } = useManager();
    const { useAllUsers } = useAdmin();

    const { data: photosData, isLoading: isLoadingPhotos } = useAllPhotos();
    const { data: usersData, isLoading: isLoadingUsers } = useAllUsers();

    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedAssignPhoto, setSelectedAssignPhoto] = useState<string | null>(null);
    const [selectedAssignEditor, setSelectedAssignEditor] = useState<string | null>(null);
    const [openAssignPhoto, setOpenAssignPhoto] = useState(false);
    const [openAssignEditor, setOpenAssignEditor] = useState(false);

    // Verification/Rejection State
    const [rejectingPhotoId, setRejectingPhotoId] = useState<string | null>(null);

    const editors = useMemo(() => {
        return (usersData || [])
            .filter((u: any) => {
                const role = typeof u.role === 'string' ? u.role : u.role?.slug;
                return role?.toLowerCase() === 'editor';
            })
            .map((u: any) => ({ value: u.id, label: u.name }));
    }, [usersData]);

    const photosList = useMemo(() => photosData || [], [photosData]);

    const handleAssignPhoto = () => {
        if (!selectedAssignPhoto || !selectedAssignEditor) return;

        assignPhoto.mutate(
            { id: selectedAssignPhoto, editorId: selectedAssignEditor },
            {
                onSuccess: () => {
                    toast.success("Editor assigned to photo successfully");
                    setIsAssignDialogOpen(false);
                    setSelectedAssignPhoto(null);
                    setSelectedAssignEditor(null);
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || "Assignment failed");
                },
            }
        );
    };

    const handleVerifyPoi = (photoId: string) => {
        if (!photoId) return;
        updatePhotoStatus.mutate(
            { id: photoId, data: { status: "VERIFIED" } },
            {
                onSuccess: () => {
                    toast.success("Photo verified successfully");
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || "Verification failed");
                },
            }
        );
    };

    const handleRejectPoi = (reason: string) => {
        if (!rejectingPhotoId) return;

        updatePhotoStatus.mutate(
            {
                id: rejectingPhotoId,
                data: { status: "REJECTED", rejection_reason: reason },
            },
            {
                onSuccess: () => {
                    toast.success("Photo rejected successfully");
                    setRejectingPhotoId(null);
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || "Rejection failed");
                },
            }
        );
    };

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold mb-1">POI Management</h1>
                    <p className="text-gray-600">Assign editors to review photos and verify business data</p>
                </div>
                <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign Photo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Assign Editor to Photo</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 flex flex-col gap-6 pt-4">
                            {/* Photo Selection */}
                            <div className="space-y-2">
                                <Label>Select Photo (Business)</Label>
                                <Popover open={openAssignPhoto} onOpenChange={setOpenAssignPhoto}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openAssignPhoto}
                                            className="w-full justify-between"
                                        >
                                            {selectedAssignPhoto
                                                ? photosList.find((p: any) => p.id === selectedAssignPhoto)?.poi?.business_name || "Untitled Photo"
                                                : "Select Photo..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search photo/business..." />
                                            <CommandList>
                                                <CommandEmpty>No photo found.</CommandEmpty>
                                                <CommandGroup>
                                                    {photosList.map((photo: any) => (
                                                        <CommandItem
                                                            key={photo.id}
                                                            value={`${photo.poi?.business_name} ${photo.photo_type}`}
                                                            onSelect={() => {
                                                                setSelectedAssignPhoto(photo.id === selectedAssignPhoto ? null : photo.id);
                                                                setOpenAssignPhoto(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedAssignPhoto === photo.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <span className="truncate">
                                                                {photo.poi?.business_name || "Untitled"} - {photo.photo_type}
                                                            </span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Editor Selection */}
                            <div className="space-y-2">
                                <Label>Select Editor</Label>
                                <Popover open={openAssignEditor} onOpenChange={setOpenAssignEditor}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openAssignEditor}
                                            className="w-full justify-between"
                                        >
                                            {selectedAssignEditor
                                                ? editors.find((e: any) => e.value === selectedAssignEditor)?.label
                                                : "Select editor..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search editor..." />
                                            <CommandList>
                                                <CommandEmpty>No editor found.</CommandEmpty>
                                                <CommandGroup>
                                                    {editors.map((editor: any) => (
                                                        <CommandItem
                                                            key={editor.value}
                                                            value={editor.label}
                                                            onSelect={() => {
                                                                setSelectedAssignEditor(
                                                                    editor.value === selectedAssignEditor ? null : editor.value
                                                                );
                                                                setOpenAssignEditor(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedAssignEditor === editor.value ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {editor.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={!selectedAssignPhoto || !selectedAssignEditor || assignPhoto.isPending}
                                onClick={handleAssignPhoto}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                {assignPhoto.isPending ? "Assigning..." : "Confirm Assignment"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {isLoadingPhotos ? (
                    [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)
                ) : photosList.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>No photos found for review.</p>
                        </CardContent>
                    </Card>
                ) : (
                    photosList.map((photo: any) => (
                        <Card key={photo.id} className="hover:border-blue-200 transition-colors">
                            <CardContent className="p-4 lg:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        {/* Photo Thumbnail */}
                                        <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden border border-gray-100 shrink-0">
                                            {photo.photo_url ? (
                                                <ImageWithSkeleton src={photo.photo_url} alt={photo.photo_type} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg truncate">
                                                    {photo.poi?.business_name || "Untitled Photo"}
                                                </h3>
                                                <Badge variant="secondary" className="text-[10px] h-4">
                                                    {photo.photo_type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3.5 h-3.5" />
                                                    {photo.uploaded_by?.name || "Unknown Surveyor"}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant={photo.status === 'ASSIGNED' ? 'default' : 'secondary'} className="text-[10px] h-4 leading-none">
                                                        {photo.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedAssignPhoto(photo.id);
                                                setIsAssignDialogOpen(true);
                                            }}
                                            className="ml-auto lg:ml-0"
                                        >
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            {photo.assigned_to ? "Re-assign" : "Assign"}
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleVerifyPoi(photo.id)}
                                                    className="text-green-600 focus:text-green-600"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Verify POI
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setRejectingPhotoId(photo.id);
                                                    }}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject POI
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <RejectionModal
                isOpen={!!rejectingPhotoId}
                onOpenChange={(open) => !open && setRejectingPhotoId(null)}
                title="Reject Photo"
                onConfirm={handleRejectPoi}
                isPending={updatePhotoStatus.isPending}
            />
        </div>
    );
}
