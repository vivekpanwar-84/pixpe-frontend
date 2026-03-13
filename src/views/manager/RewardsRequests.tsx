"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle,
    XCircle,
    Search,
    Eye,
    Loader2,
    Award,
    User,
    MapPin,
    Calendar,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { rewardService } from "@/services/reward.service";

export default function RewardsRequests() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Action state
    const [reviewNotes, setReviewNotes] = useState("");
    const [bonusAmount, setBonusAmount] = useState<number>(0);

    const fetchRequests = async () => {
        try {
            const data = await rewardService.getAllRewardRequests("PENDING");
            const safeData = Array.isArray(data) ? data : (data?.data || []);
            setRequests(safeData);
        } catch (error) {
            console.error("Error fetching reward requests:", error);
            toast.error("Failed to load reward requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (newStatus: "APPROVED" | "REJECTED") => {
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            await rewardService.updateRewardStatus(selectedRequest.id, {
                status: newStatus,
                review_notes: reviewNotes,
                bonus_amount: bonusAmount,
                // payment_method and payment_reference are skipped as per user requirement (Redeem system)
            });

            toast.success(`Request ${newStatus.toLowerCase()} successfully`);
            setIsApproveDialogOpen(false);
            setIsRejectDialogOpen(false);
            setReviewNotes("");
            setBonusAmount(0);
            fetchRequests();
        } catch (error) {
            console.error("Error updating reward status:", error);
            toast.error("Failed to update status");
        } finally {
            setActionLoading(false);
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold mb-1">Rewards Management</h1>
                    <p className="text-gray-600">Review and approve payout requests from surveyors</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">Pending: {requests.length}</span>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white rounded-[24px] overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-4">
                    <CardTitle className="text-lg">Pending Requests</CardTitle>
                    <CardDescription>Surveyors requesting Pixpoints for their completed AOIs.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {requests.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-semibold uppercase text-[10px] tracking-widest">No pending requests</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-gray-100">
                                        <TableHead className="py-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest pl-6">Surveyor</TableHead>
                                        <TableHead className="py-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">AOI Details</TableHead>
                                        <TableHead className="py-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest text-center">Submission</TableHead>
                                        <TableHead className="py-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest text-center">Amount</TableHead>
                                        <TableHead className="py-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((req) => (
                                        <TableRow key={req.id} className="group border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                                                        {req.user?.name ? req.user.name.charAt(0) : 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{req.user?.name || 'Surveyor'}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">#{req.user_id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">{req.aoi?.aoi_name || 'N/A'}</p>
                                                <p className="text-[10px] text-gray-400 font-mono font-medium">{req.aoi?.aoi_code || '-'}</p>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-xs font-bold text-gray-900">{req.total_photos_approved} / {req.total_photos_submitted}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Approved Photos</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <p className="text-xs font-bold text-blue-600">₹{req.reward_amount}</p>
                                                <p className="text-[9px] text-gray-400 font-medium font-mono">₹{req.reward_per_photo}/Photo</p>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                        onClick={() => {
                                                            setSelectedRequest(req);
                                                            setIsRejectDialogOpen(true);
                                                        }}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-100"
                                                        onClick={() => {
                                                            setSelectedRequest(req);
                                                            setIsApproveDialogOpen(true);
                                                        }}
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approval Dialog */}
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent className="rounded-[28px] max-w-md border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                            Confirm Approval
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium pt-2">
                            You are approving the payout for <span className="text-gray-900 font-bold uppercase tracking-tight">{selectedRequest?.aoi?.aoi_name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Base Reward</p>
                                <p className="text-lg font-bold text-gray-900">₹{selectedRequest?.reward_amount}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Approved Photos</p>
                                <p className="text-lg font-bold text-gray-900">{selectedRequest?.total_photos_approved}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Bonus Pixpoints (Optional)</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</div>
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="0.00"
                                    className="pl-7 rounded-xl border-gray-100 bg-gray-50/30 font-bold text-emerald-600 h-11"
                                    value={bonusAmount}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setBonusAmount(val < 0 ? 0 : val);
                                    }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">Extra points for high quality or early submission.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Review Notes</Label>
                            <Textarea
                                placeholder="Great job on this AOI!..."
                                className="rounded-xl border-gray-100 bg-gray-50/30 min-h-[100px] text-xs font-medium resize-none shadow-inner"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                            />
                        </div>

                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                            <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                                Approving this will credit <span className="font-bold underline">₹{(Number(selectedRequest?.reward_amount || 0) + bonusAmount).toFixed(2)} Pixpoints</span> to the surveyor's account.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 font-bold">
                        <Button variant="ghost" className="rounded-xl flex-1 text-gray-400 uppercase tracking-widest text-[10px]" onClick={() => setIsApproveDialogOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex-1 uppercase tracking-widest text-[10px] h-11 shadow-lg shadow-emerald-100"
                            onClick={() => handleAction("APPROVED")}
                            disabled={actionLoading}
                        >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Confirm & Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="rounded-[28px] max-w-md border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <XCircle className="w-6 h-6 text-rose-500" />
                            Reject Request
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium pt-2">
                            Please specify why this request is being rejected. The surveyor will see this note.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Rejection Reason</Label>
                            <Textarea
                                placeholder="e.g., Photos missing required shop signboards..."
                                className="rounded-xl border-gray-100 bg-gray-50/30 min-h-[120px] text-xs font-medium resize-none"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 font-bold">
                        <Button variant="ghost" className="rounded-xl flex-1 text-gray-400 uppercase tracking-widest text-[10px]" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            className="rounded-xl flex-1 uppercase tracking-widest text-[10px] h-11 shadow-lg shadow-rose-100"
                            onClick={() => handleAction("REJECTED")}
                            disabled={actionLoading || !reviewNotes.trim()}
                        >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            Reject Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
