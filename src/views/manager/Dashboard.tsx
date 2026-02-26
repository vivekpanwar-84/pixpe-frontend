"use client";
import { motion } from "motion/react";
import { Users, MapPin, CircleCheck as CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ManagerDashboard() {
  const kpis = [
    { icon: Users, label: "Active Surveyors", value: "24", change: "+3", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: MapPin, label: "Active AOIs", value: "18", change: "+2", color: "text-green-600", bg: "bg-green-50" },
    { icon: CheckCircle, label: "Photos Captured", value: "1,234", change: "+156", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: TrendingUp, label: "Completion Rate", value: "87%", change: "+5%", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const weeklyData = [
    { day: "Mon", surveys: 145, approved: 120, pending: 25 },
    { day: "Tue", surveys: 168, approved: 142, pending: 26 },
    { day: "Wed", surveys: 152, approved: 130, pending: 22 },
    { day: "Thu", surveys: 189, approved: 165, pending: 24 },
    { day: "Fri", surveys: 176, approved: 151, pending: 25 },
    { day: "Sat", surveys: 98, approved: 85, pending: 13 },
    { day: "Sun", surveys: 85, approved: 72, pending: 13 },
  ];

  const topSurveyors = [
    { name: "John Smith", completed: 156, rating: 4.9 },
    { name: "Sarah Johnson", completed: 142, rating: 4.8 },
    { name: "Mike Wilson", completed: 128, rating: 4.7 },
    { name: "Emily Davis", completed: 115, rating: 4.9 },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">Manager Dashboard</h1>
        <p className="text-gray-600">Overview of survey operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpis.map((kpi, index) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className={`${kpi.bg} p-2 rounded-lg w-fit mb-3`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-bold">{kpi.value}</span>
                  <Badge variant="secondary" className="text-xs">
                    {kpi.change}
                  </Badge>
                </div>
                <div className="text-xs lg:text-sm text-gray-600 mt-1">{kpi.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorSurveys" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="surveys" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSurveys)" />
                  <Area type="monotone" dataKey="approved" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Surveyors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSurveyors.map((surveyor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{surveyor.name}</h4>
                      <p className="text-sm text-gray-600">{surveyor.completed} surveys</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-orange-600">★ {surveyor.rating}</div>
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
