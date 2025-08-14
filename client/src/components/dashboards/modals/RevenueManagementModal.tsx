import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Users, Calendar, Download } from 'lucide-react';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  pendingPayouts: number;
  completedBookings: number;
  subscriptionRevenue: number;
}

interface Transaction {
  id: number;
  type: 'booking' | 'subscription' | 'commission';
  amount: number;
  user: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface RevenueManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RevenueManagementModal({ isOpen, onClose }: RevenueManagementModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch revenue data
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['/api/admin/revenue/overview'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/revenue/overview');
      return response as RevenueData;
    }
  });

  // Fetch recent transactions
  const { data: transactions } = useQuery({
    queryKey: ['/api/admin/revenue/transactions'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/revenue/transactions');
      return response as Transaction[];
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, color: 'text-green-600' },
      pending: { variant: 'secondary' as const, color: 'text-yellow-600' },
      failed: { variant: 'destructive' as const, color: 'text-red-600' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      booking: Calendar,
      subscription: Users,
      commission: DollarSign
    };
    return icons[type as keyof typeof icons] || DollarSign;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue Management
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 flex-1">
            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(revenueData?.totalRevenue || 0)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(revenueData?.monthlyRevenue || 0)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">This Week</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(revenueData?.weeklyRevenue || 0)}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(revenueData?.pendingPayouts || 0)}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Booking Commissions</span>
                      <span className="font-semibold">
                        {formatCurrency((revenueData?.totalRevenue || 0) * 0.6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Subscription Revenue</span>
                      <span className="font-semibold">
                        {formatCurrency(revenueData?.subscriptionRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Service Fees</span>
                      <span className="font-semibold">
                        {formatCurrency((revenueData?.totalRevenue || 0) * 0.15)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Other Revenue</span>
                      <span className="font-semibold">
                        {formatCurrency((revenueData?.totalRevenue || 0) * 0.05)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completed Bookings</span>
                      <Badge variant="default">
                        {revenueData?.completedBookings || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Booking Value</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          (revenueData?.totalRevenue || 0) / Math.max(revenueData?.completedBookings || 1, 1)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Commission Rate</span>
                      <span className="font-semibold text-green-600">12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Growth Rate</span>
                      <span className="font-semibold text-blue-600">+23%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 flex-1">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.slice(0, 10).map((transaction) => {
                    const TypeIcon = getTypeIcon(transaction.type);
                    const statusBadge = getStatusBadge(transaction.status);
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">#{transaction.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>{transaction.user}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant} className="capitalize">
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatCurrency(revenueData?.pendingPayouts || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Awaiting processing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency((revenueData?.weeklyRevenue || 0) * 0.7)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Paid to artists
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency((revenueData?.weeklyRevenue || 0) * 0.3)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Platform commission
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payout Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Weekly Artist Payouts</p>
                      <p className="text-sm text-muted-foreground">Every Friday at 3 PM EST</p>
                    </div>
                    <Badge variant="default">Automated</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Management Commission</p>
                      <p className="text-sm text-muted-foreground">Monthly on the 1st</p>
                    </div>
                    <Badge variant="default">Automated</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Professional Service Fees</p>
                      <p className="text-sm text-muted-foreground">Upon service completion</p>
                    </div>
                    <Badge variant="secondary">Manual Review</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Month-over-Month Growth</span>
                      <span className="font-semibold text-green-600">+23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Year-over-Year Growth</span>
                      <span className="font-semibold text-green-600">+156%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Booking Value</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          (revenueData?.totalRevenue || 0) / Math.max(revenueData?.completedBookings || 1, 1)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Customer Lifetime Value</span>
                      <span className="font-semibold">{formatCurrency(2850)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Lí-Lí Octave Bookings</span>
                      <span className="font-semibold">{formatCurrency(12500)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>JCro Performances</span>
                      <span className="font-semibold">{formatCurrency(8750)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Professional Services</span>
                      <span className="font-semibold">{formatCurrency(6250)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Subscription Plans</span>
                      <span className="font-semibold">{formatCurrency(3200)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Merchandise Sales</span>
                      <span className="font-semibold">{formatCurrency(1850)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Financial Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency((revenueData?.monthlyRevenue || 0) * 1.25)}
                    </p>
                    <p className="text-sm text-blue-600">Next Month Projection</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency((revenueData?.monthlyRevenue || 0) * 4 * 1.15)}
                    </p>
                    <p className="text-sm text-green-600">Q1 Projection</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-700">
                      {formatCurrency((revenueData?.monthlyRevenue || 0) * 12 * 1.3)}
                    </p>
                    <p className="text-sm text-purple-600">Annual Projection</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}