"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { surveyorService } from "@/services/surveyor.service";
import AOIMultiMap from "@/components/AOIMultiMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Info, Search, Map, Send, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export default function AOIMapView() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedState, setSelectedState] = useState("all");
    const [typeFilter, setTypeFilter] = useState<"all" | "mine" | "available">("all");
    const [selectedAoi, setSelectedAoi] = useState<any>(null);
    const [focusedAoiId, setFocusedAoiId] = useState<string | null>(null);
    const { useProfile } = useAuth();
    const { data: profile } = useProfile();

    const { data: aois, isLoading, error } = useQuery({
        queryKey: ["all-viewable-aois"],
        queryFn: () => surveyorService.getAllAois(false),
    });

    const { data: myRequests } = useQuery({
        queryKey: ["my-aoi-requests"],
        queryFn: surveyorService.getMyAoiRequests,
    });

    const requestMutation = useMutation({
        mutationFn: surveyorService.requestAoi,
        onSuccess: () => {
            toast.success("Request sent successfully!");
            queryClient.invalidateQueries({ queryKey: ["my-aoi-requests"] });
            setSelectedAoi(null);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to send request");
        }
    });

    const states = useMemo(() => {
        if (!aois) return [];
        const uniqueStates = new Set(aois.map((aoi: any) => aoi.state).filter(Boolean));
        return Array.from(uniqueStates).sort() as string[];
    }, [aois]);

    const filteredAois = useMemo(() => {
        if (!aois) return [];
        return aois.filter((aoi: any) => {
            const matchesSearch =
                aoi.aoi_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                aoi.aoi_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (aoi.city && aoi.city.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesState = selectedState === "all" || aoi.state === selectedState;
            const isUnassigned = !aoi.assigned_to_surveyor_id;
            const isMine = aoi.assigned_to_surveyor_id === profile?.id;

            const matchesType =
                typeFilter === "all" ||
                (typeFilter === "mine" && isMine) ||
                (typeFilter === "available" && isUnassigned);

            return matchesSearch && matchesState && matchesType && (isUnassigned || isMine);
        });
    }, [aois, searchQuery, selectedState, typeFilter, profile?.id]);


    const handleRequest = (aoiId: string) => {
        requestMutation.mutate({ aoi_id: aoiId });
    };

    const getRequestStatus = (aoiId: string) => {
        return myRequests?.find((r: any) => r.aoi_id === aoiId);
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
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load AOIs. Please try again later.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col gap-6 h-[calc(100vh-100px)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Explore & Request Areas</h1>
                    <p className="text-gray-500">View your assigned areas or request new ones from the map.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm border border-blue-100 h-10">
                        <Info className="w-4 h-4" />
                        <span>Showing: {filteredAois.length} Areas</span>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, code or city..."
                        className="pl-10 h-11 border-gray-200 focus-visible:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger className="h-11 border-gray-200 focus:ring-blue-500">
                            <Map className="w-4 h-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="Filter by State" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All States</SelectItem>
                            {states.map((state) => (
                                <SelectItem key={state} value={state}>
                                    {state}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
                    <Button
                        variant={typeFilter === "all" ? "default" : "ghost"}
                        size="sm"
                        className={`h-9 rounded-lg text-xs font-bold px-4 ${typeFilter === "all" ? "bg-white text-gray-900 shadow-sm hover:bg-white" : "text-gray-500"}`}
                        onClick={() => setTypeFilter("all")}
                    >
                        All
                    </Button>
                    <Button
                        variant={typeFilter === "mine" ? "default" : "ghost"}
                        size="sm"
                        className={`h-9 rounded-lg text-xs font-bold px-4 ${typeFilter === "mine" ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700" : "text-gray-500"}`}
                        onClick={() => setTypeFilter("mine")}
                    >
                        Your Area
                    </Button>
                    <Button
                        variant={typeFilter === "available" ? "default" : "ghost"}
                        size="sm"
                        className={`h-9 rounded-lg text-xs font-bold px-4 ${typeFilter === "available" ? "bg-amber-500 text-white shadow-sm hover:bg-amber-600" : "text-gray-500"}`}
                        onClick={() => setTypeFilter("available")}
                    >
                        Request Area
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
                {/* Map Area */}
                <Card className="flex-1 overflow-hidden shadow-md border-none ring-1 ring-gray-200 relative">
                    <CardContent className="p-0 h-full relative">
                        <AOIMultiMap aois={filteredAois} onSelectAoi={setSelectedAoi} focusedAoiId={focusedAoiId} currentUserId={profile?.id} />

                        {/* Status Legend Overlay */}
                        <div className="absolute bottom-4 left-4 z-[10] bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-lg text-xs space-y-2">
                            <p className="font-semibold text-gray-700 border-b pb-1 mb-1">Status Legend</p>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span>Your Assigned Areas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span>Available for Request</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                                <span>Pending Request</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Sidebar - Available AOIs/Requests */}
                <Card className="flex-1 overflow-hidden shadow-md border-none ring-1 ring-gray-200 flex flex-col min-h-0">
                    <CardHeader className="p-4 border-b bg-gray-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Send className="w-5 h-5 text-blue-600" />
                            Available Areas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        {filteredAois.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Map className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-400" />
                                <p className="text-sm">No available areas match your filters.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredAois.map((aoi: any) => {
                                    const request = getRequestStatus(aoi.id);
                                    return (
                                        <div key={aoi.id} className="p-4 hover:bg-gray-50 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{aoi.aoi_name}</h3>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{aoi.aoi_code}</p>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] h-5 bg-white">
                                                    {aoi.city || "Unknow City"}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-2">
                                                    {aoi.assigned_to_surveyor_id === profile?.id ? (
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-tight">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Your Area
                                                        </div>
                                                    ) : request ? (
                                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${request.status === 'PENDING' ? 'text-amber-600 bg-amber-50 px-2 py-1 rounded-lg' :
                                                            request.status === 'APPROVED' ? 'text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg' : 'text-red-600 bg-red-50 px-2 py-1 rounded-lg'
                                                            }`}>
                                                            {request.status === 'PENDING' ? (
                                                                <>
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    Pending Review
                                                                </>
                                                            ) : request.status === 'APPROVED' ? (
                                                                <>
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    Approved
                                                                </>
                                                            ) : (
                                                                "Rejected"
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 text-[11px] gap-1.5 px-3 bg-blue-600 hover:bg-blue-700 shadow-sm"
                                                            onClick={() => handleRequest(aoi.id)}
                                                            disabled={requestMutation.isPending}
                                                        >
                                                            Request
                                                            <ChevronRight className="w-3 h-3" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[11px] gap-1.5 px-3 border-blue-200 text-blue-600 hover:bg-blue-50"
                                                        onClick={() => setFocusedAoiId(aoi.id)}
                                                    >
                                                        <Map className="w-3 h-3" />
                                                        View on Map
                                                    </Button>
                                                </div>
                                                <span className="text-[10px] text-gray-400">
                                                    {aoi.area_size_sqkm ? `${aoi.area_size_sqkm} sqkm` : ""}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
