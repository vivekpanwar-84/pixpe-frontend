"use client";

import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const poiSchema = z.object({
    businessName: z.string().min(2, "Business name must be at least 2 characters"),
});

type PoiFormData = z.infer<typeof poiSchema>;

interface AddPoiModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isLocating: boolean;
    location: { lat: number; lng: number } | null;
    startTracking: () => void;
    handleCreatePoi: (businessName: string) => void;
    isPending: boolean;
}

export function AddPoiModal({
    isOpen,
    onOpenChange,
    isLocating,
    location,
    startTracking,
    handleCreatePoi,
    isPending
}: AddPoiModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PoiFormData>({
        resolver: zodResolver(poiSchema),
        defaultValues: {
            businessName: "",
        },
    });

    const onSubmit = (data: PoiFormData) => {
        handleCreatePoi(data.businessName);
        reset();
    };
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New POI</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="business_name">Business Name</Label>
                            <Input
                                id="business_name"
                                placeholder="Enter business name"
                                {...register("businessName")}
                                className={errors.businessName ? "border-red-500" : ""}
                            />
                            {errors.businessName && <p className="text-xs text-red-500">{errors.businessName.message}</p>}
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Location Status</span>
                                {isLocating ? (
                                    <Badge variant="outline" className="animate-pulse">Locating...</Badge>
                                ) : location ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Locked</Badge>
                                ) : (
                                    <Badge variant="destructive">Not Set</Badge>
                                )}
                            </div>
                            {location && (
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-mono">
                                    <div>Lat: {location.lat.toFixed(6)}</div>
                                    <div>Lng: {location.lng.toFixed(6)}</div>
                                </div>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={startTracking}
                                disabled={isLocating}
                            >
                                <MapPin className="w-3 h-3 mr-1" />
                                Refresh Location
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => { onOpenChange(false); reset(); }}>Cancel</Button>
                        <Button type="submit" disabled={isPending || isLocating}>
                            {isPending ? "Adding..." : "Add POI"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
