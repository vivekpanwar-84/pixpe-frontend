"use client";
import { useState, useEffect } from "react";
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

const businessFormSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  owner_name: z.string().min(2, "Owner name is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  timings: z.string().min(2, "Operating hours are required"),
  days_open: z.array(z.string()).min(1, "At least one day must be selected"),
  phone: z.string().min(10, "Valid phone number is required"),
  gst_number: z.string().optional(),
});

type BusinessFormData = z.infer<typeof businessFormSchema>;

export default function PhotoReview() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { useAssignedPhotoDetails, requestReupload, submitForm } = useEditor();
  const { data: photo, isLoading, error } = useAssignedPhotoDetails(id);

  const [decision, setDecision] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      business_name: "",
      owner_name: "",
      categories: [],
      timings: "",
      days_open: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      phone: "",
      gst_number: ""
    }
  });

  const formValues = watch();

  // AI Analysis States
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiStep, setAiStep] = useState<"loading" | "form">("loading");

  useEffect(() => {
    if (photo) {
      reset({
        business_name: photo.poi?.business_name || "",
        owner_name: "",
        categories: photo.poi?.category ? photo.poi.category.split(",").map((c: string) => c.trim()) : [],
        timings: photo.poi?.operating_hours || "",
        days_open: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        phone: photo.poi?.phone || "",
        gst_number: ""
      });
    }
  }, [photo, reset]);

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
              <h1 className="text-xl lg:text-2xl font-bold mb-1">{photo.poi?.business_name || "Untitled POI"}</h1>
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

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-blue-100">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-blue-900">AI Analysis Ready</h4>
                  <p className="text-xs text-blue-700/70">Analyze this photo automatically to extract business details and check compliance.</p>
                </div>
                <Button
                  onClick={() => {
                    setIsAiDialogOpen(true);
                    setAiStep("loading");
                    setTimeout(() => setAiStep("form"), 3000);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run AI Analysis
                </Button>
              </div>
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

      {/* AI Analysis Modal */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Analysis
            </DialogTitle>
          </DialogHeader>

          {aiStep === "loading" ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 animate-ping bg-blue-100 rounded-full"></div>
                <div className="relative bg-white p-4 rounded-full border border-blue-100 shadow-sm">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-gray-900 text-lg">Analyzing AI Data...</p>
                <p className="text-sm text-gray-500">Detecting business name, category, and operating status...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Analysis complete. Please verify the extracted information.
              </div>

              <form onSubmit={handleSubmit((data) => {
                submitForm.mutate({
                  poi_id: photo.poi?.id,
                  form_type: "BUSINESS_DETAILS",
                  form_data: data,
                  linked_photo_id: id
                }, {
                  onSuccess: () => {
                    toast.success("Business details saved successfully");
                    setIsAiDialogOpen(false);
                  },
                  onError: (err: any) => {
                    toast.error(err.response?.data?.message || "Failed to save details");
                  }
                });
              })}>
                <div className="grid gap-4 max-h-[60vh] overflow-y-auto px-1">
                  <div className="space-y-2">
                    <Label htmlFor="ai-business-name">Business Name</Label>
                    <Input
                      id="ai-business-name"
                      {...register("business_name")}
                      className={`border-blue-100 focus:border-blue-500 ${errors.business_name ? "border-red-500" : ""}`}
                    />
                    {errors.business_name && <p className="text-xs text-red-500">{errors.business_name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-owner-name">Owner Name</Label>
                    <Input
                      id="ai-owner-name"
                      {...register("owner_name")}
                      className={`border-blue-100 focus:border-blue-500 ${errors.owner_name ? "border-red-500" : ""}`}
                    />
                    {errors.owner_name && <p className="text-xs text-red-500">{errors.owner_name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-categories">Categories (comma separated)</Label>
                    <Input
                      id="ai-categories"
                      placeholder="e.g. Restaurant, Bakery"
                      value={formValues.categories?.join(", ")}
                      onChange={(e) => setValue("categories", e.target.value.split(",").map(c => c.trim()).filter(c => c), { shouldValidate: true })}
                      className={`border-blue-100 focus:border-blue-500 ${errors.categories ? "border-red-500" : ""}`}
                    />
                    {errors.categories && <p className="text-xs text-red-500">{errors.categories.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-phone">Phone</Label>
                      <Input
                        id="ai-phone"
                        {...register("phone")}
                        className={`border-blue-100 focus:border-blue-500 ${errors.phone ? "border-red-500" : ""}`}
                      />
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ai-gst">GST Number</Label>
                      <Input
                        id="ai-gst"
                        {...register("gst_number")}
                        className={`border-blue-100 focus:border-blue-500 ${errors.gst_number ? "border-red-500" : ""}`}
                      />
                      {errors.gst_number && <p className="text-xs text-red-500">{errors.gst_number.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-timings">Timings</Label>
                    <Input
                      id="ai-timings"
                      {...register("timings")}
                      className={`border-blue-100 focus:border-blue-500 ${errors.timings ? "border-red-500" : ""}`}
                    />
                    {errors.timings && <p className="text-xs text-red-500">{errors.timings.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="block mb-2">Days Open</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                        <Badge
                          key={day}
                          variant={formValues.days_open?.includes(day) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => {
                            const currentDays = formValues.days_open || [];
                            const nextDays = currentDays.includes(day)
                              ? currentDays.filter((d: string) => d !== day)
                              : [...currentDays, day];
                            setValue("days_open", nextDays, { shouldValidate: true });
                          }}
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                    {errors.days_open && <p className="text-xs text-red-500">{errors.days_open.message}</p>}
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={submitForm.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {submitForm.isPending ? "Saving..." : "Save and Use Details"}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
