"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, Building, Landmark, CheckCircle, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { kycService } from "@/services/kyc.service";
import { toast } from "sonner";

const kycSchema = z.object({
    full_name: z.string().min(3, "Full name is required"),
    date_of_birth: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pin_code: z.string().optional(),
    document_type: z.enum(["AADHAAR", "PAN", "DRIVING_LICENSE", "VOTER_ID"]),
    document_number: z.string().min(5, "Document number is required"),
    document_front_url: z.string().optional(),
    document_back_url: z.string().optional(),
    selfie_url: z.string().optional(),
    bank_account_number: z.string().optional(),
    ifsc_code: z.string().optional(),
    bank_proof_url: z.string().optional(),
});

type KYCFormValues = z.infer<typeof kycSchema>;

export default function KYCForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<KYCFormValues>({
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
            toast.error(error.message || "Failed to submit KYC");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

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
                            <Card>
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
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input id="address" {...register("address")} placeholder="123 Street Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" {...register("city")} placeholder="New York" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input id="state" {...register("state")} placeholder="NY" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pin_code">PIN / Zip Code</Label>
                                        <Input id="pin_code" {...register("pin_code")} placeholder="10001" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="button" onClick={nextStep} className="ml-auto">Next Step</Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card>
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
                                        <div className="space-y-2">
                                            <Label>Document Front (URL)</Label>
                                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                                                <Input {...register("document_front_url")} placeholder="https://image-url.com/front.jpg" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Document Back (URL)</Label>
                                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                                                <Input {...register("document_back_url")} placeholder="https://image-url.com/back.jpg" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-center border-2 border-dashed border-gray-200 rounded-lg p-6">
                                        <Label className="block mb-2">Selfie Photo (URL)</Label>
                                        <Input {...register("selfie_url")} placeholder="https://image-url.com/selfie.jpg" />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                                    <Button type="button" onClick={nextStep}>Next Step</Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card>
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
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ifsc_code">IFSC Code / Routing Number</Label>
                                            <Input id="ifsc_code" {...register("ifsc_code")} placeholder="ABCD0123456" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bank Proof (Cancel Cheque/Passbook URL)</Label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                                            <Input {...register("bank_proof_url")} placeholder="https://image-url.com/bank.jpg" />
                                        </div>
                                    </div>

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
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit KYC Documents"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </form>
            </div>
        </div>
    );
}
