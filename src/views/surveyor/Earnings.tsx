"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DollarSign, TrendingUp, Award, Calendar, Download, Filter, Loader2, Send } from "lucide-react";
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

export default function Earnings() {
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [period, setPeriod] = useState("week");
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [requestNotes, setRequestNotes] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const fetchEarnings = async () => {
    try {
      const data = await surveyorService.getEarnings();
      setEarningsData(data);
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

  const handleRequestPayout = async () => {
    if (!earningsData?.stats?.pending_aois || earningsData.stats.pending_aois.length === 0) {
      toast.error("No pending AOIs to request payout for");
      return;
    }

    setSubmittingPayout(true);
    try {
      // For now, request for the first pending AOI or show a selector in a more complex UI
      const targetAoi = earningsData.stats.pending_aois[0];
      await surveyorService.requestPayout({
        aoi_id: targetAoi.id,
        total_photos_submitted: targetAoi.photos_count,
        total_photos_approved: targetAoi.approved_photos_count,
        request_notes: requestNotes,
      });
      toast.success("Payout request submitted successfully!");
      setIsPayoutDialogOpen(false);
      setRequestNotes("");
      fetchEarnings(); // Refresh data
    } catch (error) {
      console.error("Error requesting payout:", error);
      toast.error("Failed to submit payout request");
    } finally {
      setSubmittingPayout(false);
    }
  };

  const stats = [
    { label: "Today", amount: `₹${earningsData?.stats?.today || 0}`, change: "", color: "text-green-600" },
    { label: "This Week", amount: `₹${earningsData?.stats?.week || 0}`, change: "", color: "text-green-600" },
    { label: "This Month", amount: `₹${earningsData?.stats?.month || 0}`, change: "", color: "text-green-600" },
    { label: "Total Earned", amount: `₹${earningsData?.stats?.total || 0}`, change: "", color: "text-blue-600" },
  ];

  const chartData = earningsData?.chart || [
    { date: "Mon", amount: 0 },
    { date: "Tue", amount: 0 },
    { date: "Wed", amount: 0 },
    { date: "Thu", amount: 0 },
    { date: "Fri", amount: 0 },
    { date: "Sat", amount: 0 },
    { date: "Sun", amount: 0 },
  ];

  const transactions = earningsData?.transactions || [];
  const rewards = earningsData?.rewards || [];

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
                <div className="space-y-2">
                  <Label>Pending Work Summary</Label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    {earningsData?.stats?.pending_aois?.length > 0 ? (
                      <ul className="space-y-1">
                        <li>AOIs Ready: {earningsData.stats.pending_aois.length}</li>
                        <li>Estimated Reward: ₹{earningsData.stats.pending_reward}</li>
                      </ul>
                    ) : (
                      <p className="text-gray-500">No completed AOIs pending payout.</p>
                    )}
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPayoutDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleRequestPayout}
                  disabled={submittingPayout || !earningsData?.stats?.pending_aois?.length}
                >
                  {submittingPayout ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit Request
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
                  <div className="bg-green-50 p-2 rounded-lg">
                    <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
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

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="w-full lg:w-auto">
          <TabsTrigger value="transactions" className="flex-1 lg:flex-none">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex-1 lg:flex-none">
            Rewards
          </TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <>
                  {/* Mobile: Card View */}
                  <div className="space-y-3 lg:hidden">
                    {transactions.map((transaction: any) => (
                      <div key={transaction.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">
                              {transaction.review_notes || 'Reward Payout'}
                            </h4>
                            <p className="text-xs text-gray-600">{new Date(transaction.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">₹{transaction.amount}</div>
                            <Badge
                              variant={transaction.status === "PAID" ? "default" : "secondary"}
                              className="mt-1"
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Notes</th>
                          <th className="text-center py-3 px-4 font-medium text-sm text-gray-600">Status</th>
                          <th className="text-right py-3 px-4 font-medium text-sm text-gray-600">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction: any) => (
                          <tr key={transaction.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{new Date(transaction.updatedAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-sm">{transaction.review_notes || '-'}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge
                                variant={transaction.status === "PAID" ? "default" : "secondary"}
                              >
                                {transaction.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                              ₹{transaction.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">No transactions found.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards */}
        <TabsContent value="rewards" className="space-y-3">
          {rewards.length > 0 ? (
            rewards.map((reward: any) => (
              <Card key={reward.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-50 p-3 rounded-lg flex-shrink-0">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold mb-1">{reward.title || 'System Reward'}</h3>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                        </div>
                        <Badge variant="secondary">₹{reward.amount}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No rewards earned yet.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
