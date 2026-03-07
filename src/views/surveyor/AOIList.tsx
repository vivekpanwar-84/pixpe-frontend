"use client";
import { useState, useMemo } from "react";
import { Search, Filter, MapPin, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useSurveyor } from "@/hooks/useSurveyor";
import { Skeleton } from "@/components/ui/skeleton";

export default function AOIList() {
  const { useAssignedAois } = useSurveyor();
  const { data: aois, isLoading, isError, error } = useAssignedAois();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredAOIs = useMemo(() => {
    return (aois || []).filter((aoi: any) => {
      const name = aoi.aoi_name || aoi.name || "";
      const status = aoi.status || "";
      const priority = aoi.priority || "";
      const city = aoi.city || "";

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase();
      const matchesPriority = priorityFilter === "all" || priority.toLowerCase() === priorityFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [aois, searchQuery, statusFilter, priorityFilter]);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 lg:p-6 text-center space-y-4">
        <p className="text-red-500">Error loading AOIs: {(error as any)?.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  const FilterPanel = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Status</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Priority</label>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setStatusFilter("all");
          setPriorityFilter("all");
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">Area of Interest</h1>
        <p className="text-gray-600">Manage your assigned survey areas</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or city..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Desktop Filter Popover */}
        <div className="hidden lg:block">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {(statusFilter !== "all" || priorityFilter !== "all") && (
                  <Badge variant="secondary" className="h-5 px-1.5 rounded-sm">
                    {(statusFilter !== "all" ? 1 : 0) + (priorityFilter !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Filter AOIs</h4>
                <FilterPanel />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Mobile Filter Drawer */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[400px]">
            <SheetHeader>
              <SheetTitle>Filter AOIs</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterPanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {filteredAOIs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No AOIs found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">AOI Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Priority</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAOIs.map((aoi: any, index: number) => (
                  <tr
                    key={aoi.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td
                      className="px-6 py-4 font-medium text-gray-900"
                      onClick={() => window.location.href = `/surveyor/aoi/${aoi.id}`}
                    >
                      {aoi.aoi_name || aoi.name}
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => window.location.href = `/surveyor/aoi/${aoi.id}`}
                    >
                      <Badge
                        variant={
                          aoi.status === "completed" ? "default" :
                            aoi.status === "in_progress" ? "secondary" : "outline"
                        }
                        className="text-[10px] h-5"
                      >
                        {(aoi.status || "PENDING").replace("_", " ").toLowerCase()}
                      </Badge>
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => window.location.href = `/surveyor/aoi/${aoi.id}`}
                    >
                      <Badge
                        variant={
                          aoi.priority === "high" ? "destructive" :
                            aoi.priority === "medium" ? "secondary" : "outline"
                        }
                        className="text-[10px] h-5"
                      >
                        {aoi.priority} priority
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/surveyor/aoi/${aoi.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
