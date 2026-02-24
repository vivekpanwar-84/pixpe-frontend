"use client";

import { Camera, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

interface ConfirmAddPhotoModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending: boolean;
}

export function ConfirmAddPhotoModal({
    isOpen,
    onOpenChange,
    onConfirm,
    isPending
}: ConfirmAddPhotoModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-600" />
                        Capture New POI Photo
                    </DialogTitle>
                    <DialogDescription>
                        This will create a new Point of Interest session.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                        <p className="text-sm text-blue-800">
                            Confirm to open the camera and start capturing photos for a new POI. You can add business details later.
                        </p>
                    </div>
                </div>
                <DialogFooter className="flex sm:justify-between items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="flex-1 sm:flex-none"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Opening...
                            </>
                        ) : (
                            "Confirm & Start"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
