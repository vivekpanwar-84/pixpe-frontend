"use client";

import { useState } from "react";
import {
    FileText, Search, Filter, Eye, Clock,
    CheckCircle, XCircle, ChevronRight,
    ArrowLeft, Calendar, User, MapPin,
    Phone, Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useManager } from "@/hooks/useManager";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function FormsManagement() {
    const { useAllForms } = useManager();
    const { data: forms, isLoading } = useAllForms();
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const safeForms = Array.isArray(forms) ? forms : (forms?.data || []);
    const filteredForms = safeForms.filter((form: any) =>
        form.form_data?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.submitted_by?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Approved</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            case "PENDING":
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleViewDetails = (form: any) => {
        setSelectedForm(form);
        setIsDetailOpen(true);
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-6 bg-gray-50/50 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Forms Management</h1>
                    <p className="text-gray-500 text-sm">Review and manage business details submitted by editors.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by business name or editor..."
                                className="pl-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-all shadow-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2 border-gray-200 shadow-none">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-gray-100">
                                    <TableHead className="w-[300px] font-semibold text-gray-600">Business Name</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Submitted By</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Date</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredForms?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FileText className="w-12 h-12 mb-2 opacity-20" />
                                                <p>No forms found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredForms?.map((form: any) => (
                                        <TableRow
                                            key={form.id}
                                            className="group cursor-pointer hover:bg-blue-50/30 transition-colors border-gray-100"
                                            onClick={() => handleViewDetails(form)}
                                        >
                                            <TableCell>
                                                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {form.form_data?.business_name || "Untitled Business"}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate max-w-[250px]">
                                                    Form ID: {form.id.split('-')[0]}...
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                        {form.submitted_by?.name?.[0] || 'E'}
                                                    </div>
                                                    <span className="text-sm">{form.submitted_by?.name || "Unknown Editor"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(form.review_status)}</TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {format(new Date(form.created_at), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="group-hover:bg-blue-100/50 transition-colors">
                                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-blue-600 p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                {selectedForm?.form_type || "BUSINESS_DETAILS"}
                            </Badge>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-white">
                            {selectedForm?.form_data?.business_name || "Form Details"}
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Submitted on {selectedForm && format(new Date(selectedForm.created_at), "PPP p")}
                        </DialogDescription>
                    </div>

                    <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto bg-white">
                        {/* Business Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-3 h-3" /> Owner Name
                                    </label>
                                    <p className="text-gray-900 font-medium">{selectedForm?.form_data?.owner_name || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Phone className="w-3 h-3" /> Contact Phone
                                    </label>
                                    <p className="text-gray-900 font-medium">{selectedForm?.form_data?.phone || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Tag className="w-3 h-3" /> GST Number
                                    </label>
                                    <Badge variant="outline" className="font-mono text-blue-600 bg-blue-50 border-blue-100">
                                        {selectedForm?.form_data?.gst_number || "NOT_PROVIDED"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Operating Hours
                                    </label>
                                    <p className="text-gray-900 font-medium">{selectedForm?.form_data?.timings || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Days Open
                                    </label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedForm?.form_data?.days_open?.map((day: string) => (
                                            <Badge key={day} variant="secondary" className="text-[10px] py-0 px-1.5 bg-gray-100 text-gray-600 border-none font-medium">
                                                {day}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="pt-4 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {selectedForm?.form_data?.categories?.map((cat: string) => (
                                    <Badge key={cat} className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100 shadow-none">
                                        {cat}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Meta Info */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 mt-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AOI ID</label>
                                <p className="text-xs font-mono text-gray-500 truncate">{selectedForm?.aoi_id}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Submitted By</label>
                                <p className="text-xs text-gray-600">{selectedForm?.submitted_by?.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>Close</Button>
                        {selectedForm?.review_status === 'PENDING' && (
                            <Button className="bg-blue-600 hover:bg-blue-700">Accept and Push to Master</Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
