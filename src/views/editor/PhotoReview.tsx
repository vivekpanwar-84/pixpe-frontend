"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ZoomIn, ZoomOut, RotateCw,
  CheckCircle, XCircle, AlertTriangle, Pencil as Edit,
  Save, X, Image as ImageIcon, ChevronLeft, ChevronRight,
  Sparkles, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEditor } from "@/hooks/useEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";


interface ExtractedData {
  business_name: string;
  business_category: string;
  business_sub_category: string;
  phone: string;
  alternate_phone: string;
  email: string;
  website: string;
  contact_person_name: string;
  contact_person_designation: string;
  latitude: string;
  longitude: string;
  address_line1: string;
  address_line2: string;
  landmark: string;
  city: string;
  state: string;
  pin_code: string;
  country: string;
}

export default function PhotoReview() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { useAssignedPhotoDetails, requestReupload, submitForm, useForms } = useEditor();
  const { data: photo, isLoading, error } = useAssignedPhotoDetails(id);
  const { data: forms } = useForms(undefined, undefined, id);
  const photoForm = photo?.form || (forms && forms.length > 0 ? forms[0] : null);

  // Load existing form data if available
  useEffect(() => {
    if (photoForm?.form) {
      console.log("[PhotoReview] Loading existing structured form data:", photoForm.form);
      const formData = photoForm.form;
      setExtractedData({
        business_name: formData.business_name || "Not Provided",
        business_category: formData.business_category || "Not Provided",
        business_sub_category: formData.business_sub_category || "Not Provided",
        phone: formData.phone || "Not Provided",
        alternate_phone: formData.alternate_phone || "Not Provided",
        email: formData.email || "Not Provided",
        website: formData.website || "Not Provided",
        contact_person_name: formData.contact_person_name || "Not Provided",
        contact_person_designation: formData.contact_person_designation || "Not Provided",
        latitude: formData.latitude?.toString() || "Not Provided",
        longitude: formData.longitude?.toString() || "Not Provided",
        address_line1: formData.address_line1 || "Not Provided",
        address_line2: formData.address_line2 || "Not Provided",
        landmark: formData.landmark || "Not Provided",
        city: formData.city || "Not Provided",
        state: formData.state || "Not Provided",
        pin_code: formData.pin_code || "Not Provided",
        country: formData.country || "Not Provided",
      });
    }
    if (photo?.rejection_reason) {
      setFeedback(photo.rejection_reason);
    }
    if (photo?.status === "REJECTED") {
      setDecision("reject");
    }
  }, [photo, photoForm]);

  const [decision, setDecision] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const parseAiResponse = (text: string, aoi: any): ExtractedData => {
    const getValue = (label: string) => {
      // Clean labels from potential markdown bolding like **Phone**:
      const cleanText = text.replace(/\*\*/g, '');
      const stopLabels = [
        "Business Name", "Business Category", "Business Sub Category",
        "Phone", "Alternate Phone", "Email", "Website",
        "Contact Person Name", "Contact Person Designation",
        "Latitude", "Longitude", "Address Line 1", "Address Line 2",
        "Landmark", "City", "State", "Pin Code", "Country",
        "Basic Business Details", "Owner Name", "Address", "Contact Number"
      ].join('|');

      const regex = new RegExp(`${label}:?\\s*(.*?)(?=\\n(?:${stopLabels}):|$)`, 'is');
      const match = cleanText.match(regex);
      let value = match ? match[1].trim() : "Not Provided";

      // Remove the label itself if AI included it in the value (e.g. Phone: Phone 123)
      const labelClean = label.replace(/:$/, '');
      if (value.startsWith(labelClean)) {
        value = value.replace(new RegExp(`^${labelClean}:?\\s*`, 'i'), '').trim();
      }

      if (value.toLowerCase() === "not provided" || value === "") return "Not Provided";
      return value;
    };

    const data: ExtractedData = {
      business_name: getValue("Business Name"),
      business_category: getValue("Business Category"),
      business_sub_category: getValue("Business Sub Category"),
      phone: getValue("Phone"),
      alternate_phone: getValue("Alternate Phone"),
      email: getValue("Email"),
      website: getValue("Website"),
      contact_person_name: getValue("Contact Person Name"),
      contact_person_designation: getValue("Contact Person Designation"),
      latitude: getValue("Latitude"),
      longitude: getValue("Longitude"),
      address_line1: getValue("Address Line 1"),
      address_line2: getValue("Address Line 2"),
      landmark: getValue("Landmark"),
      city: getValue("City"),
      state: getValue("State"),
      pin_code: getValue("Pin Code"),
      country: getValue("Country"),
    };

    // Fallback logic for AOI data if AI returns "Not Provided"
    if (data.city === "Not Provided" && aoi?.city) data.city = aoi.city;
    if (data.state === "Not Provided" && aoi?.state) data.state = aoi.state;
    if (data.pin_code === "Not Provided" && aoi?.pin_code) data.pin_code = aoi.pin_code;
    if (data.latitude === "Not Provided" && aoi?.center_latitude) data.latitude = aoi.center_latitude.toString();
    if (data.longitude === "Not Provided" && aoi?.center_longitude) data.longitude = aoi.center_longitude.toString();
    if (data.country === "Not Provided" && aoi?.country) data.country = aoi.country;

    return data;
  };

  const handleAiAnalysis = async () => {
    if (!photo?.photo_url) {
      toast.error("No photo available for analysis");
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await api.post("/ai/analyze-image", { image_url: photo.photo_url });
      const rawText = response.data;
      setAiResponse(rawText);
      setExtractedData(parseAiResponse(rawText, photo.aoi));
      console.log(rawText);
      toast.success("AI Analysis Complete (with AOI Fallback)");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to run AI analysis");
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };




  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Failed to load photo details</h2>
        <Button variant="link" onClick={() => router.push("/editor/assigned-photos")}>
          Back to Assigned Photos
        </Button>
      </div>
    );
  }

  const handleReject = () => {
    if (!feedback.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    requestReupload.mutate(
      { id, reason: feedback },
      {
        onSuccess: () => {
          toast.success("Re-upload request sent successfully");
          router.push("/editor/assigned-photos");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to request re-upload");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-14 lg:top-16 z-20 bg-white border-b border-gray-200">
        <div className="px-4 py-3 lg:px-6 lg:py-4">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => router.push("/editor/assigned-photos")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assigned Photos
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold mb-1">{photo.aoi?.aoi_name || "Untitled AOI"}</h1>
              <p className="text-sm text-gray-600">
                Submitted by {photo.uploaded_by?.name || "Unknown"} • {new Date(photo.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Multi-Panel Layout */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_400px] gap-0 h-[calc(100vh-8rem)]">
        {/* Center Panel - Main Photo View */}
        <div className="bg-gray-900 flex flex-col items-center justify-center p-4">
          {photo.photo_url ? (
            <img
              src={photo.photo_url}
              alt={photo.photo_type}
              className="max-w-full max-h-[70vh] object-contain rounded-lg mb-4 shadow-2xl"
            />
          ) : (
            <div className="bg-gray-800 w-full max-w-2xl aspect-video rounded-lg mb-4 flex items-center justify-center text-gray-500">
              <ImageIcon className="w-12 h-12" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm">
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Panel - Review Form */}
        <div className="border-l border-gray-200 bg-white overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Photo Details</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Type: {photo.photo_type}</span>
                <Badge variant="secondary">
                  {photo.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">
                Location: {photo.latitude}, {photo.longitude}
              </p>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Survey Data</h3>
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">AI Powered</Badge>
              </div>

              <div className={`border rounded-xl p-6 text-center space-y-4 transition-all ${!extractedData
                ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                : "bg-gray-50 border-gray-100"
                }`}>
                {!extractedData && (
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-blue-100">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className={`font-semibold ${!extractedData ? "text-blue-900" : "text-gray-900 text-sm"}`}>
                    {extractedData ? "AI Analysis" : "AI Analysis Ready"}
                  </h4>
                  {!extractedData && (
                    <p className="text-xs text-blue-700/70">Analyze this photo automatically to extract business details and check compliance.</p>
                  )}
                </div>
                <Button
                  onClick={handleAiAnalysis}
                  disabled={isAiLoading}
                  variant={extractedData ? "outline" : "default"}
                  className={`w-full transition-all hover:scale-[1.02] active:scale-[0.98] ${!extractedData ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" : "h-8 text-[10px]"
                    }`}
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className={`mr-2 ${extractedData ? "w-3 h-3" : "w-4 h-4"}`} />
                      {extractedData ? "Re-run Analysis" : "Run AI Analysis"}
                    </>
                  )}
                </Button>
              </div>

              {extractedData && (
                <div className="space-y-4">
                  <div className="grid gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Business Name</Label>
                        <Input
                          value={extractedData.business_name}
                          onChange={(e) => setExtractedData({ ...extractedData, business_name: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Phone</Label>
                        <Input
                          value={extractedData.phone}
                          onChange={(e) => setExtractedData({ ...extractedData, phone: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Category</Label>
                        <Input
                          value={extractedData.business_category}
                          onChange={(e) => setExtractedData({ ...extractedData, business_category: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Sub Category</Label>
                        <Input
                          value={extractedData.business_sub_category}
                          onChange={(e) => setExtractedData({ ...extractedData, business_sub_category: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Alt Phone</Label>
                        <Input
                          value={extractedData.alternate_phone}
                          onChange={(e) => setExtractedData({ ...extractedData, alternate_phone: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Email</Label>
                        <Input
                          value={extractedData.email}
                          onChange={(e) => setExtractedData({ ...extractedData, email: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Website</Label>
                      <Input
                        value={extractedData.website}
                        onChange={(e) => setExtractedData({ ...extractedData, website: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Contact Person</Label>
                        <Input
                          value={extractedData.contact_person_name}
                          onChange={(e) => setExtractedData({ ...extractedData, contact_person_name: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Designation</Label>
                        <Input
                          value={extractedData.contact_person_designation}
                          onChange={(e) => setExtractedData({ ...extractedData, contact_person_designation: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Latitude</Label>
                        <Input
                          value={extractedData.latitude}
                          onChange={(e) => setExtractedData({ ...extractedData, latitude: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Longitude</Label>
                        <Input
                          value={extractedData.longitude}
                          onChange={(e) => setExtractedData({ ...extractedData, longitude: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Address Line 1</Label>
                      <Input
                        value={extractedData.address_line1}
                        onChange={(e) => setExtractedData({ ...extractedData, address_line1: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Address Line 2</Label>
                      <Input
                        value={extractedData.address_line2}
                        onChange={(e) => setExtractedData({ ...extractedData, address_line2: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Landmark</Label>
                        <Input
                          value={extractedData.landmark}
                          onChange={(e) => setExtractedData({ ...extractedData, landmark: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">City</Label>
                        <Input
                          value={extractedData.city}
                          onChange={(e) => setExtractedData({ ...extractedData, city: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">State</Label>
                        <Input
                          value={extractedData.state}
                          onChange={(e) => setExtractedData({ ...extractedData, state: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Pin Code</Label>
                        <Input
                          value={extractedData.pin_code}
                          onChange={(e) => setExtractedData({ ...extractedData, pin_code: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Country</Label>
                        <Input
                          value={extractedData.country}
                          onChange={(e) => setExtractedData({ ...extractedData, country: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 h-9"
                      onClick={() => {
                        submitForm.mutate({
                          aoi_id: photo.aoi_id,
                          form_type: "BUSINESS_DETAILS",
                          business_name: extractedData.business_name || "Not Provided",
                          business_category: extractedData.business_category,
                          business_sub_category: extractedData.business_sub_category,
                          phone: extractedData.phone,
                          alternate_phone: extractedData.alternate_phone,
                          email: extractedData.email,
                          website: extractedData.website,
                          contact_person_name: extractedData.contact_person_name,
                          contact_person_designation: extractedData.contact_person_designation,
                          latitude: parseFloat(extractedData.latitude) || 0,
                          longitude: parseFloat(extractedData.longitude) || 0,
                          address_line1: extractedData.address_line1 || "Not Provided",
                          address_line2: extractedData.address_line2,
                          landmark: extractedData.landmark,
                          city: extractedData.city || "Not Provided",
                          state: extractedData.state || "Not Provided",
                          pin_code: extractedData.pin_code || "Not Provided",
                          country: extractedData.country,
                          linked_photo_id: id
                        }, {
                          onSuccess: () => {
                            toast.success("Details saved successfully");
                            window.location.reload();
                          },
                          onError: (err: any) => {
                            toast.error(err.response?.data?.message || "Failed to save details");
                          }
                        });
                      }}
                      disabled={submitForm.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {submitForm.isPending ? "Saving..." : "Save Details"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExtractedData(null);
                        setAiResponse(null);
                      }}
                      className="px-3 h-9"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Review Decision</h3>
              <RadioGroup value={decision} onValueChange={setDecision}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <RadioGroupItem value="reject" id="reject" />
                    <Label htmlFor="reject" className="flex items-center gap-2 cursor-pointer flex-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Reject (Request Re-upload)
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="feedback">Feedback / Comments</Label>
              <Textarea
                id="feedback"
                placeholder="Provide feedback to the surveyor..."
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="space-y-2 pt-4">
              {decision === "reject" && (
                <Button
                  onClick={handleReject}
                  className="w-full"
                  variant="destructive"
                  disabled={requestReupload.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {requestReupload.isPending ? "Sending Request..." : "Reject & Request Re-upload"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Single Column Layout */}
      <div className="lg:hidden p-4 space-y-4">
        {/* Photo Viewer */}
        <Card>
          <CardContent className="p-0">
            <div className="bg-gray-900 border-b border-gray-100 overflow-hidden rounded-t-lg">
              {photo.photo_url ? (
                <img src={photo.photo_url} alt={photo.photo_type} className="w-full h-auto object-contain max-h-[60vh]" />
              ) : (
                <div className="aspect-video flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{photo.photo_type}</h3>
                <Badge variant="secondary">
                  {photo.status}
                </Badge>
              </div>
              <span className="text-sm text-gray-500 italic">
                Single photo review
              </span>
            </div>
          </CardContent>
        </Card>

        {/* AI Survey Data (Mobile) */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Survey Data</CardTitle>
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">AI Powered</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`border rounded-xl p-4 text-center space-y-3 transition-all ${!extractedData
                ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                : "bg-gray-50 border-gray-100"
                }`}>
                {!extractedData && (
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-blue-100">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className={`font-semibold ${!extractedData ? "text-blue-900" : "text-gray-900 text-sm"}`}>
                    {extractedData ? "AI Analysis" : "AI Analysis Ready"}
                  </h4>
                  {!extractedData && (
                    <p className="text-xs text-blue-700/70">Analyze business details automatically.</p>
                  )}
                </div>
                <Button
                  onClick={handleAiAnalysis}
                  disabled={isAiLoading}
                  variant={extractedData ? "outline" : "default"}
                  className={`w-full ${!extractedData ? "bg-blue-600 hover:bg-blue-700 text-white" : "h-8 text-[10px]"}`}
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className={`mr-2 ${extractedData ? "w-3 h-3" : "w-4 h-4"}`} />
                      {extractedData ? "Re-run Analysis" : "Run AI Analysis"}
                    </>
                  )}
                </Button>
              </div>

              {extractedData && (
                <div className="space-y-4">
                  <div className="grid gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Business Name</Label>
                        <Input
                          value={extractedData.business_name}
                          onChange={(e) => setExtractedData({ ...extractedData, business_name: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Phone</Label>
                        <Input
                          value={extractedData.phone}
                          onChange={(e) => setExtractedData({ ...extractedData, phone: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Category</Label>
                        <Input
                          value={extractedData.business_category}
                          onChange={(e) => setExtractedData({ ...extractedData, business_category: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Sub Category</Label>
                        <Input
                          value={extractedData.business_sub_category}
                          onChange={(e) => setExtractedData({ ...extractedData, business_sub_category: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Alt Phone</Label>
                      <Input
                        value={extractedData.alternate_phone}
                        onChange={(e) => setExtractedData({ ...extractedData, alternate_phone: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Email</Label>
                      <Input
                        value={extractedData.email}
                        onChange={(e) => setExtractedData({ ...extractedData, email: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Website</Label>
                      <Input
                        value={extractedData.website}
                        onChange={(e) => setExtractedData({ ...extractedData, website: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Contact Person</Label>
                        <Input
                          value={extractedData.contact_person_name}
                          onChange={(e) => setExtractedData({ ...extractedData, contact_person_name: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Designation</Label>
                        <Input
                          value={extractedData.contact_person_designation}
                          onChange={(e) => setExtractedData({ ...extractedData, contact_person_designation: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Latitude</Label>
                        <Input
                          value={extractedData.latitude}
                          onChange={(e) => setExtractedData({ ...extractedData, latitude: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Longitude</Label>
                        <Input
                          value={extractedData.longitude}
                          onChange={(e) => setExtractedData({ ...extractedData, longitude: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Address Line 1</Label>
                      <Input
                        value={extractedData.address_line1}
                        onChange={(e) => setExtractedData({ ...extractedData, address_line1: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Address Line 2</Label>
                      <Input
                        value={extractedData.address_line2}
                        onChange={(e) => setExtractedData({ ...extractedData, address_line2: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Landmark</Label>
                        <Input
                          value={extractedData.landmark}
                          onChange={(e) => setExtractedData({ ...extractedData, landmark: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">City</Label>
                        <Input
                          value={extractedData.city}
                          onChange={(e) => setExtractedData({ ...extractedData, city: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">State</Label>
                        <Input
                          value={extractedData.state}
                          onChange={(e) => setExtractedData({ ...extractedData, state: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Pin Code</Label>
                        <Input
                          value={extractedData.pin_code}
                          onChange={(e) => setExtractedData({ ...extractedData, pin_code: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Country</Label>
                      <Input
                        value={extractedData.country}
                        onChange={(e) => setExtractedData({ ...extractedData, country: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 h-9"
                      onClick={() => {
                        submitForm.mutate({
                          aoi_id: photo.aoi_id,
                          form_type: "BUSINESS_DETAILS",
                          business_name: extractedData.business_name || "Not Provided",
                          business_category: extractedData.business_category,
                          business_sub_category: extractedData.business_sub_category,
                          phone: extractedData.phone,
                          alternate_phone: extractedData.alternate_phone,
                          email: extractedData.email,
                          website: extractedData.website,
                          contact_person_name: extractedData.contact_person_name,
                          contact_person_designation: extractedData.contact_person_designation,
                          latitude: parseFloat(extractedData.latitude) || 0,
                          longitude: parseFloat(extractedData.longitude) || 0,
                          address_line1: extractedData.address_line1 || "Not Provided",
                          address_line2: extractedData.address_line2,
                          landmark: extractedData.landmark,
                          city: extractedData.city || "Not Provided",
                          state: extractedData.state || "Not Provided",
                          pin_code: extractedData.pin_code || "Not Provided",
                          country: extractedData.country,
                          linked_photo_id: id
                        }, {
                          onSuccess: () => {
                            toast.success("Details saved successfully");
                            window.location.reload();
                          },
                          onError: (err: any) => {
                            toast.error(err.response?.data?.message || "Failed to save details");
                          }
                        });
                      }}
                      disabled={submitForm.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {submitForm.isPending ? "Saving..." : "Save Details"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExtractedData(null);
                        setAiResponse(null);
                      }}
                      className="px-3 h-9"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>Review Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className={`p-4 rounded-lg flex items-center gap-3 border ${photo?.status === "APPROVED"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : photo?.status === "REJECTED"
                  ? "bg-rose-50 border-rose-100 text-rose-800"
                  : "bg-blue-50 border-blue-100 text-blue-800"
                }`}>
                {photo?.status === "APPROVED" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : photo?.status === "REJECTED" ? (
                  <XCircle className="w-5 h-5 text-rose-600" />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-600" />
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Current Status</p>
                  <p className="text-sm font-black">{photo?.status || "PENDING REVIEW"}</p>
                </div>
              </div>

              {(photo?.status === "PENDING" || photo?.status === "ASSIGNED" || photo?.status === "REJECTED") && (
                <RadioGroup value={decision} onValueChange={setDecision}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <RadioGroupItem value="reject" id="reject-mobile" />
                      <Label htmlFor="reject-mobile" className="flex items-center gap-2 cursor-pointer flex-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Reject (Request Re-upload)
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              )}
            </div>

            <div>
              <Label htmlFor="feedback-mobile">Feedback</Label>
              <Textarea
                id="feedback-mobile"
                placeholder="Provide feedback..."
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-2"
              />
            </div>

            {decision === "reject" && (
              <Button
                className="w-full"
                variant="destructive"
                onClick={handleReject}
                disabled={requestReupload.isPending}
              >
                {requestReupload.isPending ? "Sending Request..." : "Reject & Request Re-upload"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
