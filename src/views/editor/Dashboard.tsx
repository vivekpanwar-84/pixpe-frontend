"use client";
import { useMemo } from "react";
import { motion } from "motion/react";
import { Image as ImageIcon, CircleCheck as CheckCircle, CircleX as XCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function EditorDashboard() {
  const kpis = useMemo(() => [
    { icon: ImageIcon, label: "Pending Review", value: "145", color: "text-orange-600", bg: "bg-orange-50" },
    { icon: CheckCircle, label: "Approved Today", value: "89", color: "text-green-600", bg: "bg-green-50" },
    { icon: XCircle, label: "Rejected", value: "12", color: "text-red-600", bg: "bg-red-50" },
    { icon: Clock, label: "Avg Review Time", value: "2.4m", color: "text-blue-600", bg: "bg-blue-50" },
  ], []);

  const recentSubmissions = useMemo(() => [
    { id: 1, surveyor: "John Smith", poi: "Starbucks Coffee", photos: 8, submitted: "10 min ago", priority: "high" },
    { id: 2, surveyor: "Sarah Johnson", poi: "Nike Store", photos: 12, submitted: "25 min ago", priority: "medium" },
    { id: 3, surveyor: "Mike Wilson", poi: "CVS Pharmacy", photos: 6, submitted: "1 hour ago", priority: "low" },
  ], []);

  const dailyActivity = useMemo(() => [
    { day: "Mon", reviewed: 85, approved: 72, rejected: 13 },
    { day: "Tue", reviewed: 92, approved: 80, rejected: 12 },
    { day: "Wed", reviewed: 78, approved: 68, rejected: 10 },
    { day: "Thu", reviewed: 95, approved: 85, rejected: 10 },
    { day: "Fri", reviewed: 89, approved: 78, rejected: 11 },
  ], []);

  const statusData = useMemo(() => [
    { name: "Approved", value: 420, color: "#10b981" },
    { name: "Rejected", value: 58, color: "#ef4444" },
    { name: "Pending", value: 145, color: "#f59e0b" },
  ], []);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">Editor Dashboard</h1>
        <p className="text-gray-600">Review and verify survey submissions</p>
      </div>

      {/* KPI Cards */}
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
                <div className={`${kpi.bg} p-2 rounded-lg w-fit mb-3`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className="text-2xl lg:text-3xl font-bold mb-1">{kpi.value}</div>
                <div className="text-xs lg:text-sm text-gray-600">{kpi.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Submissions</CardTitle>
          <Button size="sm" asChild>
            <Link href="/editor/review/1">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card View */}
          <div className="space-y-3 lg:hidden">
            {recentSubmissions.map((submission) => (
              <Link key={submission.id} href={`/editor/review/${submission.id}`}>
                <div className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{submission.poi}</h4>
                      <p className="text-xs text-gray-600">By {submission.surveyor}</p>
                    </div>
                    <Badge variant={
                      submission.priority === "high" ? "destructive" :
                        submission.priority === "medium" ? "secondary" : "outline"
                    }>
                      {submission.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{submission.photos} photos</span>
                    <span>{submission.submitted}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">POI</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Surveyor</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-gray-600">Photos</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-gray-600">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Submitted</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((submission) => (
                  <tr key={submission.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{submission.poi}</td>
                    <td className="py-3 px-4 text-sm">{submission.surveyor}</td>
                    <td className="py-3 px-4 text-sm text-center">{submission.photos}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={
                        submission.priority === "high" ? "destructive" :
                          submission.priority === "medium" ? "secondary" : "outline"
                      }>
                        {submission.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{submission.submitted}</td>
                    <td className="py-3 px-4 text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/editor/review/${submission.id}`}>Review</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
