"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Search, Eye, Download, FileText, Loader2, Users, Camera } from "lucide-react";
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

import { ImageWithLoader } from "@/components/ImageWithLoader";

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
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                console.log("DEBUG: Selected KYC Request Data:", req);
                                                setSelectedRequest(req);
                                                setIsViewDialogOpen(true);
                                            }}>
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
                <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review KYC Submission</DialogTitle>
                        <DialogDescription>
                            Detailed background and identity verification for {selectedRequest?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-8 py-4">
                            {/* Personal & Document Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Personal Details Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Personal Details</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                        <div>
                                            <p className="text-gray-400 text-xs">Full Name</p>
                                            <p className="font-medium">{selectedRequest.kyc_document?.full_name || selectedRequest.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">Date of Birth</p>
                                            <p className="font-medium">{selectedRequest.kyc_document?.date_of_birth ? format(new Date(selectedRequest.kyc_document.date_of_birth), "PPP") : "N/A"}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-400 text-xs">Address</p>
                                            <p className="font-medium">{selectedRequest.kyc_document?.address || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">City / State</p>
                                            <p className="font-medium">{selectedRequest.kyc_document?.city || "N/A"}, {selectedRequest.kyc_document?.state || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">Pin Code</p>
                                            <p className="font-medium">{selectedRequest.kyc_document?.pin_code || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Identity & Bank Info Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <FileText className="w-4 h-4 text-purple-500" />
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Document & Bank Details</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                        <div>
                                            <p className="text-gray-400 text-xs">ID Type</p>
                                            <Badge variant="secondary" className="mt-1">{selectedRequest.kyc_document?.document_type || "N/A"}</Badge>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">ID Number</p>
                                            <p className="font-medium tracking-wider">{selectedRequest.kyc_document?.document_number || "N/A"}</p>
                                        </div>
                                        <div className="col-span-2 pt-2 border-t mt-1">
                                            <p className="text-gray-400 text-xs">Bank Account Number</p>
                                            <p className="font-medium">{selectedRequest.kyc_document?.bank_account_number || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">IFSC Code</p>
                                            <p className="font-medium">{selectedRequest.kyc_document?.ifsc_code || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">Submission Date</p>
                                            <p className="font-medium">{new Date(selectedRequest.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Image Grid */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <Camera className="w-4 h-4 text-green-500" />
                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Uploaded Documents</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: "ID Front", url: selectedRequest.kyc_document?.document_front_url || selectedRequest.kyc_document_url },
                                        { label: "ID Back", url: selectedRequest.kyc_document?.document_back_url },
                                        { label: "Selfie", url: selectedRequest.kyc_document?.selfie_url },
                                        { label: "Bank Proof", url: selectedRequest.kyc_document?.bank_proof_url }
                                    ].map((img, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase text-center">{img.label}</p>
                                            <div className="aspect-square border rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden group relative shadow-sm hover:shadow-md transition-all duration-300">
                                                {img.url ? (
                                                    <ImageWithLoader
                                                        src={img.url}
                                                        alt={img.label}
                                                    />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <FileText className="w-8 h-8 text-gray-200 mx-auto mb-1" />
                                                        <p className="text-[10px] text-gray-400">Not Uploaded</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-l-4 border-yellow-500 pl-4 bg-yellow-50/50 p-4 rounded-r-lg">
                                <Label htmlFor="reason" className="text-yellow-800 font-semibold">Review Actions</Label>
                                <p className="text-xs text-yellow-700/70 mb-2 italic">If rejecting, please specify the exact issue (e.g., "Aadhaar back image is blurry")</p>
                                <Input
                                    id="reason"
                                    placeholder="Enter rejection reason here..."
                                    className="bg-white border-yellow-200 focus-visible:ring-yellow-500"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t mt-4">
                        <Button
                            variant="outline"
                            className="sm:order-1 order-3 text-gray-500"
                            onClick={() => setIsViewDialogOpen(false)}
                            disabled={!!actionLoading}
                        >
                            Cancel Review
                        </Button>
                        <Button
                            variant="destructive"
                            className="sm:order-2 order-2 flex-1"
                            disabled={!!actionLoading}
                            onClick={() => selectedRequest && handleStatusChange(selectedRequest.id, "REJECTED")}
                        >
                            {actionLoading === "REJECTED" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            Reject Submission
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 sm:order-3 order-1 flex-1 shadow-lg shadow-green-100"
                            disabled={!!actionLoading}
                            onClick={() => selectedRequest && handleStatusChange(selectedRequest.id, "APPROVED")}
                        >
                            {actionLoading === "APPROVED" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Approve Verification
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
