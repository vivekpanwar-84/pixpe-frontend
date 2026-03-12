"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Camera, Upload, Check, X, Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSurveyor } from "@/hooks/useSurveyor";
import { ImageWithLoader } from "@/components/ImageWithLoader";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import getCroppedImg from "@/utils/cropImage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import imageCompression from 'browser-image-compression';

import ExifReader from 'exifreader';

export default function PhotoCapture() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { useAssignedAoiDetail, uploadPhoto, useMyUploads, deletePhoto } = useSurveyor();
  const { data: aoi, isLoading: isLoadingAoi } = useAssignedAoiDetail(id);
  const { data: myUploads, isLoading: isLoadingUploads } = useMyUploads();

  const [selectedType, setSelectedType] = useState("STOREFRONT");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isExtractingLocation, setIsExtractingLocation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Cropper State
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [pixelCrop, setPixelCrop] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Local staged photos before upload
  const [localPhotos, setLocalPhotos] = useState<{
    id: string;
    file: File;
    previewUrl: string;
    type: string;
    timestamp: string;
    location: { lat: number; lng: number };
  }[]>([]);

  // Filter existing photos for this AOI from server
  const activePhotos = useMemo(() => {
    if (!myUploads) return [];
    return myUploads.filter((photo: any) => photo.aoi_id === id && photo.status !== 'REJECTED');
  }, [myUploads, id]);

  const rejectedPhotos = useMemo(() => {
    if (!myUploads) return [];
    return myUploads.filter((photo: any) => photo.aoi_id === id && photo.status === 'REJECTED');
  }, [myUploads, id]);

  const photoTypes = [
    { label: "Storefront", value: "STOREFRONT" },
    { label: "Entrance", value: "ENTRANCE" },
    { label: "Signage", value: "SIGNBOARD" },
    { label: "Interior", value: "INTERIOR" },
    { label: "Menu Board", value: "PRODUCT" },
    { label: "Parking", value: "OTHER" },
    { label: "Exterior Side", value: "CONTACT_DETAILS" },
    { label: "Other", value: "OTHER" },
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !aoi) return;

    setIsExtractingLocation(true);
    const toastId = toast.loading("Extracting GPS data from photo...");

    try {
      const tags = await ExifReader.load(file);

      if (tags.GPSLatitude && tags.GPSLongitude) {
        const lat = tags.GPSLatitude.description;
        const lng = tags.GPSLongitude.description;

        // ExifReader might return coordinates as string or number depending on format
        const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
        const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;

        if (!isNaN(latitude) && !isNaN(longitude)) {
          setLocation({ lat: latitude, lng: longitude });
          toast.success("GPS location extracted from photo", { id: toastId });
        } else {
          throw new Error("Invalid GPS coordinates in photo");
        }
      } else {
        throw new Error("No GPS data found in this photo. Please ensure GPS is enabled on your camera.");
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropImage(reader.result as string);
        setIsCropping(true);
        setIsExtractingLocation(false);
      });
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(error.message || "Failed to extract location", { id: toastId });
      setIsExtractingLocation(false);
      setLocation(null);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop({
      unit: '%',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    setPixelCrop({
      x: 0,
      y: 0,
      width: width,
      height: height,
      unit: 'px'
    });
  };

  const handleSaveCroppedImage = async () => {
    if (!cropImage || !pixelCrop || !location || !imgRef.current) return;

    try {
      // Scale coordinates from displayed size to natural size
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const scaledPixelCrop = {
        x: pixelCrop.x * scaleX,
        y: pixelCrop.y * scaleY,
        width: pixelCrop.width * scaleX,
        height: pixelCrop.height * scaleY,
      };

      const croppedBlob = await getCroppedImg(cropImage, scaledPixelCrop);
      if (!croppedBlob) throw new Error("Failed to crop image");

      // Compress the cropped image
      const options = {
        maxSizeMB: 0.4,           // 400KB
        maxWidthOrHeight: 1280,   // enough resolution
        useWebWorker: true,
        initialQuality: 0.7,
        fileType: "image/webp",   // BIG improvement
      };

      const compressedFile = await imageCompression(new File([croppedBlob], "temp.jpg", { type: "image/jpeg" }), options);

      const finalFile = new File([compressedFile], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });

      const newPhoto = {
        id: Math.random().toString(36).substr(2, 9),
        file: finalFile,
        previewUrl: URL.createObjectURL(finalFile),
        type: selectedType,
        timestamp: new Date().toLocaleTimeString(),
        location: { ...location }
      };

      setLocalPhotos((prev) => [...prev, newPhoto]);
      setIsCropping(false);
      setCropImage(null);
      setLocation(null); // Clear location after staged
      toast.success(`${selectedType.replace("_", " ")} photo captured and location saved from metadata`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to process image");
    }
  };

  const handleRemoveLocal = (id: string) => {
    setLocalPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const handleRemoveExisting = async (id: string) => {
    const toastId = toast.loading("Deleting photo...");
    try {
      await deletePhoto.mutateAsync(id);
      toast.success("Photo deleted from server", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete photo", { id: toastId });
    }
  };

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (localPhotos.length === 0) {
      toast.error("No new photos to upload");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${localPhotos.length} photos...`);

    try {
      for (const photo of localPhotos) {
        const formData = new FormData();
        formData.append("file", photo.file);
        formData.append("aoi_id", id);
        formData.append("photo_type", photo.type);
        formData.append("latitude", photo.location.lat.toString());
        formData.append("longitude", photo.location.lng.toString());

        await uploadPhoto.mutateAsync(formData);
      }

      toast.success("All photos uploaded successfully", { id: toastId });
      setLocalPhotos([]);
      setIsUploading(false);
      router.back();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Some uploads failed", { id: toastId });
      setIsUploading(false);
    }
  };

  if (isLoadingAoi || isLoadingUploads) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />
      {/* Header */}
      <div className="sticky top-14 lg:top-16 z-20 bg-white border-b border-gray-200">
        <div className="px-4 py-3 lg:px-6 lg:py-4">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AOI
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">Photo Capture</h1>
              <p className="text-sm text-gray-500">{aoi?.aoi_name}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {activePhotos.length} Uploaded
              </Badge>
              {rejectedPhotos.length > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {rejectedPhotos.length} Rejected
                </Badge>
              )}
              <Badge variant="default" className="bg-blue-600">
                {localPhotos.length} Staged
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        {/* Location Status Bar */}
        <div className={`mb-4 p-2 rounded-lg text-xs flex items-center gap-2 ${location ? 'bg-green-50 text-green-700 border border-green-200' : (isExtractingLocation ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200')}`}>
          <MapPin className="w-4 h-4" />
          {location ? (
            <span>Photo GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
          ) : isExtractingLocation ? (
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Extracting location from photo...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Select or capture a photo to extract location metadata
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Capture Area */}
          <div className="space-y-4" id="photo-capture-area">
            {/* Camera View */}
            <Card>
              <CardContent className="p-0">
                <div className="bg-gray-900 aspect-video lg:aspect-[4/3] rounded-lg flex items-center justify-center relative overflow-hidden text-center text-white">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>

                  {isUploading ? (
                    <div className="relative z-10">
                      <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin opacity-50" />
                      <p className="text-sm">Uploading Photo...</p>
                    </div>
                  ) : isExtractingLocation ? (
                    <div className="relative z-10">
                      <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin opacity-50" />
                      <p className="text-sm">Extracting Metadata...</p>
                    </div>
                  ) : (
                    <div className="relative z-10" onClick={handleCaptureClick}>
                      <Camera className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Tap to Capture / Upload</p>
                      <p className="text-xs text-gray-400 mt-1">
                        AOI: {aoi?.aoi_name || 'Loading...'}
                      </p>
                    </div>
                  )}

                  {/* Mobile Camera Controls */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 lg:hidden">
                    <Button
                      size="lg"
                      className="rounded-full h-16 w-16"
                      onClick={handleCaptureClick}
                      disabled={isUploading || isExtractingLocation}
                    >
                      <Camera className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Upload Panel */}
            <Card className="hidden lg:block">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Photo Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {photoTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCaptureClick} className="flex-1" disabled={isUploading || isExtractingLocation}>
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleCaptureClick} disabled={isUploading || isExtractingLocation}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staged Photos */}
            {localPhotos.length > 0 && (
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Staged Photos (To be uploaded)
                    <Badge variant="outline" className="text-blue-700 border-blue-200">New</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {localPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center overflow-hidden border border-blue-200">
                          <ImageWithLoader
                            src={photo.previewUrl}
                            alt={photo.type}
                            showViewFull={false}
                          />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-blue-600/80 text-white p-2 rounded-b-lg">
                          <p className="text-[10px] font-medium truncate uppercase">
                            {photo.type.replace("_", " ")}
                          </p>
                          <p className="text-[9px] opacity-80">{photo.timestamp}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveLocal(photo.id)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg active:scale-95 transition-transform"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rejected Photos */}
            {rejectedPhotos.length > 0 && (
              <Card className="border-red-200 bg-red-50/30">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center justify-between text-red-700">
                    Rejected Photos (Action Required)
                    <Badge variant="destructive" className="bg-red-600 h-5 text-[10px]">Rejected</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {rejectedPhotos.map((photo: any) => (
                      <div key={photo.id} className="flex gap-3 bg-white p-3 rounded-lg border border-red-100 shadow-sm relative group">
                        <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-100 shrink-0">
                          <ImageWithLoader
                            src={photo.photo_url}
                            alt={photo.photo_type}
                            showViewFull={false}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4 border-red-200 text-red-700">
                              {photo.photo_type.replace("_", " ")}
                            </Badge>
                            <span className="text-[9px] text-gray-400">
                              {new Date(photo.rejected_at || photo.updated_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="bg-red-50 p-2 rounded mb-2 border border-red-100/50">
                            <p className="text-[11px] font-medium text-red-800 leading-tight">
                              Reason: <span className="font-normal opacity-90">{photo.rejection_reason || "No reason provided"}</span>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 text-[10px] px-3 bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                setSelectedType(photo.photo_type);
                                document.getElementById('photo-capture-area')?.scrollIntoView({ behavior: 'smooth' });
                                toast.info(`Switched to ${photo.photo_type.replace("_", " ")} for re-upload`);
                              }}
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Re-upload
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px] text-gray-400 hover:text-red-600"
                              onClick={() => handleRemoveExisting(photo.id)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Existing Photos */}
            {activePhotos.length > 0 && (
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Recently Uploaded</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {activePhotos.map((photo: any) => (
                      <div key={photo.id} className="relative group">
                        <div className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                          <ImageWithLoader
                            src={photo.photo_url}
                            alt={photo.photo_type}
                            showViewFull={false}
                          />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white p-2 rounded-b-lg">
                          <p className="text-[10px] font-medium truncate uppercase">
                            {photo.photo_type.replace("_", " ")}
                          </p>
                          <p className="text-[9px] text-gray-300">
                            {new Date(photo.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveExisting(photo.id)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Instructions & Actions */}
          <div className="space-y-4">
            {/* Mobile Photo Type Selector */}
            <Card className="lg:hidden">
              <CardContent className="p-4">
                <Label className="mb-2 block">Photo Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {photoTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Ensure good lighting</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Capture full storefront</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Include signage clearly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Avoid blurry images</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-xs uppercase tracking-wider text-gray-500 font-bold">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {["STOREFRONT", "ENTRANCE", "SIGNBOARD", "INTERIOR"].map((type) => {
                    const isDone = [...activePhotos, ...localPhotos].some(
                      (p: any) => (p.photo_type || p.type).toUpperCase() === type
                    );
                    return (
                      <div key={type} className="flex items-center justify-between text-xs">
                        <span className="capitalize">{type.toLowerCase()}</span>
                        {isDone ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2 sticky bottom-4">
              <Button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg"
                disabled={localPhotos.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Finish Session ({localPhotos.length})
                  </>
                )}
              </Button>
              <p className="text-[10px] text-center text-gray-400">
                Uploaded photos will be saved to Supabase
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cropper Dialog */}
      <Dialog open={isCropping} onOpenChange={(open) => !open && setIsCropping(false)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Crop Photo (Drag corners or box)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 relative bg-gray-100 overflow-auto flex items-center justify-center p-4">
            {cropImage && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setPixelCrop(c)}
                className="max-h-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={cropImage}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </ReactCrop>
            )}
          </div>
          <div className="p-6 space-y-4 bg-white border-t">
            <p className="text-xs text-gray-500 text-center">
              Adjust the crop area as needed. You can resize it freely by dragging the edges or corners.
            </p>
            <DialogFooter className="flex gap-2 sm:justify-start">
              <Button onClick={handleSaveCroppedImage} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Check className="w-4 h-4 mr-2" />
                Done & Save
              </Button>
              <Button variant="ghost" onClick={() => setIsCropping(false)} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
