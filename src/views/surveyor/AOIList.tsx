"use client";
import { useState, useMemo, useEffect } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { useAssignedAois } = useSurveyor();
  const { data: aoisPaginated, isLoading, isError, error } = useAssignedAois(page, limit, debouncedSearchQuery);

  const aoisList = aoisPaginated?.data || aoisPaginated || [];
  const totalAois = aoisPaginated?.total || 0;

  const filteredAOIs = useMemo(() => {
    return (aoisList || []).filter((aoi: any) => {
      const status = aoi.status || "";
      const priority = aoi.priority || "";

      const matchesStatus = statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase();
      const matchesPriority = priorityFilter === "all" || priority.toLowerCase() === priorityFilter.toLowerCase();
      return matchesStatus && matchesPriority;
    });
  }, [aoisList, statusFilter, priorityFilter]);
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
        {isError ? (
          <div className="p-12 text-center">
            <p className="text-red-500 mb-4">Error loading AOIs: {(error as any)?.message}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : isLoading && !aoisPaginated ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredAOIs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No AOIs found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
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

      {/* Pagination Controls */}
      {!isLoading && totalAois > limit && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalAois)} of {totalAois} areas
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <div className="text-sm font-medium px-2">
              Page {page} of {Math.ceil(totalAois / limit)}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(totalAois / limit)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
