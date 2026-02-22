"use client";
import { useEffect, useState } from "react";
import { Bell, Mail, Shield, Database, Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any[]>([]);
  const [savingSettings, setSavingSettings] = useState<Record<string, boolean>>({});

  const fetchSettings = async () => {
    try {
      const data = await adminService.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      toast.error("Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key: string, value: string) => {
    setSavingSettings(prev => ({ ...prev, [key]: true }));
    try {
      await adminService.updateSystemSettings({ key, value });
      toast.success(`${key.replace(/_/g, ' ')} updated successfully`);
      fetchSettings(); // Refresh
    } catch (error) {
      console.error("Error updating setting:", error);
      toast.error("Failed to update setting");
    } finally {
      setSavingSettings(prev => ({ ...prev, [key]: false }));
    }
  };

  const getSettingValue = (key: string) => {
    return settings.find(s => s.setting_key === key)?.setting_value || "";
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">System Settings</h1>
        <p className="text-gray-600">Configure system preferences</p>
      </div>

      <Tabs defaultValue="rewards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rewards">Reward Rates</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Reward Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label htmlFor="REWARD_PER_PHOTO" className="font-medium text-base">Reward per Photo (₹)</Label>
                    <p className="text-sm text-gray-600">Amount paid to surveyor for each approved photo</p>
                  </div>
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <Input
                      id="REWARD_PER_PHOTO"
                      type="number"
                      defaultValue={getSettingValue("REWARD_PER_PHOTO")}
                      onBlur={(e) => handleUpdateSetting("REWARD_PER_PHOTO", e.target.value)}
                    />
                    {savingSettings["REWARD_PER_PHOTO"] && <Loader2 className="w-4 h-4 animate-spin" />}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label htmlFor="REWARD_PER_POI" className="font-medium text-base">Reward per POI (₹)</Label>
                    <p className="text-sm text-gray-600">Amount paid for each successfully completed POI</p>
                  </div>
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <Input
                      id="REWARD_PER_POI"
                      type="number"
                      defaultValue={getSettingValue("REWARD_PER_POI") || "50"}
                      onBlur={(e) => handleUpdateSetting("REWARD_PER_POI", e.target.value)}
                    />
                    {savingSettings["REWARD_PER_POI"] && <Loader2 className="w-4 h-4 animate-spin" />}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5" /> {/* Placeholder icon */}
                Application Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="APP_NAME">Application Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="APP_NAME"
                    defaultValue={getSettingValue("APP_NAME") || "Pixpe"}
                  />
                  <Button onClick={() => {
                    const val = (document.getElementById("APP_NAME") as HTMLInputElement).value;
                    handleUpdateSetting("APP_NAME", val);
                  }}>
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="MAINTENANCE_MODE" className="font-medium">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Restrict access for maintenance</p>
                </div>
                <Switch
                  id="MAINTENANCE_MODE"
                  checked={getSettingValue("MAINTENANCE_MODE") === "true"}
                  onCheckedChange={(checked) => handleUpdateSetting("MAINTENANCE_MODE", checked.toString())}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
