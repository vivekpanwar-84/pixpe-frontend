"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const rejectionSchema = z.object({
    reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type RejectionFormData = z.infer<typeof rejectionSchema>;

interface RejectionModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    onConfirm: (reason: string) => void;
    isPending: boolean;
}

export function RejectionModal({
    isOpen,
    onOpenChange,
    title,
    onConfirm,
    isPending,
}: RejectionModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RejectionFormData>({
        resolver: zodResolver(rejectionSchema),
        defaultValues: {
            reason: "",
        },
    });

    const onSubmit = (data: RejectionFormData) => {
        onConfirm(data.reason);
        reset();
    };

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
        if (!open) reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason">Reason for rejection</Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="e.g. Blurry photo, incorrect angle, wrong business..."
                                {...register("reason")}
                                rows={4}
                                className={errors.reason ? "border-red-500" : ""}
                            />
                            {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? "Rejecting..." : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
