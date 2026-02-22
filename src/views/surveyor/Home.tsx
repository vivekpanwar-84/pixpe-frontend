"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MapPin, Camera, CircleCheck as CheckCircle, DollarSign, TrendingUp, Award, CircleAlert as AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { surveyorService } from "@/services/surveyor.service";
import { userService } from "@/services/user.service";

export default function SurveyorHome() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [kpis, setKpis] = useState([
    { icon: MapPin, label: "Active AOIs", value: "0", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Camera, label: "Photos Today", value: "0", color: "text-green-600", bg: "bg-green-50" },
    { icon: CheckCircle, label: "Completed", value: "0", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: DollarSign, label: "Today's Earnings", value: "₹0", color: "text-orange-600", bg: "bg-orange-50" },
  ]);

  const [recentAOIs, setRecentAOIs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, aois, uploads, earnings] = await Promise.all([
          userService.getProfile(),
          surveyorService.getAssignedAois(),
          surveyorService.getMyUploads(),
          surveyorService.getEarnings(),
        ]);

        setProfile(profileData);

        // Filter photos uploaded today
        const today = new Date().toDateString();
        const photosToday = uploads.filter((u: any) => new Date(u.createdAt).toDateString() === today).length;

        // Calculate completed AOIs
        const completedAois = aois.filter((a: any) => a.status === 'CLOSED' || a.status === 'SUBMITTED').length;

        // Today's earnings (simplified for now, ideally backend provides this)
        const dailyEarnings = earnings.stats?.today || 0;

        setKpis([
          { icon: MapPin, label: "Active AOIs", value: aois.length.toString(), color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Camera, label: "Photos Today", value: photosToday.toString(), color: "text-green-600", bg: "bg-green-50" },
          { icon: CheckCircle, label: "Completed", value: completedAois.toString(), color: "text-purple-600", bg: "bg-purple-50" },
          { icon: DollarSign, label: "Today's Earnings", value: `₹${dailyEarnings}`, color: "text-orange-600", bg: "bg-orange-50" },
        ]);

        setRecentAOIs(aois.slice(0, 3));
      } catch (error) {
        console.error("Error fetching surveyor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const achievements = [
    { icon: TrendingUp, title: "Rising Star", description: "Completed 50+ surveys" },
    { icon: Award, title: "Quality Expert", description: "95% approval rate" },
  ];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">Welcome back, {profile?.name || 'Surveyor'}!</h1>
        <p className="text-gray-600">Here's your Pixpe progress for today</p>
      </motion.div>

      {/* KPI Cards - Mobile: Stack, Tablet+: Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className={`${kpi.bg} p-2 rounded-lg`}>
                    <kpi.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${kpi.color}`} />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-bold mb-1">{kpi.value}</div>
                <div className="text-xs lg:text-sm text-gray-600">{kpi.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions - Horizontal scroll on mobile, grid on desktop */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/surveyor/aoi">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                <span className="text-sm">View AOIs</span>
              </Button>
            </Link>
            <Link href="/surveyor/aoi">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Camera className="w-6 h-6 text-green-600" />
                <span className="text-sm">Quick Capture</span>
              </Button>
            </Link>
            <Link href="/surveyor/earnings">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <DollarSign className="w-6 h-6 text-orange-600" />
                <span className="text-sm">View Earnings</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <span className="text-sm">Report Issue</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent AOIs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent AOIs</CardTitle>
          <Link href="/surveyor/aoi">
            <Button variant="link" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAOIs.length > 0 ? (
              recentAOIs.map((aoi) => (
                <Link key={aoi.id} href={`/surveyor/aoi/${aoi.id}`}>
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{aoi.aoi_name}</h3>
                        <p className="text-sm text-gray-600">
                          {aoi.city}, {aoi.state}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={aoi.status === "CLOSED" ? "default" : "secondary"}>
                          {aoi.status.replace('_', ' ')}
                        </Badge>
                        <Badge
                          variant={
                            aoi.priority === "HIGH" ? "destructive" :
                              aoi.priority === "MEDIUM" ? "secondary" : "outline"
                          }
                        >
                          {aoi.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No assigned AOIs found.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Your Achievements</CardTitle>
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
      </div>
    </div>
  );
}
