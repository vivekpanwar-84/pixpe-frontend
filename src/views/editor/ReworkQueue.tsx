"use client";
import { useState } from "react";
import { RefreshCw, Filter, Search, Clock, TriangleAlert as AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function ReworkQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const reworkItems = [
    {
      id: 1,
      poi: "Starbucks Coffee",
      surveyor: "John Smith",
      reason: "Blurry storefront photo",
      requested: "2 days ago",
      status: "pending",
      priority: "high",
      photos: 1,
    },
    {
      id: 2,
      poi: "CVS Pharmacy",
      surveyor: "Sarah Johnson",
      reason: "Missing signage photo",
      requested: "1 day ago",
      status: "in_progress",
      priority: "medium",
      photos: 1,
    },
    {
      id: 3,
      poi: "Target",
      surveyor: "Mike Wilson",
      reason: "Low quality interior shots",
      requested: "5 hours ago",
      status: "pending",
      priority: "low",
      photos: 3,
    },
  ];

  const filteredItems = reworkItems.filter((item) => {
    const matchesSearch = item.poi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.surveyor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">Rework Queue</h1>
        <p className="text-gray-600">Track submissions requiring corrections</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {reworkItems.filter(i => i.status === "pending").length}
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {reworkItems.filter(i => i.status === "in_progress").length}
            </div>
            <div className="text-xs text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {reworkItems.length}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by POI or surveyor..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rework Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No rework items found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile: Card View */}
            <div className="lg:hidden space-y-3">
              {filteredItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold mb-1">{item.poi}</h3>
                        <p className="text-sm text-gray-600">By {item.surveyor}</p>
                      </div>
                      <Badge variant={
                        item.priority === "high" ? "destructive" :
                          item.priority === "medium" ? "secondary" : "outline"
                      }>
                        {item.priority}
                      </Badge>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-orange-900">{item.reason}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.requested}
                      </span>
                      <Badge variant={item.status === "in_progress" ? "default" : "secondary"}>
                        {item.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <Button className="w-full" size="sm">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: Table View */}
            <Card className="hidden lg:block">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">POI</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Surveyor</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Reason</th>
                      <th className="text-center py-3 px-4 font-medium text-sm text-gray-600">Photos</th>
                      <th className="text-center py-3 px-4 font-medium text-sm text-gray-600">Priority</th>
                      <th className="text-center py-3 px-4 font-medium text-sm text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Requested</th>
                      <th className="text-right py-3 px-4 font-medium text-sm text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.poi}</td>
                        <td className="py-3 px-4 text-sm">{item.surveyor}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                            <span className="truncate max-w-xs">{item.reason}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-center">{item.photos}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={
                            item.priority === "high" ? "destructive" :
                              item.priority === "medium" ? "secondary" : "outline"
                          }>
                            {item.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={item.status === "in_progress" ? "default" : "secondary"}>
                            {item.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.requested}</td>
                        <td className="py-3 px-4 text-right">
                          <Button size="sm" variant="outline">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
