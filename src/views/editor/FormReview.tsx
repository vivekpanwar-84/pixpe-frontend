"use client";

import { useEditor } from "@/hooks/useEditor";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    MapPin,
    Image as ImageIcon,
    ChevronDown,
    ChevronUp,
    FileText,
    Eye,
    Download,
    Calendar,
    Filter,
    CheckSquare,
    Square,
    XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ImageWithLoader } from "@/components/ImageWithLoader";

function ReportDetailDialog({ form, isOpen, onClose }: { form: any, isOpen: boolean, onClose: () => void }) {
    if (!form) return null;
    const formData = form.form || {};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl md:h-[80vh] flex flex-col">
                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* Photo Section */}
                    <div className="md:w-3/5 bg-slate-900 relative min-h-[300px] md:min-h-0 flex items-center justify-center">
                        {form.photo?.photo_url ? (
                            <div className="absolute inset-0 p-4">
                                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm">
                                    <ImageWithLoader
                                        src={form.photo.photo_url}
                                        alt="POI Business"
                                        objectFit="contain"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white text-left z-20">
                                        <Badge className="mb-2 bg-blue-600/80 backdrop-blur-md border-none text-[10px] uppercase font-bold tracking-wider">
                                            {form.photo.photo_type?.replace('_', ' ') || 'POI Photo'}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-xs text-blue-100">
                                            <MapPin className="w-3 h-3" />
                                            {form.photo.latitude}, {form.photo.longitude}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400 opacity-20">
                                <ImageIcon className="w-12 h-12" />
                                <p className="text-sm">No photo available</p>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="md:w-2/5 flex flex-col bg-white overflow-hidden border-l border-gray-100">
                        <DialogHeader className="p-6 border-b bg-white shrink-0">
                            <div className="flex flex-col gap-2 text-left">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-blue-100 text-blue-600 bg-blue-50/50">
                                        {formData.business_category || "General"}
                                    </Badge>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                                        #{form.id.slice(0, 8)}
                                    </span>
                                </div>
                                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    {formData.business_name || "Untitled Business"}
                                </DialogTitle>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Business Profile */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Business Profile</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Sub-Category" value={formData.business_sub_category} />
                                    <DetailItem label="Contact Person" value={formData.contact_person_name} />
                                    <DetailItem label="Designation" value={formData.contact_person_designation} />
                                </div>
                            </section>

                            {/* Contact Details */}
                            <section className="space-y-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Contact Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Phone" value={formData.phone} copyable />
                                    <DetailItem label="Alt Phone" value={formData.alternate_phone} />
                                    <DetailItem label="Email" value={formData.email} isEmail />
                                    <DetailItem label="Website" value={formData.website} isLink />
                                </div>
                            </section>

                            {/* Location Information */}
                            <section className="space-y-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Location</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                            {formData.address_line1} {formData.address_line2}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.landmark ? `Near ${formData.landmark}, ` : ""}{formData.city}, {formData.state} - {formData.pin_code}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailItem label="Latitude" value={formData.latitude} />
                                        <DetailItem label="Longitude" value={formData.longitude} />
                                    </div>
                                </div>
                            </section>

                            {/* Additional Notes */}
                            <section className="space-y-4 pt-4 border-t border-gray-50 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Observations</h3>
                                </div>
                                <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-100/50 leading-relaxed text-gray-600 text-[13px] font-medium italic">
                                    {formData.notes || "No additional observations provided."}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailItem({ label, value, copyable = false, isEmail = false, isLink = false }: { label: string, value: any, copyable?: boolean, isEmail?: boolean, isLink?: boolean }) {
    return (
        <div className="space-y-1.5 group">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <div className="flex items-center gap-2">
                <span className={`text-[13px] font-semibold text-gray-900 break-all ${!value ? 'text-gray-300 italic font-normal' : ''}`}>
                    {value || "Not Provided"}
                </span>
            </div>
        </div>
    );
}

export default function FormReview() {
    const { useForms, useAssignedAois } = useEditor();
    const { data: allForms, isLoading: isLoadingForms } = useForms();
    const { data: assignedAois } = useAssignedAois(true);

    const [expandedAoi, setExpandedAoi] = useState<string | null>(null);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [aoiFilter, setAoiFilter] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Selection state
    const [selectedFormIds, setSelectedFormIds] = useState<Set<string>>(new Set());

    const filteredFormsList = useMemo(() => {
        const safeForms = Array.isArray(allForms) ? allForms : (allForms?.data || []);
        if (!safeForms.length) return [];
        
        return safeForms.filter((form: any) => {
            // Search filter
            const businessName = (form.form?.business_name || "").toLowerCase();
            const aoiName = (form.aoi?.aoi_name || "").toLowerCase();
            const city = (form.form?.city || form.aoi?.city || "").toLowerCase();
            const query = debouncedSearchQuery.toLowerCase();
            const matchesSearch = !debouncedSearchQuery || businessName.includes(query) || aoiName.includes(query) || city.includes(query);

            // AOI Filter
            const matchesAoi = aoiFilter === "ALL" || form.aoi_id === aoiFilter || form.aoi?.aoi_code === aoiFilter;

            // Date Filter
            const formDate = new Date(form.created_at).toISOString().split('T')[0];
            const matchesStartDate = !startDate || formDate >= startDate;
            const matchesEndDate = !endDate || formDate <= endDate;

            return matchesSearch && matchesAoi && matchesStartDate && matchesEndDate;
        });
    }, [allForms, debouncedSearchQuery, aoiFilter, startDate, endDate]);

    const aoiGroupedForms = useMemo(() => {
        const groups: Record<string, { aoi: any, forms: any[] }> = {};

        filteredFormsList.forEach((form: any) => {
            if (!form.aoi_id) return;
            if (!groups[form.aoi_id]) {
                groups[form.aoi_id] = {
                    aoi: form.aoi || { id: form.aoi_id, aoi_name: "Unknown AOI" },
                    forms: []
                };
            }
            groups[form.aoi_id].forms.push(form);
        });

        return Object.values(groups).sort((a, b) => (a.aoi.aoi_name || "").localeCompare(b.aoi.aoi_name || ""));
    }, [filteredFormsList]);

    // Selection Handlers
    const toggleFormSelection = (id: string) => {
        const newSet = new Set(selectedFormIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedFormIds(newSet);
    };

    const toggleAoiSelection = (aoiId: string, forms: any[]) => {
        const formIds = forms.map(f => f.id);
        const allInAoiSelected = formIds.every(id => selectedFormIds.has(id));

        const newSet = new Set(selectedFormIds);
        if (allInAoiSelected) {
            formIds.forEach(id => newSet.delete(id));
        } else {
            formIds.forEach(id => newSet.add(id));
        }
        setSelectedFormIds(newSet);
    };

    const toggleSelectAll = () => {
        const allFilteredIds = filteredFormsList.map((f: any) => f.id);
        const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id: string) => selectedFormIds.has(id));

        if (isAllSelected) {
            setSelectedFormIds(new Set());
        } else {
            setSelectedFormIds(new Set(allFilteredIds));
        }
    };

    const downloadCSV = () => {
        // Use selected forms if any, otherwise use all filtered forms
        const formsToExport = selectedFormIds.size > 0
            ? filteredFormsList.filter((f: any) => selectedFormIds.has(f.id))
            : filteredFormsList;

        if (formsToExport.length === 0) return;

        const headers = [
            "AOI Name",
            "AOI Code",
            "AOI City",
            "AOI State",
            "AOI Pin Code",
            "AOI Center Latitude",
            "AOI Center Longitude",
            "Photo ID",
            "Photo URL",
            "Photo Type",
            "Photo Latitude",
            "Photo Longitude",
            "Business Name",
            "Business Category",
            "Business Sub Category",
            "Contact Person Name",
            "Contact Person Designation",
            "Phone",
            "Alternate Phone",
            "Email",
            "Website",
            "Address Line 1",
            "Address Line 2",
            "Landmark",
            "City",
            "State",
            "Pin Code",
            "Country",
            "Latitude",
            "Longitude",
            "Services Offered",
            "Operating Hours",
            "Notes / Observations",
            "Tags",
            "Submission Date",
            "Review Status"
        ];

        const rows = formsToExport.map((f: any) => {
            const d = f.form || {};
            const aoi = f.aoi || {};
            const photo = f.photo || {};
            return [
                aoi.aoi_name || "Not Provided",
                aoi.aoi_code || "Not Provided",
                aoi.city || "Not Provided",
                aoi.state || "Not Provided",
                aoi.pin_code || "Not Provided",
                aoi.center_latitude || "Not Provided",
                aoi.center_longitude || "Not Provided",
                f.photo_id || "Not Provided",
                photo.photo_url || "Not Provided",
                photo.photo_type || "Not Provided",
                photo.latitude || "Not Provided",
                photo.longitude || "Not Provided",
                d.business_name || "Not Provided",
                d.business_category || "Not Provided",
                d.business_sub_category || "Not Provided",
                d.contact_person_name || "Not Provided",
                d.contact_person_designation || "Not Provided",
                d.phone || "Not Provided",
                d.alternate_phone || "Not Provided",
                d.email || "Not Provided",
                d.website || "Not Provided",
                d.address_line1 || "Not Provided",
                d.address_line2 || "Not Provided",
                d.landmark || "Not Provided",
                d.city || "Not Provided",
                d.state || "Not Provided",
                d.pin_code || "Not Provided",
                d.country || "Not Provided",
                d.latitude || "Not Provided",
                d.longitude || "Not Provided",
                Array.isArray(d.services_offered) ? d.services_offered.join(" | ") : (d.services_offered || "Not Provided"),
                d.operating_hours ? JSON.stringify(d.operating_hours) : "Not Provided",
                d.notes || "Not Provided",
                Array.isArray(d.tags) ? d.tags.join(" | ") : (d.tags || "Not Provided"),
                new Date(f.created_at).toLocaleString(),
                f.review_status || "Not Provided"
            ];
        });

        const csvContent = [
            headers.join(","),
            ...rows.map((row: any[]) => row.map((cell: any) => {
                // Escape quotes and handle commas
                const escaped = String(cell).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `pixpe_forms_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isAllSelected = filteredFormsList.length > 0 && filteredFormsList.every((f: any) => selectedFormIds.has(f.id));

    return (
        <div className="p-3 lg:p-6 space-y-8 w-full max-w-7xl">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight flex items-center gap-3">
                            Report Review
                            <Badge className="bg-blue-600 text-[10px] font-medium uppercase px-2 py-0.5 rounded-lg border-none shadow-sm">
                                Survey Data
                            </Badge>
                        </h1>
                        <p className="text-gray-500 font-medium text-xs tracking-wider">
                            Review detailed data reports submitted for your assigned areas
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSelectAll}
                            className={`h-11 px-4 rounded-xl border-2 transition-all font-semibold text-xs ${isAllSelected ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-100 text-gray-500'}`}
                        >
                            {isAllSelected ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                            {isAllSelected ? "Deselect All" : "Select All"}
                        </Button>

                        <Button
                            onClick={downloadCSV}
                            disabled={filteredFormsList.length === 0}
                            className="bg-gray-900 hover:bg-blue-600 text-white rounded-xl h-11 px-6 font-semibold text-xs shadow-lg shadow-gray-100 hover:shadow-blue-100 transition-all"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {selectedFormIds.size > 0 ? `Export ${selectedFormIds.size} Selected` : "Export Filtered"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-[24px] border border-gray-100 shadow-sm">
                    <div className="relative group">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search by business, area or city..."
                            className="pl-10 h-11 bg-white border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                            className="w-full pl-10 pr-4 h-11 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium text-xs appearance-none outline-none cursor-pointer"
                            value={aoiFilter}
                            onChange={(e) => setAoiFilter(e.target.value)}
                        >
                            <option value="ALL">All AOIs</option>
                            {(Array.isArray(assignedAois) ? assignedAois : (assignedAois?.data || []))?.map((aoi: any) => (
                                <option key={aoi.id} value={aoi.id}>
                                    {aoi.aoi_name || aoi.aoi_code}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative group">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="date"
                            className="pl-10 pr-10 h-11 bg-white border-gray-200 rounded-xl font-medium text-xs appearance-none"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        {startDate && (
                            <button
                                onClick={() => setStartDate("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="relative group">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="date"
                            className="pl-10 pr-10 h-11 bg-white border-gray-200 rounded-xl font-medium text-xs"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        {endDate && (
                            <button
                                onClick={() => setEndDate("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isLoadingForms ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-[24px]" />
                    ))}
                </div>
            ) : aoiGroupedForms.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed rounded-[40px] bg-gray-50/50 border-gray-200">
                    <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-gray-100">
                        <FileText className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-semibold uppercase text-xs tracking-widest">No reports found matching filters</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {aoiGroupedForms.map((group: any) => {
                        const isExpanded = expandedAoi === group.aoi.id;
                        const isAoiFullySelected = group.forms.every((f: any) => selectedFormIds.has(f.id));
                        const isAoiPartiallySelected = group.forms.some((f: any) => selectedFormIds.has(f.id)) && !isAoiFullySelected;

                        return (
                            <div key={group.aoi.id} className={`border rounded-[24px] bg-white overflow-hidden transition-all duration-300 ${isAoiFullySelected ? 'border-blue-200 shadow-lg shadow-blue-50/50' : 'border-gray-100 shadow-sm'}`}>
                                <div className="flex items-center">
                                    <div className="pl-4 md:pl-6 h-full flex items-center">
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleAoiSelection(group.aoi.id, group.forms);
                                            }}
                                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all active:scale-90 ${isAoiFullySelected ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200' : isAoiPartiallySelected ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                        >
                                            {isAoiFullySelected && <div className="w-3 h-3 bg-white rounded-sm" />}
                                            {isAoiPartiallySelected && <div className="w-3 h-0.5 bg-blue-600 rounded-full" />}
                                        </div>
                                    </div>

                                    <div
                                        className={`flex-1 p-6 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/10' : 'hover:bg-gray-50/50'}`}
                                        onClick={() => setExpandedAoi(isExpanded ? null : group.aoi.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl transition-all duration-300 ${isExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-100/50' : 'bg-gray-100 text-gray-400'}`}>
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg tracking-tight">{group.aoi.aoi_name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isAoiPartiallySelected || isAoiFullySelected ? 'text-blue-600' : 'text-gray-400'}`}>
                                                        {group.forms.length} {group.forms.length === 1 ? 'Report' : 'Reports'}
                                                    </span>
                                                    <span className="text-gray-200 text-xs">•</span>
                                                    <span className="text-[10px] font-medium text-gray-400 uppercase">
                                                        {group.aoi.aoi_code}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-white text-blue-600 shadow-sm rotate-180' : 'bg-transparent text-gray-200'}`}>
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-gray-50 bg-gray-50/5"
                                        >
                                            <div className="p-6 grid gap-3">
                                                {group.forms.map((form: any) => {
                                                    const isSelected = selectedFormIds.has(form.id);
                                                    return (
                                                        <motion.div
                                                            key={form.id}
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`flex items-center gap-4 p-4 rounded-[18px] border transition-all group/item ${isSelected ? 'border-blue-200 bg-blue-50/30' : 'border-gray-50 bg-white hover:border-gray-200 shadow-sm'}`}
                                                        >
                                                            <div
                                                                onClick={() => toggleFormSelection(form.id)}
                                                                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all active:scale-90 ${isSelected ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-100' : 'bg-white border-gray-200 group-hover/item:border-blue-300'}`}
                                                            >
                                                                {isSelected && <div className="w-3 h-3 bg-white rounded-sm" />}
                                                            </div>

                                                            <div className="flex flex-col sm:flex-row items-center flex-1 justify-between gap-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-[12px] overflow-hidden border border-gray-100 bg-gray-100 flex-shrink-0 shadow-sm">
                                                                        {form.photo?.photo_url ? (
                                                                            <ImageWithLoader
                                                                                src={form.photo.photo_url}
                                                                                alt="Thumbnail"
                                                                                showViewFull={false}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                                <ImageIcon className="w-5 h-5" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-900 tracking-tight line-clamp-1">
                                                                            {form.form?.business_name || "Untitled Business"}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-0.5 font-medium">
                                                                            <span className="text-[10px] text-gray-400">
                                                                                {new Date(form.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                                            </span>
                                                                            <span className="text-gray-200 text-[10px]">|</span>
                                                                            <span className="text-[10px] text-blue-500 uppercase tracking-widest">
                                                                                #{form.id.slice(0, 8)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-9 px-4 rounded-lg font-semibold text-[10px] uppercase tracking-wider text-gray-500 hover:text-blue-600 hover:bg-white border-2 border-transparent hover:border-blue-50 group-hover/item:text-blue-600"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedForm(form);
                                                                    }}
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 mr-2" />
                                                                    Review
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}

            <ReportDetailDialog
                form={selectedForm}
                isOpen={!!selectedForm}
                onClose={() => setSelectedForm(null)}
            />
        </div>
    );
}
