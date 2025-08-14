import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Music, 
  Play, 
  DollarSign, 
  Users, 
  Download,
  BarChart3,
  Calendar,
  Globe
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MusicAnalyticsProps {
  user: any;
}

export default function MusicAnalytics({ user }: MusicAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  // Fetch music analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/music', user.id, selectedTimeframe],
    queryFn: async () => {
      const response = await apiRequest(`/api/analytics/music?userId=${user.id}&timeframe=${selectedTimeframe}`);
      return await response.json();
    },
  });

  // Fetch song performance data
  const { data: songPerformance } = useQuery({
    queryKey: ['/api/analytics/songs', user.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/analytics/songs?userId=${user.id}`);
      return await response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metricsData = analytics || {
    totalPlays: 1247,
    totalRevenue: 432.50,
    uniqueListeners: 89,
    downloads: 156,
    averageRating: 4.2,
    topSong: "Caribbean Vibes",
    engagement: 78
  };

  const songs = songPerformance || [
    { id: 1, title: "Caribbean Vibes", plays: 523, revenue: 145.30, rating: 4.5 },
    { id: 2, title: "Island Dreams", plays: 387, revenue: 98.75, rating: 4.2 },
    { id: 3, title: "Tropical Sunset", plays: 337, revenue: 188.45, rating: 4.7 }
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Music Analytics</h3>
          <p className="text-gray-600 dark:text-gray-400">Track your music performance and revenue</p>
        </div>
        <div className="flex gap-2">
          {['7', '30', '90'].map((days) => (
            <Button
              key={days}
              variant={selectedTimeframe === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(days)}
            >
              {days} days
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Play className="h-4 w-4" />
              Total Plays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {metricsData.totalPlays.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              ${metricsData.totalRevenue.toFixed(2)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Unique Listeners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {metricsData.uniqueListeners}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +15% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {metricsData.downloads}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +5% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="songs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="songs" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Song Performance
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Revenue Analytics
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Audience Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Top Performing Songs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {songs.map((song: any, index: number) => (
                  <div key={song.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full text-sm font-bold text-blue-700 dark:text-blue-300">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{song.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {song.plays} plays
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${song.revenue.toFixed(2)}
                          </span>
                          <Badge variant="secondary">
                            ⭐ {song.rating}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Streaming Revenue</h4>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">$298.75</div>
                    <Progress value={69} className="mt-2" />
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">69% of total revenue</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Download Sales</h4>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">$133.75</div>
                    <Progress value={31} className="mt-2" />
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">31% of total revenue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Audience Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Top Locations</h4>
                  <div className="space-y-2">
                    {[
                      { country: "Dominica", percentage: 45 },
                      { country: "United States", percentage: 23 },
                      { country: "United Kingdom", percentage: 15 },
                      { country: "Canada", percentage: 12 },
                      { country: "Other", percentage: 5 }
                    ].map((location) => (
                      <div key={location.country} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{location.country}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={location.percentage} className="w-20" />
                          <span className="text-xs text-gray-500 w-8">{location.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Age Groups</h4>
                  <div className="space-y-2">
                    {[
                      { age: "18-24", percentage: 28 },
                      { age: "25-34", percentage: 35 },
                      { age: "35-44", percentage: 22 },
                      { age: "45-54", percentage: 12 },
                      { age: "55+", percentage: 3 }
                    ].map((age) => (
                      <div key={age.age} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{age.age}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={age.percentage} className="w-20" />
                          <span className="text-xs text-gray-500 w-8">{age.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}