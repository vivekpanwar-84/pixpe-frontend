"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, MapPin, Clock, CircleCheck as CheckCircle, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function POIDetail() {
  const { id } = useParams();

  const poi = {
    id: Number(id),
    name: "Starbucks Coffee",
    address: "123 Main Street, Downtown",
    aoiName: "Downtown Shopping District",
    status: "in_progress",
    category: "Restaurant/Cafe",
    lastVisited: "Feb 15, 2026",
    photosRequired: 8,
    photosTaken: 5,
  };

  const photos = [
    { id: 1, type: "Storefront", url: "photo1.jpg", timestamp: "10:30 AM" },
    { id: 2, type: "Entrance", url: "photo2.jpg", timestamp: "10:32 AM" },
    { id: 3, type: "Signage", url: "photo3.jpg", timestamp: "10:35 AM" },
    { id: 4, type: "Interior", url: "photo4.jpg", timestamp: "10:38 AM" },
    { id: 5, type: "Menu Board", url: "photo5.jpg", timestamp: "10:40 AM" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-14 lg:top-16 z-20 bg-white border-b border-gray-200">
        <div className="px-4 py-3 lg:px-6 lg:py-4">
          <Link href={`/surveyor/aoi/${id}`}>
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to AOI
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold mb-1">{poi.name}</h1>
              <p className="text-sm text-gray-600">{poi.address}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">{poi.status.replace("_", " ")}</Badge>
                <Badge variant="outline">{poi.category}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Single column on mobile, two columns on desktop */}
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Photos */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Photos ({poi.photosTaken}/{poi.photosRequired})</span>
                  <Link href={`/surveyor/capture/${poi.id}`}>
                    <Button size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Capture</span>
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center overflow-hidden">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white p-2 rounded-b-lg">
                          <p className="text-xs font-medium truncate">{photo.type}</p>
                          <p className="text-xs text-gray-300">{photo.timestamp}</p>
                        </div>
                      </div>
                    ))}
                    {/* Placeholder for missing photos */}
                    {Array.from({ length: poi.photosRequired - poi.photosTaken }).map((_, i) => (
                      <Link key={`missing-${i}`} href={`/surveyor/capture/${poi.id}`}>
                        <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Add Photo</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No photos captured yet</p>
                    <Link href={`/surveyor/capture/${poi.id}`}>
                      <Button>
                        <Camera className="w-4 h-4 mr-2" />
                        Start Capturing
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Survey Information - Hidden on mobile, visible on desktop */}
            <Card className="hidden lg:block">
              <CardHeader>
                <CardTitle>POI Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AOI</span>
                  <span className="font-medium">{poi.aoiName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{poi.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Visited</span>
                  <span className="font-medium">{poi.lastVisited}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <Badge variant="secondary">{poi.status.replace("_", " ")}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Survey Data</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input id="business-name" defaultValue={poi.name} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue={poi.address} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select defaultValue="cafe">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cafe">Restaurant/Cafe</SelectItem>
                          <SelectItem value="retail">Retail Store</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status-field">Operational Status</Label>
                      <Select defaultValue="open">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="temporary">Temporarily Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hours">Operating Hours</Label>
                    <Input id="hours" placeholder="e.g., Mon-Fri: 8AM-8PM" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional observations or notes..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1">
                      Save Draft
                    </Button>
                    <Button type="submit" className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions - Floating bottom button */}
      <div className="lg:hidden fixed bottom-20 right-4 z-30">
        <Link href={`/surveyor/capture/${poi.id}`}>
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
            <Camera className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
