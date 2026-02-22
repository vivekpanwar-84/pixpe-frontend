"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface StatusRestrictionModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    status: string;
}

export function StatusRestrictionModal({
    isOpen,
    onOpenChange,
    status
}: StatusRestrictionModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        AOI {status?.replace("_", " ")}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-600">
                        This Area of Interest (AOI) is already <strong>{status?.replace("_", " ")}</strong>. You cannot add new Points of Interest (POIs) to this area.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
