"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { surveyorService } from "@/services/surveyor.service";
import AOIMultiMap from "@/components/AOIMultiMap";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Info, Search, Map } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AOIMapView() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedState, setSelectedState] = useState("all");

    const { data: aois, isLoading, error } = useQuery({
        queryKey: ["all-aois"],
        queryFn: surveyorService.getAllAois,
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

            return matchesSearch && matchesState;
        });
    }, [aois, searchQuery, selectedState]);

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
                    <h1 className="text-2xl font-bold text-gray-900">All Areas of Interest</h1>
                    <p className="text-gray-500">View and track all AOIs across the map.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm border border-blue-100 h-10">
                        <Info className="w-4 h-4" />
                        <span>Showing: {filteredAois.length} / {aois?.length || 0}</span>
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
            </div>

            <Card className="flex-1 overflow-hidden shadow-md border-none ring-1 ring-gray-200">
                <CardContent className="p-0 h-full relative">
                    <AOIMultiMap aois={filteredAois} />

                    {/* Status Legend Overlay */}
                    <div className="absolute bottom-4 left-4 z-[10] bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-lg text-xs space-y-2">
                        <p className="font-semibold text-gray-700 border-b pb-1 mb-1">Status Legend</p>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span>Assigned/In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span>Completed/Closed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                            <span>Draft/Other</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
