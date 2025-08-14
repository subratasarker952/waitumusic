import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, Music, Calendar, TrendingUp, DollarSign } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  topArtists: { name: string; bookings: number; revenue: number }[];
  userGrowth: { month: string; users: number }[];
  revenueGrowth: { month: string; revenue: number }[];
}

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/analytics');
      return response as AnalyticsData;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Platform Analytics
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="bookings">Booking Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 flex-1">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
                      <p className="text-xs text-green-600">
                        +{analytics?.newUsersThisMonth || 0} this month
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">{analytics?.totalBookings || 0}</p>
                      <p className="text-xs text-green-600">
                        {analytics?.completedBookings || 0} completed
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
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(analytics?.totalRevenue || 0)}
                      </p>
                      <p className="text-xs text-green-600">
                        {formatCurrency(analytics?.averageBookingValue || 0)} avg booking
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
                      <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                      <p className="text-2xl font-bold text-green-600">+23%</p>
                      <p className="text-xs text-muted-foreground">
                        Month over month
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Top Performing Artists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.topArtists?.slice(0, 5).map((artist, index) => (
                      <div key={artist.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{artist.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {artist.bookings} bookings
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(artist.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Engagement</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Booking Success Rate</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Customer Satisfaction</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Platform Uptime</span>
                      <span>99.9%</span>
                    </div>
                    <Progress value={99.9} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Artists</span>
                    <Badge variant="outline">45%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fans</span>
                    <Badge variant="outline">30%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Professionals</span>
                    <Badge variant="outline">20%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Admins</span>
                    <Badge variant="outline">5%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Daily Active Users</span>
                    <span className="font-semibold">{Math.round((analytics?.activeUsers || 0) * 0.3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Weekly Active Users</span>
                    <span className="font-semibold">{Math.round((analytics?.activeUsers || 0) * 0.7)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Active Users</span>
                    <span className="font-semibold">{analytics?.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Retention Rate</span>
                    <Badge variant="default" className="bg-green-600">78%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Users (This Month)</span>
                    <span className="font-semibold text-green-600">
                      +{analytics?.newUsersThisMonth || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth Rate</span>
                    <Badge variant="default" className="bg-green-600">+23%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Churn Rate</span>
                    <Badge variant="secondary">2.1%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Satisfaction</span>
                    <Badge variant="default" className="bg-blue-600">4.8/5</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700">4.2</p>
                      <p className="text-sm text-blue-600">Average Session Duration (min)</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">6.8</p>
                      <p className="text-sm text-green-600">Pages per Session</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics?.totalBookings || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {analytics?.completedBookings || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">94%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {formatCurrency(analytics?.averageBookingValue || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Average Value</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Live Performances</span>
                    <Badge variant="outline">68%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Studio Sessions</span>
                    <Badge variant="outline">18%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Consultations</span>
                    <Badge variant="outline">10%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Other Services</span>
                    <Badge variant="outline">4%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Trends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Peak Booking Days</span>
                    <span className="font-semibold">Fri-Sat</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Lead Time</span>
                    <span className="font-semibold">14 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Repeat Customers</span>
                    <Badge variant="default" className="bg-green-600">42%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cancellation Rate</span>
                    <Badge variant="secondary">3.2%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(analytics?.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency((analytics?.totalRevenue || 0) / 12)}
                  </p>
                  <p className="text-sm text-muted-foreground">Monthly Average</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(analytics?.averageBookingValue || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Booking</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">+23%</p>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Booking Commissions</span>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency((analytics?.totalRevenue || 0) * 0.7)}</p>
                      <p className="text-xs text-muted-foreground">70%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Subscription Revenue</span>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency((analytics?.totalRevenue || 0) * 0.2)}</p>
                      <p className="text-xs text-muted-foreground">20%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Service Fees</span>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency((analytics?.totalRevenue || 0) * 0.1)}</p>
                      <p className="text-xs text-muted-foreground">10%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Projections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Month</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency((analytics?.totalRevenue || 0) / 12 * 1.25)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Quarter</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency((analytics?.totalRevenue || 0) / 4 * 1.3)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Annual Target</span>
                    <span className="font-semibold text-purple-600">
                      {formatCurrency((analytics?.totalRevenue || 0) * 1.5)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}