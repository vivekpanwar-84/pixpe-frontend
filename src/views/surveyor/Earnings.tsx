"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DollarSign, TrendingUp, Award, Calendar, Download, Filter, Loader2, Send, CheckSquare, Square, Check, Info, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { surveyorService } from "@/services/surveyor.service";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Earnings() {
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [totalPixpoints, setTotalPixpoints] = useState("0.00");
  const [period, setPeriod] = useState("week");
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [requestNotes, setRequestNotes] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [submittableAois, setSubmittableAois] = useState<any[]>([]);
  const [selectedAoiIds, setSelectedAoiIds] = useState<Set<string>>(new Set());
  const [fetchingSubmittable, setFetchingSubmittable] = useState(false);

  const fetchEarnings = async () => {
    try {
      const [earnings, balance] = await Promise.all([
        surveyorService.getEarnings(),
        surveyorService.getMyBalance()
      ]);
      setEarningsData(earnings);
      setTotalPixpoints(balance.total_pixpoints);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  useEffect(() => {
    if (isPayoutDialogOpen) {
      fetchSubmittableAois();
    }
  }, [isPayoutDialogOpen]);

  const fetchSubmittableAois = async () => {
    setFetchingSubmittable(true);
    try {
      const data = await surveyorService.getSubmittableAois();
      setSubmittableAois(data);
      // Auto-select all by default
      setSelectedAoiIds(new Set(data.map((a: any) => a.aoi_id)));
    } catch (error) {
      console.error("Error fetching submittable AOIs:", error);
      toast.error("Failed to load submittable AOIs");
    } finally {
      setFetchingSubmittable(false);
    }
  };

  const handleRequestPayout = async () => {
    if (selectedAoiIds.size === 0) {
      toast.error("Please select at least one AOI");
      return;
    }

    setSubmittingPayout(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const selectedAois = submittableAois.filter(aoi => selectedAoiIds.has(aoi.aoi_id));

      for (const targetAoi of selectedAois) {
        try {
          await surveyorService.requestPayout({
            aoi_id: targetAoi.aoi_id,
            total_photos_submitted: targetAoi.total_photos_submitted,
            total_photos_approved: targetAoi.total_photos_approved,
            request_notes: requestNotes,
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to request for ${targetAoi.aoi_code}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully requested payout for ${successCount} AOIs`);
      }
      if (failCount > 0) {
        toast.error(`Failed to request payout for ${failCount} AOIs`);
      }

      if (failCount === 0) {
        setIsPayoutDialogOpen(false);
        setRequestNotes("");
        fetchEarnings(); // Refresh data
      } else {
        fetchSubmittableAois(); // Refresh list to remove successful ones
      }
    } catch (error) {
      console.error("Error in payout request flow:", error);
      toast.error("An error occurred while processing requests");
    } finally {
      setSubmittingPayout(false);
    }
  };

  const toggleAoiSelection = (id: string) => {
    const newSet = new Set(selectedAoiIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAoiIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedAoiIds.size === submittableAois.length) {
      setSelectedAoiIds(new Set());
    } else {
      setSelectedAoiIds(new Set(submittableAois.map(a => a.aoi_id)));
    }
  };

  // In this version, earningsData is an array of Reward objects (requests)
  const requests = Array.isArray(earningsData) ? earningsData : [];

  // Filter for stats
  const totalEarned = requests
    .filter(r => r.status === 'PAID')
    .reduce((sum, r) => sum + Number(r.reward_amount), 0);

  const stats = [
    { label: "Total Pixpoints", amount: `${totalPixpoints}`, icon: Award, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total Paid", amount: `₹${totalEarned}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Payout", amount: `₹${requests.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + Number(r.reward_amount), 0)}`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "This Week", amount: `₹0`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  ];

  const chartData = [
    { date: "Mon", amount: 0 },
    { date: "Tue", amount: 0 },
    { date: "Wed", amount: 0 },
    { date: "Thu", amount: 0 },
    { date: "Fri", amount: 0 },
    { date: "Sat", amount: 0 },
    { date: "Sun", amount: 0 },
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">Earnings & Rewards</h1>
          <p className="text-gray-600">Track your income and achievements</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Payout</DialogTitle>
                <DialogDescription>
                  Submit a reward request for your completed work.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-700">Select AOIs for Payout</Label>
                    {submittableAois.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={toggleSelectAll}
                      >
                        {selectedAoiIds.size === submittableAois.length ? "Deselect All" : "Select All"}
                      </Button>
                    )}
                  </div>

                  <div className="border rounded-2xl overflow-hidden bg-gray-50/30">
                    <ScrollArea className="h-[240px]">
                      {fetchingSubmittable ? (
                        <div className="flex items-center justify-center h-full p-8 text-gray-400">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          <span className="text-xs font-medium">Fetching available AOIs...</span>
                        </div>
                      ) : submittableAois.length > 0 ? (
                        <div className="p-3 space-y-2">
                          {submittableAois.map((aoi) => (
                            <div
                              key={aoi.aoi_id}
                              onClick={() => toggleAoiSelection(aoi.aoi_id)}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${selectedAoiIds.has(aoi.aoi_id) ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-50' : 'bg-transparent border-transparent hover:bg-gray-100/50'}`}
                            >
                              <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedAoiIds.has(aoi.aoi_id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                {selectedAoiIds.has(aoi.aoi_id) && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-gray-900 truncate uppercase tracking-tight">{aoi.aoi_name}</p>
                                  <Badge variant="outline" className="text-[9px] font-bold border-gray-200 text-gray-500 bg-white">
                                    {aoi.aoi_code}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-gray-400 font-medium">Photos:</span>
                                    <span className="text-[10px] text-gray-700 font-bold">{aoi.total_photos_submitted}</span>
                                  </div>
                                  <span className="text-gray-200 text-[10px]">•</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-emerald-500 font-medium">Approved:</span>
                                    <span className="text-[10px] text-emerald-700 font-bold">{aoi.total_photos_approved}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-3">
                            <Info className="w-5 h-5 text-gray-300" />
                          </div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest leading-relaxed">
                            No AOIs ready for payout.<br />Ensure your surveys are submitted.
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Provide any additional info about your request..."
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="ghost" onClick={() => setIsPayoutDialogOpen(false)} className="rounded-xl font-bold text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700">Cancel</Button>
                <Button
                  onClick={handleRequestPayout}
                  className="bg-gray-900 hover:bg-blue-600 text-white rounded-xl h-10 px-6 font-bold text-xs uppercase tracking-wider shadow-lg shadow-gray-100 hover:shadow-blue-100 transition-all"
                  disabled={submittingPayout || selectedAoiIds.size === 0}
                >
                  {submittingPayout ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit Request {selectedAoiIds.size > 0 && `(${selectedAoiIds.size})`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className={`${stat.bg} p-2 rounded-lg`}>
                    <stat.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className={`text-xl lg:text-2xl font-bold mb-1 ${stat.color}`}>
                  {stat.amount}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Earnings Trend</CardTitle>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month" className="hidden sm:flex">Month</TabsTrigger>
                <TabsTrigger value="year" className="hidden sm:flex">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="w-full lg:w-auto p-1 bg-gray-100/50 rounded-xl">
          <TabsTrigger value="requests" className="flex-1 lg:flex-none py-2 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
            Payout Requests
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 lg:flex-none py-2 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
            Payment History
          </TabsTrigger>
        </TabsList>

        {/* Payout Requests */}
        <TabsContent value="requests" className="space-y-3">
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[24px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Request Status</CardTitle>
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                  <Award className="w-3 h-3" />
                  ₹10 Pixpoints Per Photo
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {requests.length > 0 ? (
                <>
                  {/* Mobile View */}
                  <div className="space-y-4 lg:hidden">
                    {requests.map((request: any) => (
                      <div key={request.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/30 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-tight">
                              {request.aoi?.aoi_name || `AOI-${request.aoi_id.slice(0, 4)}`}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium">#{request.id.slice(0, 8)}</p>
                          </div>
                          <Badge
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border-none ${request.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                              request.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                request.status === "PAID" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"
                              }`}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Approved</p>
                            <p className="text-xs font-bold text-gray-700">{request.total_photos_approved} Photos</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Reward</p>
                            <p className="text-xs font-bold text-blue-600">₹{request.reward_amount}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-4 px-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Date</th>
                          <th className="text-left py-4 px-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">AOI / Area</th>
                          <th className="text-center py-4 px-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Stats</th>
                          <th className="text-center py-4 px-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Pixpoints</th>
                          <th className="text-center py-4 px-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Reward</th>
                          <th className="text-center py-4 px-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {requests.map((request: any) => (
                          <tr key={request.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="py-4 px-4">
                              <p className="text-xs font-bold text-gray-900">{new Date(request.requested_at).toLocaleDateString()}</p>
                              <p className="text-[9px] text-gray-400 font-medium">#{request.id.slice(0, 8)}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">{request.aoi?.aoi_name || 'N/A'}</p>
                              <p className="text-[10px] text-gray-400 font-medium font-mono">{request.aoi?.aoi_code || '-'}</p>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-gray-700">{request.total_photos_approved} / {request.total_photos_submitted}</span>
                                <span className="text-[9px] text-gray-400 font-medium uppercase">Approved</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-[11px] font-bold text-blue-500 bg-blue-50/50 px-2 py-1 rounded-lg">
                                {request.reward_per_photo || '10'} P/P
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <p className="text-xs font-bold text-blue-600">₹{request.reward_amount}</p>
                              {Number(request.bonus_amount) > 0 && (
                                <p className="text-[9px] text-emerald-500 font-bold">+₹{request.bonus_amount} Bonus</p>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border-none ${request.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                                  request.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                    request.status === "PAID" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"
                                  }`}
                              >
                                {request.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px] tracking-widest">No payout requests found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History / Paid */}
        <TabsContent value="history" className="space-y-3">
          <Card className="rounded-[24px] border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.filter(r => r.status === 'PAID').length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-4 px-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="text-left py-4 px-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Method</th>
                        <th className="text-left py-4 px-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Reference</th>
                        <th className="text-right py-4 px-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.filter(r => r.status === 'PAID').map((request: any) => (
                        <tr key={request.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-4 px-4 text-xs font-bold text-gray-700">{new Date(request.paid_at || request.updatedAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-xs font-bold text-gray-900 uppercase tracking-tighter">{request.payment_method || 'Bank Transfer'}</td>
                          <td className="py-4 px-4 text-xs font-mono text-gray-500">{request.payment_reference || '-'}</td>
                          <td className="py-4 px-4 text-right font-bold text-emerald-600 text-sm">₹{request.reward_amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs font-medium italic">No payment history available yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
