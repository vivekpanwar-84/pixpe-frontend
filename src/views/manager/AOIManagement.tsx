"use client";
import { useState } from "react";
import { Plus, MapPin, Pencil as Edit, Trash2, Users, Check, ChevronsUpDown, UserPlus, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/components/ui/utils";
import { useManager } from "@/hooks/useManager";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import tj from "@mapbox/togeojson";
import { Skeleton } from "@/components/ui/skeleton";

export default function AOIManagement() {
  const { useAllAois, createAoi, updateAoi, closeAoi, assignAoi } = useManager();
  const { useAllUsers } = useAdmin();

  const { data: aoisData, isLoading: isLoadingAois } = useAllAois();
  const { data: usersData, isLoading: isLoadingUsers } = useAllUsers();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAoiId, setEditingAoiId] = useState<string | null>(null);
  const [openSurveyor, setOpenSurveyor] = useState(false);
  const [selectedSurveyor, setSelectedSurveyor] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAssignAOI, setSelectedAssignAOI] = useState<string | null>(null);
  const [selectedAssignSurveyor, setSelectedAssignSurveyor] = useState<string | null>(null);
  const [openAssignAOI, setOpenAssignAOI] = useState(false);
  const [openAssignSurveyor, setOpenAssignSurveyor] = useState(false);

  const [newAOI, setNewAOI] = useState({
    aoi_name: "",
    city: "",
    state: "",
    pin_code: "",
    priority: "MEDIUM",
    description: "",
    center_latitude: 0,
    center_longitude: 0,
    boundary_geojson: null as any,
  });

  const surveyors = (usersData || [])
    .filter((u: any) => {
      const role = typeof u.role === 'string' ? u.role : u.role?.slug;
      return role?.toLowerCase() === 'surveyor';
    })
    .map((u: any) => ({ value: u.id, label: u.name }));

  const aoisList = aoisData || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parser = new DOMParser();
        const kml = parser.parseFromString(text, "text/xml");
        const converted = tj.kml(kml);

        if (converted.features.length > 0) {
          const feature = converted.features[0];
          if (feature.geometry.type === "Polygon") {
            const coords = feature.geometry.coordinates;
            // Calculate center (simple average)
            let latSum = 0;
            let lonSum = 0;
            let count = 0;

            coords[0].forEach((coord: any) => {
              lonSum += coord[0];
              latSum += coord[1];
              count++;
            });

            setNewAOI((prev) => ({
              ...prev,
              center_latitude: Number((latSum / count).toFixed(6)),
              center_longitude: Number((lonSum / count).toFixed(6)),
              boundary_geojson: feature.geometry,
            }));
            toast.success("KML parsed successfully");
          } else {
            toast.error("No Polygon found in KML");
          }
        }
      } catch (error) {
        console.error("KML error:", error);
        toast.error("Failed to parse KML file");
      }
    };
    reader.readAsText(file);
  };

  const handleCreateAOI = () => {
    if (!newAOI.aoi_name || !newAOI.boundary_geojson) {
      toast.error("Please provide AOI name and KML file");
      return;
    }

    const payload = {
      ...newAOI,
      assigned_to_id: selectedSurveyor || null,
    };

    if (isEditing && editingAoiId) {
      updateAoi.mutate({ id: editingAoiId, data: payload }, {
        onSuccess: () => {
          toast.success("AOI updated successfully");
          setIsCreateDialogOpen(false);
          resetCreateForm();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update AOI");
        },
      });
    } else {
      createAoi.mutate(payload, {
        onSuccess: () => {
          toast.success("AOI created successfully");
          setIsCreateDialogOpen(false);
          resetCreateForm();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create AOI");
        },
      });
    }
  };

  const resetCreateForm = () => {
    setNewAOI({
      aoi_name: "",
      city: "",
      state: "",
      pin_code: "",
      priority: "MEDIUM",
      description: "",
      center_latitude: 0,
      center_longitude: 0,
      boundary_geojson: null,
    });
    setSelectedSurveyor("");
    setIsEditing(false);
    setEditingAoiId(null);
  };

  const handleAssignAOI = () => {
    if (!selectedAssignAOI || !selectedAssignSurveyor) return;

    assignAoi.mutate(
      { id: selectedAssignAOI, surveyorId: selectedAssignSurveyor },
      {
        onSuccess: () => {
          toast.success("AOI assigned successfully");
          setIsAssignDialogOpen(false);
          setSelectedAssignAOI(null);
          setSelectedAssignSurveyor(null);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Assignment failed");
        },
      }
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">AOI Management</h1>
          <p className="text-gray-600">Create and manage survey areas</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Assign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Surveyor to AOI</DialogTitle>
              </DialogHeader>
              <div className="flex-1 flex flex-col gap-6 pt-4">
                {/* AOI Selection */}
                <div className="space-y-2">
                  <Label>Select AOI</Label>
                  <Popover open={openAssignAOI} onOpenChange={setOpenAssignAOI}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openAssignAOI}
                        className="w-full justify-between"
                      >
                        {selectedAssignAOI
                          ? aoisList.find((aoi: any) => aoi.id === selectedAssignAOI)?.aoi_name
                          : "Select AOI..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search AOI..." />
                        <CommandList>
                          <CommandEmpty>No AOI found.</CommandEmpty>
                          <CommandGroup>
                            {aoisList.map((aoi: any) => (
                              <CommandItem
                                key={aoi.id}
                                value={aoi.aoi_name}
                                onSelect={() => {
                                  setSelectedAssignAOI(aoi.id === selectedAssignAOI ? null : aoi.id);
                                  setOpenAssignAOI(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedAssignAOI === aoi.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {aoi.aoi_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Surveyor Selection */}
                <div className="space-y-2">
                  <Label>Select Surveyor</Label>
                  <Popover open={openAssignSurveyor} onOpenChange={setOpenAssignSurveyor}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openAssignSurveyor}
                        className="w-full justify-between"
                      >
                        {selectedAssignSurveyor
                          ? surveyors.find((surveyor: { value: string; label: string }) => surveyor.value === selectedAssignSurveyor)?.label
                          : "Select surveyor..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search surveyor..." />
                        <CommandList>
                          <CommandEmpty>No surveyor found.</CommandEmpty>
                          <CommandGroup>
                            {surveyors.map((surveyor: { value: string; label: string }) => (
                              <CommandItem
                                key={surveyor.value}
                                value={surveyor.label}
                                onSelect={() => {
                                  setSelectedAssignSurveyor(
                                    surveyor.value === selectedAssignSurveyor ? null : surveyor.value
                                  );
                                  setOpenAssignSurveyor(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedAssignSurveyor === surveyor.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {surveyor.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!selectedAssignAOI || !selectedAssignSurveyor || assignAoi.isPending}
                  onClick={handleAssignAOI}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {assignAoi.isPending ? "Assigning..." : "Confirm Assignment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetCreateForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Create AOI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit AOI" : "Create New AOI"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="aoi-name">AOI Name</Label>
                  <Input id="aoi-name" placeholder="Enter AOI name" value={newAOI.aoi_name} onChange={(e) => setNewAOI({ ...newAOI, aoi_name: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="KML-file">KML File Upload</Label>
                  <Input id="KML-file" type="file" accept=".kml" onChange={handleFileUpload} />
                  {newAOI.center_latitude !== 0 && (
                    <p className="text-xs text-green-600">
                      Parsed: {newAOI.center_latitude}, {newAOI.center_longitude}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" value={newAOI.city} onChange={(e) => setNewAOI({ ...newAOI, city: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="State" value={newAOI.state} onChange={(e) => setNewAOI({ ...newAOI, state: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin_code">Pin Code</Label>
                    <Input id="pin_code" placeholder="Pin" value={newAOI.pin_code} onChange={(e) => setNewAOI({ ...newAOI, pin_code: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Assign Initial Surveyor (Optional)</Label>
                  <Popover open={openSurveyor} onOpenChange={setOpenSurveyor}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSurveyor}
                        className="w-full justify-between"
                      >
                        {selectedSurveyor
                          ? surveyors.find((surveyor: { value: string; label: string }) => surveyor.value === selectedSurveyor)?.label
                          : "Select surveyor..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search surveyor..." />
                        <CommandList>
                          <CommandEmpty>No surveyor found.</CommandEmpty>
                          <CommandGroup>
                            {surveyors.map((surveyor: { value: string; label: string }) => (
                              <CommandItem
                                key={surveyor.value}
                                value={surveyor.value}
                                onSelect={(currentValue) => {
                                  setSelectedSurveyor(currentValue === selectedSurveyor ? "" : currentValue);
                                  setOpenSurveyor(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedSurveyor === surveyor.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {surveyor.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newAOI.priority} onValueChange={(val) => setNewAOI({ ...newAOI, priority: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the area..." rows={2} value={newAOI.description} onChange={(e) => setNewAOI({ ...newAOI, description: e.target.value })} />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleCreateAOI} disabled={createAoi.isPending || updateAoi.isPending}>
                    {(createAoi.isPending || updateAoi.isPending) ? "Saving..." : (isEditing ? "Save Changes" : "Create AOI")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {isLoadingAois ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : aoisList.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No AOIs found.</p>
        ) : (
          aoisList.map((aoi: any) => (
            <Card key={aoi.id}>
              <CardContent className="p-3 lg:p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-base mb-1">{aoi.aoi_name}</h3>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant={aoi.status === "COMPLETED" ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                            {aoi.status}
                          </Badge>
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{aoi.aoi_code}</Badge>
                          <span className="text-gray-600 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {aoi.assigned_to?.name || "Unassigned"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs px-3"
                      onClick={() => {
                        setSelectedAssignAOI(aoi.id);
                        setIsAssignDialogOpen(true);
                      }}
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      Assign
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setNewAOI({
                              aoi_name: aoi.aoi_name,
                              city: aoi.city || "",
                              state: aoi.state || "",
                              pin_code: aoi.pin_code || "",
                              priority: aoi.priority || "MEDIUM",
                              description: aoi.description || "",
                              center_latitude: aoi.center_latitude || 0,
                              center_longitude: aoi.center_longitude || 0,
                              boundary_geojson: aoi.boundary_geojson,
                            });
                            setIsEditing(true);
                            setEditingAoiId(aoi.id);
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit AOI
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to close this AOI?")) {
                              closeAoi.mutate(aoi.id, {
                                onSuccess: () => toast.success("AOI closed successfully"),
                                onError: () => toast.error("Failed to close AOI"),
                              });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Close AOI
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
