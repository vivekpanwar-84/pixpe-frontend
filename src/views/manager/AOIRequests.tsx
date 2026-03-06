"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { managerService } from "@/services/manager.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock, MapPin, User, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AOIRequests() {
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
    const [managerNotes, setManagerNotes] = useState("");

    const { data: requests, isLoading, error } = useQuery({
        queryKey: ["pending-aoi-requests"],
        queryFn: managerService.getPendingAoiRequests,
    });

    const respondMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => managerService.respondToAoiRequest(id, data),
        onSuccess: () => {
            toast.success(`Request ${actionType?.toLowerCase()} successfully`);
            queryClient.invalidateQueries({ queryKey: ["pending-aoi-requests"] });
            queryClient.invalidateQueries({ queryKey: ["all-aois"] }); // To show updated assignment in AOI Management
            handleCloseDialog();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to process request");
        }
    });

    const handleOpenDialog = (request: any, type: 'APPROVED' | 'REJECTED') => {
        setSelectedRequest(request);
        setActionType(type);
        setManagerNotes("");
    };

    const handleCloseDialog = () => {
        setSelectedRequest(null);
        setActionType(null);
        setManagerNotes("");
    };

    const handleSubmit = () => {
        if (!selectedRequest || !actionType) return;
        respondMutation.mutate({
            id: selectedRequest.id,
            data: {
                status: actionType,
                manager_notes: managerNotes
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Failed to load requests</h3>
                <p className="text-gray-500">Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-1">AOI Assignment Requests</h1>
                <p className="text-gray-600">Review and respond to surveyors requesting area assignments.</p>
            </div>

            <div className="grid gap-4">
                {requests?.length === 0 ? (
                    <Card className="border-dashed py-12">
                        <CardContent className="flex flex-col items-center justify-center">
                            <Clock className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No pending requests at the moment.</p>
                        </CardContent>
                    </Card>
                ) : (
                    requests?.map((request: any) => (
                        <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="flex-1 p-6 space-y-4">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-5 h-5 text-blue-600" />
                                                    <h3 className="text-lg font-bold">{request.aoi?.aoi_name}</h3>
                                                    <Badge variant="outline" className={request.request_type === 'REOPEN' ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"}>
                                                        {request.request_type || 'ASSIGNMENT'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Badge variant="secondary" className="font-mono">{request.aoi?.aoi_code}</Badge>
                                                    <span>•</span>
                                                    <span>{request.aoi?.city}, {request.aoi?.state}</span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                PENDING REVIEW
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Surveyor Details</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {request.surveyor?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{request.surveyor?.name}</p>
                                                        <p className="text-xs text-gray-500">{request.surveyor?.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Request Meta</p>
                                                <div className="space-y-1">
                                                    <p className="text-sm flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {format(new Date(request.created_at), 'PPPp')}
                                                    </p>
                                                    {request.request_notes && (
                                                        <p className="text-xs text-gray-600 italic">"{request.request_notes}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 flex flex-row md:flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-200 min-w-[180px]">
                                        <Button
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
                                            onClick={() => handleOpenDialog(request, 'APPROVED')}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-200 text-red-600 hover:bg-red-50 h-11"
                                            onClick={() => handleOpenDialog(request, 'REJECTED')}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Response Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={handleCloseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'APPROVED' ? 'Approve' : 'Reject'} Request
                        </DialogTitle>
                        <DialogDescription>
                            Confirming {actionType?.toLowerCase()} for {selectedRequest?.surveyor?.name} on {selectedRequest?.aoi?.aoi_name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="notes">Manager Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder={`Add some context for the ${actionType?.toLowerCase()}...`}
                                value={managerNotes}
                                onChange={(e) => setManagerNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            Cancel
                        </Button>
                        <Button
                            className={actionType === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                            onClick={handleSubmit}
                            disabled={respondMutation.isPending}
                        >
                            {respondMutation.isPending ? "Processing..." : `Confirm ${actionType === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
