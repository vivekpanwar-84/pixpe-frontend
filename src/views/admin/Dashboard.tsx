"use client";
import { motion } from "motion/react";
import { Users, MapPin, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const kpis = [
    { icon: Users, label: "Total Users", value: "156", change: "+12", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: MapPin, label: "Active AOIs", value: "42", change: "+5", color: "text-green-600", bg: "bg-green-50" },
    { icon: DollarSign, label: "Monthly Revenue", value: "$45.2K", change: "+8%", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Activity, label: "System Uptime", value: "99.9%", change: "", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const growthData = [
    { month: "Jan", users: 120, aois: 30, surveys: 1200 },
    { month: "Feb", users: 135, aois: 35, surveys: 1450 },
    { month: "Mar", users: 145, aois: 38, surveys: 1680 },
    { month: "Apr", users: 150, aois: 40, surveys: 1750 },
    { month: "May", users: 152, aois: 41, surveys: 1890 },
    { month: "Jun", users: 156, aois: 42, surveys: 2100 },
  ];

  const recentActivities = [
    { user: "John Smith", action: "Completed survey", time: "5 min ago", type: "success" },
    { user: "Admin Team", action: "Created new AOI", time: "1 hour ago", type: "info" },
    { user: "Sarah Johnson", action: "Reached milestone", time: "2 hours ago", type: "success" },
    { user: "System", action: "Backup completed", time: "3 hours ago", type: "info" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 lg:p-6">
              <div className={`${kpi.bg} p-2 rounded-lg w-fit mb-3`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-bold">{kpi.value}</span>
                {kpi.change && (
                  <Badge variant="secondary" className="text-xs">
                    {kpi.change}
                  </Badge>
                )}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 mt-1">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="aois" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === "success" ? "bg-green-600" : "bg-blue-600"}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
