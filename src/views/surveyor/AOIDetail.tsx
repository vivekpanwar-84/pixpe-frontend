"use client";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, Camera, CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle, Play, Send, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSurveyor } from "@/hooks/useSurveyor";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AddPoiModal } from "@/components/modals/AddPoiModal";
import { StatusRestrictionModal } from "@/components/modals/StatusRestrictionModal";

const AOIMap = dynamic(() => import("@/components/AOIMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function AOIDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { useAssignedAoiDetail, usePois, createPoi, startAoi, submitAoi } = useSurveyor();
  const { data: aoi, isLoading, isError, error } = useAssignedAoiDetail(id);
  const { data: poisResponse, isLoading: isLoadingPois } = usePois(id);
  const [activeTab, setActiveTab] = useState("pois");
  const [isAddingPoi, setIsAddingPoi] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const pois = useMemo(() => poisResponse || [], [poisResponse]);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 lg:p-6 text-center space-y-4">
        <p className="text-red-500">Error loading AOI: {(error as any)?.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!aoi) return null;
  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        toast.error("Error getting location: " + error.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCreatePoi = async (name: string) => {
    if (!location) {
      toast.error("Location not tracked yet");
      return;
    }

    createPoi.mutate(
      {
        aoi_id: id,
        business_name: name,
        latitude: location.lat,
        longitude: location.lng,
      },
      {
        onSuccess: () => {
          toast.success("POI added successfully");
          setIsAddingPoi(false);
          setLocation(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to add POI");
        },
      }
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress": return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleStart = () => {
    startAoi.mutate(id, {
      onSuccess: () => toast.success("AOI started successfully"),
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to start AOI"),
    });
  };

  const handleSubmit = () => {
    submitAoi.mutate(id, {
      onSuccess: () => toast.success("AOI submitted successfully"),
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to submit AOI"),
    });
  };

  const handleNavigate = () => {
    if (aoi.center_latitude && aoi.center_longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${aoi.center_latitude},${aoi.center_longitude}`;
      window.open(url, "_blank");
    }
  };

  const handleAddPoiClick = () => {
    const status = aoi.status?.toLowerCase();
    if (status === "assigned") {
      toast.error("Please start the AOI first");
      return;
    }
    if (["completed", "submitted", "closed"].includes(status)) {
      setIsStatusModalOpen(true);
      return;
    }
    setIsAddingPoi(true);
    startTracking();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky on mobile */}
      <div className="sticky top-14 lg:top-16 z-20 bg-white border-b border-gray-200">
        <div className="px-4 py-3 lg:px-6 lg:py-4">
          <Link href="/surveyor/aoi">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to AOIs
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold mb-1">{aoi.aoi_name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={aoi.status === "completed" ? "default" : "secondary"}>
                  {aoi.status.replace("_", " ")}
                </Badge>
                <Badge variant={aoi.priority === "high" ? "destructive" : "secondary"}>
                  {aoi.priority} priority
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="hidden lg:flex" onClick={handleNavigate}>
                <Navigation className="w-4 h-4 mr-2" />
                Navigate
              </Button>
              {aoi.status?.toLowerCase() === "assigned" && (
                <Button className="hidden lg:flex" onClick={handleStart} disabled={startAoi.isPending}>
                  <Play className="w-4 h-4 mr-2" />
                  {startAoi.isPending ? "Starting..." : "Start AOI"}
                </Button>
              )}
              {aoi.status?.toLowerCase() === "in_progress" && (
                <Button className="hidden lg:flex" onClick={handleSubmit} disabled={submitAoi.isPending}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitAoi.isPending ? "Submitting..." : "Submit AOI"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Main Content */}
          <div className="space-y-4">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pixpe Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium">
                      {aoi.estimated_poi_count > 0 ? Math.round((aoi.actual_poi_count / aoi.estimated_poi_count) * 100) : 0}%
                    </span>
                  </div>
                  <Progress value={aoi.estimated_poi_count > 0 ? (aoi.actual_poi_count / aoi.estimated_poi_count) * 100 : 0} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{aoi.actual_poi_count || 0}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(aoi.estimated_poi_count || 0) - (aoi.actual_poi_count || 0)}
                    </div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{aoi.estimated_poi_count || 0}</div>
                    <div className="text-xs text-gray-600">Total POIs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map View */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-64 lg:h-96 w-full relative z-0">
                  {aoi.center_latitude && aoi.center_longitude ? (
                    <AOIMap
                      center={[Number(aoi.center_latitude), Number(aoi.center_longitude)]}
                      geojson={aoi.boundary_geojson}
                      aoiName={aoi.aoi_name}
                    />
                  ) : (
                    <div className="bg-gray-200 h-full flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No coordinates available</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border text-[10px] space-y-1 z-20 pointer-events-none">
                    <div className="font-semibold text-gray-700">AOI Center</div>
                    <div className="text-gray-600">Lat: {aoi.center_latitude}</div>
                    <div className="text-gray-600">Lon: {aoi.center_longitude}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* POI List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Points of Interest ({pois.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleAddPoiClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add POI
                  </Button>
                  <AddPoiModal
                    isOpen={isAddingPoi}
                    onOpenChange={setIsAddingPoi}
                    isLocating={isLocating}
                    location={location}
                    startTracking={startTracking}
                    handleCreatePoi={handleCreatePoi}
                    isPending={createPoi.isPending}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pois.map((poi: any) => (
                    <Link key={poi.id} href={`/surveyor/capture/${poi.id}`}>
                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getStatusIcon(poi.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1">{poi.business_name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{poi.address}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {/* <span className="flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                {poi.photos} photos
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {poi.distance}
                              </span> */}
                            </div>
                          </div>
                          <Badge variant={
                            poi.status === "completed" ? "default" :
                              poi.status === "in_progress" ? "secondary" : "outline"
                          }>
                            {poi.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AOI Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Description</h4>
                  <p className="text-sm">{aoi.notes || "No description available"}</p>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">AOI Code</span>
                    <span className="font-medium font-mono text-xs">{aoi.aoi_code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-medium">{aoi.distance || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Assigned Date</span>
                    <span className="font-medium">
                      {aoi.assigned_at ? new Date(aoi.assigned_at).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deadline</span>
                    <span className="font-medium text-red-600">
                      {aoi.deadline ? new Date(aoi.deadline).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <Button variant="outline" className="w-full" onClick={handleNavigate}>
                    <Navigation className="w-4 h-4 mr-2" />
                    Start Navigation
                  </Button>
                  {aoi.status?.toLowerCase() === "assigned" && (
                    <Button className="w-full" onClick={handleStart} disabled={startAoi.isPending}>
                      <Play className="w-4 h-4 mr-2" />
                      {startAoi.isPending ? "Starting..." : "Start AOI"}
                    </Button>
                  )}
                  {aoi.status?.toLowerCase() === "in_progress" && (
                    <Button className="w-full" onClick={handleSubmit} disabled={submitAoi.isPending}>
                      <Send className="w-4 h-4 mr-2" />
                      {submitAoi.isPending ? "Submitting..." : "Submit AOI"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-20 right-4 z-30 flex flex-col gap-2">
        <Button size="lg" variant="outline" className="rounded-full h-14 w-14 shadow-lg bg-white" onClick={handleNavigate}>
          <Navigation className="w-5 h-5 text-blue-600" />
        </Button>
        {aoi.status?.toLowerCase() === "assigned" && (
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" onClick={handleStart} disabled={startAoi.isPending}>
            <Play className="w-5 h-5" />
          </Button>
        )}
        {aoi.status?.toLowerCase() === "in_progress" && (
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" onClick={handleSubmit} disabled={submitAoi.isPending}>
            <Send className="w-5 h-5" />
          </Button>
        )}
      </div>

      <StatusRestrictionModal
        isOpen={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        status={aoi.status}
      />
    </div>
  );
}
