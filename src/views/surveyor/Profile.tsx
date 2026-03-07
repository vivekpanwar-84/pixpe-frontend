"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Award, Camera, Settings, LogOut, Bell, Shield, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { ImageWithLoader } from "@/components/ImageWithLoader";

export default function SurveyorProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [kycFile, setKycFile] = useState<File | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile();
      setUser(data);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setKycFile(e.target.files[0]);
    }
  };

  const handleKycUpload = async () => {
    if (!kycFile) return;

    setSubmitting(true);
    try {
      await userService.submitKyc(kycFile);
      toast.success("KYC document submitted successfully!");
      setIsKycDialogOpen(false);
      setKycFile(null);
      loadProfile(); // Refresh to show pending status
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const kycStatus = user?.kyc_status?.toLowerCase() || "pending";

  const stats = [
    { label: "Surveys Completed", value: "156" },
    { label: "Total Earnings", value: "$12,450" },
    { label: "Approval Rate", value: "95%" },
    { label: "Current Streak", value: "12 days" },
  ];

  const achievements = [
    { icon: Award, title: "Top Performer", description: "Ranked #5 this month" },
    { icon: Camera, title: "Quality Expert", description: "95% photo approval rate" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              {user?.profile_photo ? (
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <ImageWithLoader
                    src={user.profile_photo}
                    alt={user.name}
                    showViewFull={false}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">{user?.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <Badge variant="default">{user?.role?.name || 'Surveyor'}</Badge>
                <Badge variant="outline">ID: {user?.id?.slice(0, 8)}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Phone className="w-4 h-4" />
                  <span>{user?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <MapPin className="w-4 h-4" />
                  <span>{user?.location || 'Location hidden'}</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <User className="w-4 h-4" />
                  <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="hidden md:flex">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="bg-white p-3 rounded-full">
                  <achievement.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KYC Status Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            KYC Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Identity Verification</h3>
              <p className="text-sm text-gray-600">
                {kycStatus === "approved"
                  ? "Your identity has been verified."
                  : kycStatus === "submitted"
                    ? "Your document is under review."
                    : kycStatus === "rejected"
                      ? "Your document was rejected. Please re-upload."
                      : "Upload a government-issued ID to verify your identity."}
              </p>
            </div>
            {kycStatus === "approved" && (
              <Badge className="bg-green-600">Verified</Badge>
            )}
            {kycStatus === "submitted" && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
            )}
            {kycStatus === "pending" && (
              <Badge variant="outline" className="text-gray-500">Not Submitted</Badge>
            )}
            {kycStatus === "rejected" && (
              <div className="flex flex-col items-end gap-1">
                <Badge variant="destructive">Rejected</Badge>
                {user?.kyc_rejected_reason && (
                  <p className="text-[10px] text-red-500 max-w-[200px] text-right font-medium">Reason: {user.kyc_rejected_reason}</p>
                )}
              </div>
            )}
            {(kycStatus === "pending" || kycStatus === "rejected") && (
              <Dialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant={kycStatus === "rejected" ? "destructive" : "default"}>
                    {kycStatus === "rejected" ? "Re-upload ID" : "Upload ID"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Identity Document</DialogTitle>
                    <DialogDescription>
                      Please upload a clear photo of your government-issued ID (Driver's License, Passport, etc).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="kyc-doc">Document Image</Label>
                      <Input id="kyc-doc" type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    {kycFile && (
                      <div className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        File selected: {kycFile.name}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsKycDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleKycUpload} disabled={!kycFile || submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit for Review
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings section remains similar or can be updated as needed */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <Label htmlFor="notifications" className="font-medium">Push Notifications</Label>
                <p className="text-sm text-gray-600">Receive alerts for new surveys</p>
              </div>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <Label htmlFor="location" className="font-medium">Location Services</Label>
                <p className="text-sm text-gray-600">Enable GPS for survey tracking</p>
              </div>
            </div>
            <Switch id="location" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <Label htmlFor="privacy" className="font-medium">Data Privacy</Label>
                <p className="text-sm text-gray-600">Control your data sharing</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Manage</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" size="lg" onClick={() => router.push("/")}>
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
