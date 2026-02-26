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
  owner_name: string;
  phone: string;
  address: string;
  city: string;
  categories: string[]; // Array
  details: string;
  timings: string;
  days_open: string[]; // Array
  gst_number: string;
}

export default function PhotoReview() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { useAssignedPhotoDetails, requestReupload, submitForm } = useEditor();
  const { data: photo, isLoading, error } = useAssignedPhotoDetails(id);

  const [decision, setDecision] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const parseAiResponse = (text: string): ExtractedData => {
    const getValue = (label: string) => {
      // Improved regex to handle labels with special characters like (s)
      const regex = new RegExp(`${label}:?\\s*(.*?)(?=\\n(?:Business Name|Owner Name\\(s\\)|Phone Number\\(s\\)|Address|City|Business Category|Basic Business Details):|$)`, 'is');
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    };

    return {
      business_name: getValue("Business Name"),
      owner_name: getValue("Owner Name\\(s\\)"),
      phone: getValue("Phone Number\\(s\\)"),
      address: getValue("Address"),
      city: getValue("City"),
      categories: getValue("Business Category").split(",").map(s => s.trim()).filter(Boolean),
      details: getValue("Basic Business Details"),
      timings: "",
      days_open: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      gst_number: "",
    };
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
      setExtractedData(parseAiResponse(rawText));
      console.log(rawText);
      toast.success("AI Analysis Complete");
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

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Survey Data</h3>
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">AI Powered</Badge>
              </div>

              {!extractedData ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-blue-100">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-blue-900">AI Analysis Ready</h4>
                    <p className="text-xs text-blue-700/70">Analyze this photo automatically to extract business details and check compliance.</p>
                  </div>
                  <Button
                    onClick={handleAiAnalysis}
                    disabled={isAiLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Run AI Analysis
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Business Name</Label>
                      <Input
                        value={extractedData.business_name}
                        onChange={(e) => setExtractedData({ ...extractedData, business_name: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Owner Name</Label>
                      <Input
                        value={extractedData.owner_name}
                        onChange={(e) => setExtractedData({ ...extractedData, owner_name: e.target.value })}
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
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Address</Label>
                      <Input
                        value={extractedData.address}
                        onChange={(e) => setExtractedData({ ...extractedData, address: e.target.value })}
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
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Categories (comma separated)</Label>
                      <Input
                        value={extractedData.categories.join(", ")}
                        onChange={(e) => setExtractedData({ ...extractedData, categories: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">Timings</Label>
                        <Input
                          value={extractedData.timings}
                          onChange={(e) => setExtractedData({ ...extractedData, timings: e.target.value })}
                          className="h-8 text-sm"
                          placeholder="9 AM - 9 PM"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-gray-400">GST Number</Label>
                        <Input
                          value={extractedData.gst_number}
                          onChange={(e) => setExtractedData({ ...extractedData, gst_number: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-gray-400">Days Open</Label>
                      <div className="flex flex-wrap gap-1">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                          <Badge
                            key={day}
                            variant={extractedData.days_open.includes(day) ? "default" : "outline"}
                            className="text-[10px] px-2 py-0 cursor-pointer h-6"
                            onClick={() => {
                              const nextDays = extractedData.days_open.includes(day)
                                ? extractedData.days_open.filter(d => d !== day)
                                : [...extractedData.days_open, day];
                              setExtractedData({ ...extractedData, days_open: nextDays });
                            }}
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Details</Label>
                      <Textarea
                        value={extractedData.details}
                        onChange={(e) => setExtractedData({ ...extractedData, details: e.target.value })}
                        className="text-sm min-h-[60px]"
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
                          form_data: {
                            business_name: extractedData.business_name,
                            owner_name: extractedData.owner_name,
                            categories: extractedData.categories,
                            timings: extractedData.timings,
                            days_open: extractedData.days_open,
                            phone: extractedData.phone,
                            gst_number: extractedData.gst_number,
                            address: extractedData.address,
                            city: extractedData.city,
                            details: extractedData.details
                          },
                          linked_photo_id: id
                        }, {
                          onSuccess: () => {
                            toast.success("Details saved successfully");
                            setExtractedData(null);
                            setAiResponse(null);
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
            {!extractedData ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 text-center space-y-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-blue-100">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-blue-900">AI Analysis Ready</h4>
                  <p className="text-xs text-blue-700/70">Analyze business details automatically.</p>
                </div>
                <Button
                  onClick={handleAiAnalysis}
                  disabled={isAiLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-gray-400">Business Name</Label>
                    <Input
                      value={extractedData.business_name}
                      onChange={(e) => setExtractedData({ ...extractedData, business_name: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-gray-400">Owner Name</Label>
                    <Input
                      value={extractedData.owner_name}
                      onChange={(e) => setExtractedData({ ...extractedData, owner_name: e.target.value })}
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
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-gray-400">Address</Label>
                    <Input
                      value={extractedData.address}
                      onChange={(e) => setExtractedData({ ...extractedData, address: e.target.value })}
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
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-gray-400">Categories (comma separated)</Label>
                    <Input
                      value={extractedData.categories.join(", ")}
                      onChange={(e) => setExtractedData({ ...extractedData, categories: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">Timings</Label>
                      <Input
                        value={extractedData.timings}
                        onChange={(e) => setExtractedData({ ...extractedData, timings: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="9 AM - 9 PM"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-gray-400">GST Number</Label>
                      <Input
                        value={extractedData.gst_number}
                        onChange={(e) => setExtractedData({ ...extractedData, gst_number: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-gray-400">Days Open</Label>
                    <div className="flex flex-wrap gap-1">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                        <Badge
                          key={day}
                          variant={extractedData.days_open.includes(day) ? "default" : "outline"}
                          className="text-[10px] px-2 py-0 cursor-pointer h-6"
                          onClick={() => {
                            const nextDays = extractedData.days_open.includes(day)
                              ? extractedData.days_open.filter(d => d !== day)
                              : [...extractedData.days_open, day];
                            setExtractedData({ ...extractedData, days_open: nextDays });
                          }}
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-gray-400">Details</Label>
                    <Textarea
                      value={extractedData.details}
                      onChange={(e) => setExtractedData({ ...extractedData, details: e.target.value })}
                      className="text-sm min-h-[60px]"
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
                        form_data: {
                          business_name: extractedData.business_name,
                          owner_name: extractedData.owner_name,
                          categories: extractedData.categories,
                          timings: extractedData.timings,
                          days_open: extractedData.days_open,
                          phone: extractedData.phone,
                          gst_number: extractedData.gst_number,
                          address: extractedData.address,
                          city: extractedData.city,
                          details: extractedData.details
                        },
                        linked_photo_id: id
                      }, {
                        onSuccess: () => {
                          toast.success("Details saved successfully");
                          setExtractedData(null);
                          setAiResponse(null);
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
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>Review Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
