"use client";
import { useState, useMemo } from "react";
import { Check, User, Image as ImageIcon, MoreHorizontal, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useManager } from "@/hooks/useManager";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";
import { RejectionModal } from "@/components/modals/RejectionModal";

export default function POIApproval() {
  const { useAllPois, verifyPoi, useAllPhotos } = useManager();

  const { data: poisData, isLoading: isLoadingPois } = useAllPois();
  const { data: allPhotosData } = useAllPhotos();

  // Photos View Modal
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [selectedPoiForPhotos, setSelectedPoiForPhotos] = useState<any>(null);

  // Verification/Rejection State
  const [rejectingPoiId, setRejectingPoiId] = useState<string | null>(null);

  const poisList = useMemo(() => {
    return (poisData || []).filter((p: any) => p.status === 'PENDING' || p.status === 'REJECTED' || p.status === 'VERIFIED');
  }, [poisData]);

  const handleVerifyPoi = (id: string) => {
    if (!id) return;
    verifyPoi.mutate(
      { id, data: { status: "VERIFIED" } },
      {
        onSuccess: () => {
          toast.success("POI verified successfully");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Verification failed");
        },
      }
    );
  };

  const handleRejectPoi = (reason: string) => {
    if (!rejectingPoiId) return;

    verifyPoi.mutate(
      {
        id: rejectingPoiId,
        data: { status: "REJECTED", rejection_reason: reason },
      },
      {
        onSuccess: () => {
          toast.success("POI rejected successfully");
          setRejectingPoiId(null);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Rejection failed");
        },
      }
    );
  };

  const getPoiPhotos = (poiId: string) => {
    return (allPhotosData || []).filter((p: any) => p.poi_id === poiId);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">POI Approval</h1>
          <p className="text-gray-600">Review survey submissions and verify business data</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-6">
            {poisList.length} Total POIs
          </Badge>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">POI Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Surveyor</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">AOI</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoadingPois ? (
              [1, 2, 3].map((i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-6 py-4"><Skeleton className="h-6 w-full" /></td>
                </tr>
              ))
            ) : poisList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No POIs found for review.</p>
                </td>
              </tr>
            ) : (
              poisList.map((poi: any) => (
                <tr key={poi.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{poi.business_name}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-tighter">{poi.business_category || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-bold">
                        {poi.created_by?.name?.charAt(0)}
                      </div>
                      <span className="text-sm">{poi.created_by?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {poi.aoi?.aoi_name || poi.aoi?.aoi_code || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={poi.status === 'VERIFIED' ? 'secondary' : poi.status === 'REJECTED' ? 'destructive' : 'default'}
                      className="text-[10px] h-5"
                    >
                      {poi.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setSelectedPoiForPhotos(poi);
                          setIsPhotosModalOpen(true);
                        }}
                      >
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleVerifyPoi(poi.id)}
                        disabled={poi.status === 'VERIFIED'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setRejectingPoiId(poi.id);
                        }}
                        disabled={poi.status === 'REJECTED'}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RejectionModal
        isOpen={!!rejectingPoiId}
        onOpenChange={(open) => !open && setRejectingPoiId(null)}
        title="Reject POI"
        onConfirm={handleRejectPoi}
        isPending={verifyPoi.isPending}
      />

      {/* POI Photos Modal */}
      <Dialog open={isPhotosModalOpen} onOpenChange={setIsPhotosModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Photos for {selectedPoiForPhotos?.business_name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 max-h-[60vh] overflow-y-auto">
            {selectedPoiForPhotos && getPoiPhotos(selectedPoiForPhotos.id).length > 0 ? (
              getPoiPhotos(selectedPoiForPhotos.id).map((photo: any) => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden border">
                  <ImageWithSkeleton
                    src={photo.photo_url}
                    alt={photo.photo_type}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-white">
                    <p className="text-[10px] font-bold uppercase truncate">{photo.photo_type.replace('_', ' ')}</p>
                    <p className="text-[8px] opacity-80">{new Date(photo.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No photos uploaded for this POI yet.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
