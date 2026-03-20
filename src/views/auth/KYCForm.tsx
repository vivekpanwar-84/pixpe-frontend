"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, Building, Landmark, CheckCircle, FileText, Upload, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { kycService } from "@/services/kyc.service";
import { toast } from "sonner";
import imageCompression from 'browser-image-compression';

const kycSchema = z.object({
    full_name: z.string().min(3, "Full name is required"),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pin_code: z.string().min(6, "Valid PIN code is required"),
    document_type: z.enum(["AADHAAR", "PAN", "DRIVING_LICENSE", "VOTER_ID"]),
    document_number: z.string().min(1, "Document number is required"),
    document_front_url: z.string().min(1, "Front document is required"),
    document_back_url: z.string().min(1, "Back document is required"),
    selfie_url: z.string().min(1, "Selfie is required"),
    bank_account_number: z.string().min(1, "Account number is required"),
    ifsc_code: z.string().min(1, "IFSC code is required"),
    bank_proof_url: z.string().min(1, "Bank proof is required"),
}).superRefine((data, ctx) => {
    // 1. Document Number Validation
    if (data.document_type === "AADHAAR") {
        if (!/^\d{12}$/.test(data.document_number)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Aadhaar must be exactly 12 digits",
                path: ["document_number"],
            });
        }
    } else if (data.document_type === "PAN") {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.document_number)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid PAN format (e.g., ABCDE1234F)",
                path: ["document_number"],
            });
        }
    } else if (data.document_type === "DRIVING_LICENSE") {
        if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11}$/.test(data.document_number)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid Driving License format (15 chars)",
                path: ["document_number"],
            });
        }
    } else if (data.document_type === "VOTER_ID") {
        if (!/^[A-Z]{3}[0-9]{7}$/.test(data.document_number)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid Voter ID format (e.g., ABC1234567)",
                path: ["document_number"],
            });
        }
    }

    // 2. Bank Account Number Validation
    if (data.bank_account_number) {
        if (!/^\d+$/.test(data.bank_account_number)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Account number must contain only digits",
                path: ["bank_account_number"],
            });
        } else if (data.bank_account_number.length < 9 || data.bank_account_number.length > 18) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Account number must be between 9 and 18 digits",
                path: ["bank_account_number"],
            });
        }
    }

    // 3. IFSC Code Validation
    if (data.ifsc_code) {
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifsc_code)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid IFSC format (e.g., ABCD0123456)",
                path: ["ifsc_code"],
            });
        }
    }
});

type KYCFormValues = z.infer<typeof kycSchema>;

// Internal FileUploader Component
const FileUploader = ({
    label,
    value,
    onChange,
    type,
    icon: Icon = Upload,
    accept = "image/*"
}: {
    label: string,
    value?: string,
    onChange: (url: string) => void,
    type: string,
    icon?: any,
    accept?: string
}) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading(`Uploading ${label}...`);

        try {
            let fileToUpload = file;
            console.log(`[KYCForm] Preparing ${label}:`, file.type, file.size);

            try {
                const options = {
                    maxSizeMB: 0.4,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true,
                    initialQuality: 0.7,
                    fileType: "image/webp" as any,
                };
                console.log(`[KYCForm] Compressing...`);
                const compressedFile = await imageCompression(file, options);
                fileToUpload = new File([compressedFile], `upload_${Date.now()}.webp`, { type: 'image/webp' });
                console.log(`[KYCForm] Compression success:`, fileToUpload.size);
            } catch (compError) {
                console.error(`[KYCForm] Compression failed, using original:`, compError);
            }

            const formData = new FormData();
            formData.append('file', fileToUpload);
            formData.append('type', type);

            console.log(`[KYCForm] Sending FormData with field "file" (${fileToUpload.name}, ${fileToUpload.type}) and "type" (${type})`);

            const result = await kycService.uploadKycDocument(fileToUpload, type);
            onChange(result.url);
            toast.success(`${label} uploaded!`, { id: toastId });
        } catch (error: any) {
            console.error(`[KYCForm] Error uploading ${label}:`, error);
            const responseData = error.response?.data;
            if (responseData) {
                console.error(`[KYCForm] Error response from backend:`, responseData);
            }
            const errorMessage = responseData?.message || error.message || "Unknown error";
            toast.error(`Error: ${errorMessage}`, { id: toastId });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div
                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer
                    ${value ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`}
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                ) : value ? (
                    <>
                        <img src={value} alt={label} className="w-full h-32 object-contain rounded" />
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-green-700 font-medium">Re-upload to change</span>
                    </>
                ) : (
                    <>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Select or Capture</span>
                        <span className="text-[10px] text-gray-400">Max 400KB • WEBP</span>
                    </>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={accept}
                    onChange={handleUpload}
                    capture={type === 'SELFIE' ? 'user' : undefined}
                />
            </div>
        </div>
    );
};

export default function KYCForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showSelfieCamera, setShowSelfieCamera] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<KYCFormValues>({
        resolver: zodResolver(kycSchema),
        defaultValues: {
            document_type: "AADHAAR",
        }
    });

    const onSubmit = async (data: KYCFormValues) => {
        setLoading(true);
        try {
            await kycService.submitKYC(data);
            toast.success("KYC submitted successfully!");
            router.push("/kyc-status");
        } catch (error: any) {
            const errorData = error.response?.data;
            const message = typeof errorData === 'object' && errorData?.message 
                ? (Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message)
                : (error.message || "Failed to submit KYC");
                
            toast.error(`Submission Error: ${message}`);
            console.error("Full KYC Error Details:", errorData || error);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = async () => {
        let fieldsToValidate: (keyof KYCFormValues)[] = [];
        if (step === 1) {
            fieldsToValidate = ["full_name", "date_of_birth", "address", "city", "state", "pin_code"];
        } else if (step === 2) {
            fieldsToValidate = ["document_type", "document_number", "document_front_url", "document_back_url", "selfie_url"];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setStep(step + 1);
        } else {
            toast.error("Please fill all required fields correctly");
        }
    };

    const prevStep = () => setStep(step - 1);

    const startCamera = async () => {
        setShowSelfieCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            toast.error("Camera access denied");
            setShowSelfieCamera(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setShowSelfieCamera(false);
    };

    const captureSelfie = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            if (!blob) return;

            const toastId = toast.loading("Processing selfie...");
            try {
                const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                const options = {
                    maxSizeMB: 0.4,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true,
                    initialQuality: 0.7,
                    fileType: "image/webp" as any,
                };
                const compressedFile = await imageCompression(file, options);
                const result = await kycService.uploadKycDocument(compressedFile, 'SELFIE');
                setValue("selfie_url", result.url);
                toast.success("Selfie captured!", { id: toastId });
                stopCamera();
            } catch (error) {
                toast.error("Failed to process selfie", { id: toastId });
            }
        }, 'image/jpeg', 0.8);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">KYC Verification</h1>
                        <p className="text-gray-500 mt-1">Complete your profile to start using Pixpe</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                        <span>Step {step} of 3</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                        Personal Details
                                    </CardTitle>
                                    <CardDescription>Basic information about yourself</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">Full Name (as per ID)</Label>
                                        <Input id="full_name" {...register("full_name")} placeholder="John Doe" />
                                        {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                                        <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
                                        {errors.date_of_birth && <p className="text-xs text-red-500">{errors.date_of_birth.message}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input id="address" {...register("address")} placeholder="123 Street Name" />
                                        {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" {...register("city")} placeholder="New York" />
                                        {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input id="state" {...register("state")} placeholder="NY" />
                                        {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pin_code">PIN / Zip Code</Label>
                                        <Input id="pin_code" {...register("pin_code")} placeholder="10001" maxLength={6} />
                                        {errors.pin_code && <p className="text-xs text-red-500">{errors.pin_code.message}</p>}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="button" onClick={nextStep} className="ml-auto bg-blue-600 hover:bg-blue-700">Next Step</Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Identity Verification
                                    </CardTitle>
                                    <CardDescription>Upload your legal identification documents</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Document Type</Label>
                                            <Select
                                                onValueChange={(v) => setValue("document_type", v as any)}
                                                defaultValue={watch("document_type")}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="AADHAAR">Aadhaar Card</SelectItem>
                                                    <SelectItem value="PAN">PAN Card</SelectItem>
                                                    <SelectItem value="DRIVING_LICENSE">Driving License</SelectItem>
                                                    <SelectItem value="VOTER_ID">Voter ID</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="document_number">Document Number</Label>
                                            <Input id="document_number" {...register("document_number")} placeholder="Enter ID number" />
                                            {errors.document_number && <p className="text-xs text-red-500">{errors.document_number.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FileUploader
                                            label="Document Front"
                                            type="DOC_FRONT"
                                            value={watch("document_front_url")}
                                            onChange={(url) => setValue("document_front_url", url)}
                                        />
                                        <FileUploader
                                            label="Document Back"
                                            type="DOC_BACK"
                                            value={watch("document_back_url")}
                                            onChange={(url) => setValue("document_back_url", url)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Selfie Photo</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5"
                                                onClick={startCamera}
                                            >
                                                <Camera className="w-3.5 h-3.5" />
                                                Use Camera
                                            </Button>
                                        </div>
                                        <FileUploader
                                            label="Selfie Photo"
                                            type="SELFIE"
                                            value={watch("selfie_url")}
                                            onChange={(url) => setValue("selfie_url", url)}
                                            icon={Camera}
                                        />
                                        {errors.selfie_url && <p className="text-xs text-red-500 text-center">{errors.selfie_url.message}</p>}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                                    <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">Next Step</Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Landmark className="w-5 h-5 text-blue-600" />
                                        Banking Details
                                    </CardTitle>
                                    <CardDescription>To process your payments and rewards</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="bank_account_number">Account Number</Label>
                                            <Input id="bank_account_number" {...register("bank_account_number")} placeholder="000000000000" />
                                            {errors.bank_account_number && <p className="text-xs text-red-500">{errors.bank_account_number.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ifsc_code">IFSC Code / Routing Number</Label>
                                            <Input id="ifsc_code" {...register("ifsc_code")} placeholder="ABCD0123456" />
                                            {errors.ifsc_code && <p className="text-xs text-red-500">{errors.ifsc_code.message}</p>}
                                        </div>
                                    </div>

                                    <FileUploader
                                        label="Bank Proof (Cancel Cheque/Passbook)"
                                        type="BANK_PROOF"
                                        value={watch("bank_proof_url")}
                                        onChange={(url) => setValue("bank_proof_url", url)}
                                    />
                                    {errors.bank_proof_url && <p className="text-xs text-red-500">{errors.bank_proof_url.message}</p>}

                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-900">
                                            <p className="font-semibold">Declaration</p>
                                            <p className="opacity-80">I hereby declare that the information provided above is true and correct to the best of my knowledge.</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit KYC"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </form>
            </div>

            {/* Camera Dialog Overlay */}
            <AnimatePresence>
                {showSelfieCamera && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    >
                        <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center bg-white">
                                <h3 className="font-bold">Capture Selfie</h3>
                                <Button variant="ghost" size="icon" onClick={stopCamera}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="relative aspect-square bg-gray-900 overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                                <div className="absolute inset-0 border-[30px] border-black/20 rounded-full scale-90 pointer-events-none"></div>
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <div className="p-6 bg-white border-t flex flex-col gap-4">
                                <p className="text-xs text-center text-gray-500">
                                    Align your face within the circle and click capture.
                                </p>
                                <Button
                                    onClick={captureSelfie}
                                    size="lg"
                                    className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-lg gap-2"
                                >
                                    <Camera className="w-5 h-5" />
                                    Capture Photo
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
