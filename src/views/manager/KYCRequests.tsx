"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Search, Eye, Download, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { managerService } from "@/services/manager.service";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function KYCRequests() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState<"APPROVED" | "REJECTED" | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchRequests = async () => {
        try {
            const data = await managerService.getKycPending();
            setRequests(data);
        } catch (error) {
            console.error("Error fetching KYC requests:", error);
            toast.error("Failed to load KYC requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusChange = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
        if (newStatus === "REJECTED" && !rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setActionLoading(newStatus);
        try {
            await managerService.updateKycStatus(id, newStatus, newStatus === "REJECTED" ? rejectionReason : undefined);
            toast.success(`KYC request ${newStatus.toLowerCase()} successfully`);
            setIsViewDialogOpen(false);
            setRejectionReason(""); // Reset reason
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error("Error updating KYC status:", error);
            toast.error("Failed to update KYC status");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-1">KYC Requests</h1>
                <p className="text-gray-600">Review and manage surveyor identity verifications</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Review the documents below to verify surveyor identities.</CardDescription>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No pending requests.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Surveyor</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{req.name}</div>
                                                <div className="text-xs text-gray-500">{req.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(req.updatedAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                {req.kyc_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => { setSelectedRequest(req); setIsViewDialogOpen(true); }}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Review KYC Document</DialogTitle>
                        <DialogDescription>
                            Verify the identity document for {selectedRequest?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-sm mb-1">Applicant Details</h4>
                                    <div className="text-sm">
                                        <p><span className="text-gray-500">Name:</span> {selectedRequest.name}</p>
                                        <p><span className="text-gray-500">Email:</span> {selectedRequest.email}</p>
                                        <p><span className="text-gray-500">Submitted:</span> {new Date(selectedRequest.updatedAt).toLocaleDateString()}</p>
                                        <p><span className="text-gray-500">User Status:</span>
                                            <span className={`ml-1 font-medium ${selectedRequest.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedRequest.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm mb-1">Document Status</h4>
                                    <Badge
                                        variant="outline"
                                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                    >
                                        {selectedRequest.kyc_status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="border rounded-lg p-2 bg-gray-50 flex items-center justify-center min-h-[200px]">
                                {selectedRequest.kyc_document_url ? (
                                    <img
                                        src={selectedRequest.kyc_document_url}
                                        alt="KYC Document"
                                        className="max-h-[300px] object-contain cursor-zoom-in"
                                        onClick={() => window.open(selectedRequest.kyc_document_url, '_blank')}
                                    />
                                ) : (
                                    <div className="text-center">
                                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">No document image available</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Rejection Reason (Required for rejection)</Label>
                                <Input
                                    id="reason"
                                    placeholder="e.g. Blurred photo, wrong ID type..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-4">
                        <Button
                            variant="destructive"
                            className="flex-1"
                            disabled={!!actionLoading}
                            onClick={() => selectedRequest && handleStatusChange(selectedRequest.id, "REJECTED")}
                        >
                            {actionLoading === "REJECTED" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            Reject
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 flex-1"
                            disabled={!!actionLoading}
                            onClick={() => selectedRequest && handleStatusChange(selectedRequest.id, "APPROVED")}
                        >
                            {actionLoading === "APPROVED" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
