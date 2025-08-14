import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Music, 
  Calendar,
  Play,
  Download,
  Globe,
  Headphones
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    chartData: Array<{ month: string; amount: number; }>;
  };
  bookings: {
    total: number;
    growth: number;
    chartData: Array<{ month: string; bookings: number; }>;
  };
  streams: {
    total: number;
    growth: number;
    chartData: Array<{ date: string; streams: number; }>;
  };
  demographics: Array<{ region: string; percentage: number; color: string; }>;
  topTracks: Array<{ title: string; artist: string; plays: number; revenue: number; }>;
  performance: {
    conversionRate: number;
    avgBookingValue: number;
    customerRetention: number;
    platformGrowth: number;
  };
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  timeRange: '7d' | '30d' | '90d' | '1y';
  userRole: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsDashboard({ data, timeRange, userRole }: AnalyticsDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getTrendIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTrendColor = (growth: number) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.revenue.total)}</div>
            <div className={`flex items-center gap-1 text-xs ${getTrendColor(data.revenue.growth)}`}>
              {getTrendIcon(data.revenue.growth)}
              <span>{Math.abs(data.revenue.growth)}% from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.bookings.total}</div>
            <div className={`flex items-center gap-1 text-xs ${getTrendColor(data.bookings.growth)}`}>
              {getTrendIcon(data.bookings.growth)}
              <span>{Math.abs(data.bookings.growth)}% from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.streams.total)}</div>
            <div className={`flex items-center gap-1 text-xs ${getTrendColor(data.streams.growth)}`}>
              {getTrendIcon(data.streams.growth)}
              <span>{Math.abs(data.streams.growth)}% from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.performance.avgBookingValue)}</div>
            <div className="text-xs text-muted-foreground">
              {data.performance.conversionRate}% conversion rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenue.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.bookings.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Tracks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topTracks.map((track, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{track.title}</h4>
                      <p className="text-sm text-gray-600">{track.artist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{formatNumber(track.plays)}</span>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(track.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.demographics}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="percentage"
                  label={({ region, percentage }) => `${region}: ${percentage}%`}
                >
                  {data.demographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {data.demographics.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.region}</span>
                  </div>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <span className="text-sm">{data.performance.conversionRate}%</span>
              </div>
              <Progress value={data.performance.conversionRate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customer Retention</span>
                <span className="text-sm">{data.performance.customerRetention}%</span>
              </div>
              <Progress value={data.performance.customerRetention} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Platform Growth</span>
                <span className="text-sm">{data.performance.platformGrowth}%</span>
              </div>
              <Progress value={data.performance.platformGrowth} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Artist Satisfaction</span>
                <span className="text-sm">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streams Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Streaming Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.streams.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [formatNumber(value as number), 'Streams']} />
              <Line 
                type="monotone" 
                dataKey="streams" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Analytics data structure for production use
export const generateAnalyticsStructure = (): AnalyticsData => ({
  revenue: {
    total: 45680,
    growth: 12.5,
    chartData: [
      { month: 'Jan', amount: 8500 },
      { month: 'Feb', amount: 9200 },
      { month: 'Mar', amount: 7800 },
      { month: 'Apr', amount: 10100 },
      { month: 'May', amount: 9900 },
      { month: 'Jun', amount: 11200 }
    ]
  },
  bookings: {
    total: 156,
    growth: 8.3,
    chartData: [
      { month: 'Jan', bookings: 25 },
      { month: 'Feb', bookings: 28 },
      { month: 'Mar', bookings: 22 },
      { month: 'Apr', bookings: 32 },
      { month: 'May', bookings: 29 },
      { month: 'Jun', bookings: 35 }
    ]
  },
  streams: {
    total: 235000,
    growth: 15.7,
    chartData: [
      { date: '06/01', streams: 12500 },
      { date: '06/08', streams: 15200 },
      { date: '06/15', streams: 18900 },
      { date: '06/22', streams: 16700 },
      { date: '06/29', streams: 21300 }
    ]
  },
  demographics: [
    { region: 'North America', percentage: 45, color: '#3B82F6' },
    { region: 'Europe', percentage: 25, color: '#10B981' },
    { region: 'Caribbean', percentage: 15, color: '#F59E0B' },
    { region: 'South America', percentage: 10, color: '#EF4444' },
    { region: 'Other', percentage: 5, color: '#8B5CF6' }
  ],
  topTracks: [
    { title: 'Caribbean Waves', artist: 'Lí-Lí Octave', plays: 45600, revenue: 2280 },
    { title: 'Sunset Rhythm', artist: 'Lí-Lí Octave', plays: 38200, revenue: 1910 },
    { title: 'Island Dreams', artist: 'JCro', plays: 32100, revenue: 1605 },
    { title: 'Neo Soul Journey', artist: 'Janet Azzouz', plays: 28900, revenue: 1445 },
    { title: 'Tropical Nights', artist: 'Princess Trinidad', plays: 25300, revenue: 1265 }
  ],
  performance: {
    conversionRate: 12.8,
    avgBookingValue: 2850,
    customerRetention: 78,
    platformGrowth: 25.4
  }
});