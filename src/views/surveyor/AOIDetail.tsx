"use client";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { StatusRestrictionModal } from "@/components/modals/StatusRestrictionModal";
import { useRef } from "react";

const AOIMap = dynamic(() => import("@/components/AOIMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function AOIDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { useAssignedAoiDetail, useMyUploads, startAoi, submitAoi, requestAoi } = useSurveyor();
  const { data: aoi, isLoading, isError, error } = useAssignedAoiDetail(id);
  const { data: uploadsResponse, isLoading: isLoadingUploads } = useMyUploads(id);
  const [activeTab, setActiveTab] = useState("photos");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);
  const [replacingPhotoType, setReplacingPhotoType] = useState<string | null>(null);
  const { uploadPhoto, deletePhoto, resubmitPhoto } = useSurveyor();
  const [showMap, setShowMap] = useState(false);

  const aoiPhotos = uploadsResponse || [];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress": return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleStart = () => {
    startAoi.mutate(id, {
      onSuccess: () => {
        toast.success("AOI started successfully");
      },
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to start AOI"),
    });
  };

  const handleSubmit = () => {
    submitAoi.mutate(id, {
      onSuccess: () => toast.success("AOI submitted successfully"),
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to submit AOI"),
    });
  };

  const handleReopen = () => {
    requestAoi.mutate({ aoi_id: id, request_type: 'REOPEN' }, {
      onSuccess: () => toast.success("Reopen request sent to manager"),
      onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to send reopen request"),
    });
  };

  const handleNavigate = () => {
    if (aoi.center_latitude && aoi.center_longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${aoi.center_latitude},${aoi.center_longitude}`;
      window.open(url, "_blank");
    }
  };

  const handleAddPhoto = () => {
    const status = aoi.status?.toLowerCase();
    if (status === "assigned") {
      toast.error("Please start the AOI first");
      return;
    }
    if (["completed", "submitted", "closed"].includes(status)) {
      setIsStatusModalOpen(true);
      return;
    }

    router.push(`/surveyor/capture/${id}`);
  };

  const handleReplacePhoto = (photoId: string, photoType: string) => {
    setReplacingPhotoId(photoId);
    setReplacingPhotoType(photoType);
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingPhotoId || !replacingPhotoType) return;

    const toastId = toast.loading("Replacing photo...");
    try {
      // 1. Get current location for new photo
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });

      // 2. Delete old photo
      await deletePhoto.mutateAsync(replacingPhotoId);

      // 3. Upload new photo
      const formData = new FormData();
      formData.append("file", file);
      formData.append("aoi_id", id);
      formData.append("photo_type", replacingPhotoType);
      formData.append("latitude", position.coords.latitude.toString());
      formData.append("longitude", position.coords.longitude.toString());

      const newPhoto = await uploadPhoto.mutateAsync(formData);

      // 4. Resubmit the new photo
      await resubmitPhoto.mutateAsync(newPhoto.id);

      toast.success("Photo replaced and resubmitted successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Replacement error:", error);
      toast.error(error?.response?.data?.message || "Failed to replace photo", { id: toastId });
    } finally {
      setReplacingPhotoId(null);
      setReplacingPhotoType(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
              {["submitted", "completed", "closed"].includes(aoi.status?.toLowerCase()) && (
                <Button className="hidden lg:flex" variant="outline" onClick={handleReopen} disabled={requestAoi.isPending}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {requestAoi.isPending ? "Sending..." : "Request Reopen"}
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
                <CardTitle>Survey Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Photos Captured</span>
                    <span className="font-medium">
                      {aoiPhotos.length}
                    </span>
                  </div>
                  <Progress value={Math.min((aoiPhotos.length / 10) * 100, 100)} className="h-2" />
                  <p className="text-[10px] text-gray-500 mt-1">* Minimum 10 photos recommended per AOI</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{aoiPhotos.filter((p: any) => p.status === 'APPROVED').length}</div>
                    <div className="text-xs text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{aoiPhotos.length}</div>
                    <div className="text-xs text-gray-600">Total Photos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map View - Deferred to improve LCP */}
            <Card className="overflow-hidden">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Map View</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="text-blue-600 h-8"
                >
                  {showMap ? "Hide Map" : "Load Map"}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 lg:h-80 w-full relative z-0 bg-gray-50 flex items-center justify-center">
                  {showMap ? (
                    aoi.center_latitude && aoi.center_longitude ? (
                      <AOIMap
                        center={[Number(aoi.center_latitude), Number(aoi.center_longitude)]}
                        geojson={aoi.boundary_geojson}
                        aoiName={aoi.aoi_name}
                        photos={aoiPhotos}
                      />
                    ) : (
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No coordinates available</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-6 cursor-pointer group" onClick={() => setShowMap(true)}>
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <MapPin className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-900">Click to Load AOI Map</p>
                      <p className="text-xs text-gray-500 mt-1">Improves page load speed</p>
                    </div>
                  )}
                  {showMap && aoi.center_latitude && (
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border text-[10px] space-y-1 z-20 pointer-events-none">
                      <div className="font-semibold text-gray-700">AOI Center</div>
                      <div className="text-gray-600">Lat: {aoi.center_latitude}</div>
                      <div className="text-gray-600">Lon: {aoi.center_longitude}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-1">
                      <TabsTrigger value="photos">Photos ({aoiPhotos.length})</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" onClick={handleAddPhoto}>
                      <Camera className="w-4 h-4 mr-2" />
                      Add Photo
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsContent value="photos" className="mt-0 space-y-3">
                    {isLoadingUploads ? (
                      <div className="space-y-3">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    ) : aoiPhotos.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No photos uploaded for this AOI</div>
                    ) : (
                      aoiPhotos.map((photo: any, idx: number) => (
                        <div key={photo.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                              <ImageWithSkeleton
                                src={photo.photo_url}
                                alt={photo.photo_type}
                                className="w-full h-full object-cover"
                                priority={idx === 0}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-600">
                                  {photo.photo_type.replace("_", " ")}
                                </Badge>
                                <span className="text-[10px] text-gray-500">
                                  {new Date(photo.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant={
                                  photo.status === "APPROVED" ? "default" :
                                    photo.status === "REJECTED" ? "destructive" : "secondary"
                                } className="text-[10px]">
                                  {photo.status}
                                </Badge>
                                {photo.status === "REJECTED" && (
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] text-red-500 font-medium">Action Required</span>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] px-2"
                                        onClick={() => handleReplacePhoto(photo.id, photo.photo_type)}
                                      >
                                        <Camera className="w-3 h-3 mr-1" />
                                        Recapture
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
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
                  {["submitted", "completed", "closed"].includes(aoi.status?.toLowerCase()) && (
                    <Button className="w-full" variant="outline" onClick={handleReopen} disabled={requestAoi.isPending}>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {requestAoi.isPending ? "Sending..." : "Request Reopen"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-20 right-4 z-30 flex flex-col gap-2">
        <Button size="lg" variant="outline" className="rounded-full h-14 w-14 shadow-lg bg-white" onClick={handleNavigate}>
          <Navigation className="w-5 h-5 text-blue-600" />
        </Button>
        <Button size="lg" variant="default" className="rounded-full h-14 w-14 shadow-lg" onClick={handleAddPhoto}>
          <Camera className="w-5 h-5" />
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
        {["submitted", "completed", "closed"].includes(aoi.status?.toLowerCase()) && (
          <Button size="lg" variant="outline" className="rounded-full h-14 w-14 shadow-lg bg-white" onClick={handleReopen} disabled={requestAoi.isPending}>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </Button>
        )}
      </div>

      <StatusRestrictionModal
        isOpen={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        status={aoi.status}
      />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
      />
    </div>
  );
}
