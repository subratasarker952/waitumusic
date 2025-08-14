import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3, 
  PieChart, 
  TrendingUpDown,
  Calendar,
  Globe,
  Music,
  Mic,
  Users,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  Edit,
  RefreshCw
} from "lucide-react";
import type { 
  RevenueStream, 
  RevenueGoal, 
  RevenueForecast, 
  MarketTrend, 
  RevenueOptimization,
  User
} from "@shared/schema";
import { CreateRevenueStreamModal, CreateRevenueGoalModal, GenerateForecastModal } from '@/components/modals/RevenueModals';

interface RevenueAnalyticsDashboardProps {
  user: User;
  allowedUsers?: User[];
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueByStream: Record<string, number>;
  growthRate: number;
  topPerformingStreams: Array<{ name: string; amount: number; growth: number }>;
}

interface RevenueForecastData {
  period: string;
  forecast: number;
  confidence: number;
  breakdown: Record<string, number>;
}

export function RevenueAnalyticsDashboard({ user, allowedUsers = [] }: RevenueAnalyticsDashboardProps) {
  const [selectedUserId, setSelectedUserId] = useState<number>(user?.id || 0);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("12months");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Modal state variables
  const [streamModalOpen, setStreamModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [forecastModalOpen, setForecastModalOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Early return if user is not available
  if (!user || !user.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Revenue Streams Query
  const { data: revenueStreams = [], isLoading: streamsLoading } = useQuery<RevenueStream[]>({
    queryKey: ['/api/revenue/streams', selectedUserId, selectedTimeframe],
    queryFn: async () => {
      const response = await apiRequest(`/api/revenue/streams?userId=${selectedUserId}&timeframe=${selectedTimeframe}`);
      return response.json();
    },
  });

  // Revenue Goals Query  
  const { data: revenueGoals = [], isLoading: goalsLoading } = useQuery<RevenueGoal[]>({
    queryKey: ['/api/revenue/goals', selectedUserId],
    queryFn: async () => {
      const response = await apiRequest(`/api/revenue/goals?userId=${selectedUserId}`);
      return response.json();
    },
  });

  // Revenue Forecasts Query
  const { data: revenueForecasts = [], isLoading: forecastsLoading } = useQuery<RevenueForecast[]>({
    queryKey: ['/api/revenue/forecasts', selectedUserId],
    queryFn: async () => {
      const response = await apiRequest(`/api/revenue/forecasts?userId=${selectedUserId}`);
      return response.json();
    },
  });

  // Market Trends Query
  const { data: marketTrends = [], isLoading: trendsLoading } = useQuery<MarketTrend[]>({
    queryKey: ['/api/revenue/market-trends', selectedUserId],
    queryFn: async () => {
      const response = await apiRequest(`/api/revenue/market-trends?userId=${selectedUserId}`);
      return response.json();
    },
  });

  // Revenue Metrics Query
  const { data: revenueMetrics, isLoading: metricsLoading } = useQuery<RevenueMetrics>({
    queryKey: ['/api/revenue/metrics', selectedUserId, selectedTimeframe],
    queryFn: async () => {
      const response = await apiRequest(`/api/revenue/metrics?userId=${selectedUserId}&timeframe=${selectedTimeframe}`);
      return response.json();
    },
  });

  // Revenue Optimizations Query
  const { data: optimizations = [], isLoading: optimizationsLoading } = useQuery<RevenueOptimization[]>({
    queryKey: ['/api/revenue/optimizations', selectedUserId],
    queryFn: async () => {
      const response = await apiRequest(`/api/revenue/optimizations?userId=${selectedUserId}`);
      return response.json();
    },
  });

  // Generate Forecast Mutation
  const generateForecastMutation = useMutation({
    mutationFn: (data: { userId: number; forecastType: string; method: string }) =>
      apiRequest('/api/revenue/forecasts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue/forecasts'] });
      toast({
        title: "Forecast Generated",
        description: "AI revenue forecast has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Forecast Failed",
        description: "Failed to generate revenue forecast.",
        variant: "destructive",
      });
    },
  });

  // Create Goal Mutation
  const createGoalMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/revenue/goals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue/goals'] });
      toast({
        title: "Goal Created",
        description: "Revenue goal has been created successfully.",
      });
    },
  });

  const getStreamTypeIcon = (streamType: string) => {
    const icons: Record<string, any> = {
      booking: Calendar,
      streaming: Music,
      merchandise: Star,
      sync_licensing: Mic,
      brand_partnership: Users,
      performance_royalties: DollarSign,
      mechanical_royalties: BarChart3,
      publishing: Globe,
    };
    return icons[streamType] || Activity;
  };

  const getStreamTypeColor = (streamType: string) => {
    const colors: Record<string, string> = {
      booking: "text-blue-600",
      streaming: "text-green-600",
      merchandise: "text-purple-600",
      sync_licensing: "text-orange-600",
      brand_partnership: "text-pink-600",
      performance_royalties: "text-yellow-600",
      mechanical_royalties: "text-indigo-600",
      publishing: "text-red-600",
    };
    return colors[streamType] || "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Analytics & Forecasting</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced revenue tracking, forecasting, and optimization for {selectedUserId === user.id ? 'your' : 'managed'} music career
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {allowedUsers.length > 1 && (
            <Select value={selectedUserId.toString()} onValueChange={(value) => setSelectedUserId(parseInt(value))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Artist" />
              </SelectTrigger>
              <SelectContent>
                {allowedUsers.map((allowedUser) => (
                  <SelectItem key={allowedUser.id} value={allowedUser.id.toString()}>
                    {allowedUser.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">12 Months</SelectItem>
              <SelectItem value="24months">24 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {revenueMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.totalRevenue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {revenueMetrics.growthRate > 0 ? (
                  <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {Math.abs(revenueMetrics.growthRate)}% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">Based on {selectedTimeframe}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Stream</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueMetrics.topPerformingStreams[0]?.name || 'No Data'}
              </div>
              <p className="text-xs text-muted-foreground">
                {revenueMetrics.topPerformingStreams[0] && 
                  formatCurrency(revenueMetrics.topPerformingStreams[0].amount)
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Streams</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(revenueMetrics.revenueByStream).length}
              </div>
              <p className="text-xs text-muted-foreground">Active revenue sources</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Stream Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Stream Type</CardTitle>
                <CardDescription>Distribution of revenue across different income streams</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueMetrics && (
                  <div className="space-y-4">
                    {Object.entries(revenueMetrics.revenueByStream).map(([streamType, amount]) => {
                      const Icon = getStreamTypeIcon(streamType);
                      const percentage = (amount / revenueMetrics.totalRevenue) * 100;
                      return (
                        <div key={streamType} className="flex items-center space-x-3">
                          <Icon className={`h-4 w-4 ${getStreamTypeColor(streamType)}`} />
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium capitalize">
                                {streamType.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Goals Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Goals Progress</CardTitle>
                <CardDescription>Track progress toward your revenue targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueGoals.slice(0, 3).map((goal: RevenueGoal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{goal.description || goal.goalType}</span>
                        <Badge variant={parseFloat(goal.progress || "0") >= 100 ? "default" : "secondary"}>
                          {parseFloat(goal.progress || "0").toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={parseFloat(goal.progress || "0")} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(parseFloat(goal.targetAmount))}</span>
                        <span>{goal.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Streams Tab */}
        <TabsContent value="streams" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Revenue Streams</h3>
              <p className="text-sm text-muted-foreground">Track all your income sources</p>
            </div>
            <Button onClick={() => setStreamModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stream
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revenueStreams.map((stream: RevenueStream) => {
              const Icon = getStreamTypeIcon(stream.streamType);
              return (
                <Card key={stream.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${getStreamTypeColor(stream.streamType)}`} />
                        <CardTitle className="text-sm">{stream.streamName}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {stream.streamType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {formatCurrency(parseFloat(stream.usdEquivalent))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Received: {new Date(stream.dateReceived).toLocaleDateString()}
                      </div>
                      <Badge 
                        variant={stream.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {stream.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Revenue Goals</h3>
              <p className="text-sm text-muted-foreground">Set and track your revenue targets</p>
            </div>
            <Button onClick={() => setGoalModalOpen(true)}>
              <Target className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {revenueGoals.map((goal: RevenueGoal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{goal.description || goal.goalType}</CardTitle>
                      <CardDescription className="capitalize">{goal.goalType.replace('_', ' ')}</CardDescription>
                    </div>
                    <Badge variant={goal.isActive ? 'default' : 'secondary'}>
                      {goal.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">{parseFloat(goal.progress || "0").toFixed(1)}%</span>
                    </div>
                    <Progress value={parseFloat(goal.progress || "0")} className="h-3" />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Target</span>
                    <span className="font-medium">{formatCurrency(parseFloat(goal.targetAmount))}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Timeframe</span>
                    <span className="capitalize">{goal.timeframe}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Target Date</span>
                    <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Revenue Forecasts</h3>
              <p className="text-sm text-muted-foreground">AI-powered revenue predictions</p>
            </div>
            <Button onClick={() => setForecastModalOpen(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Forecast
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {revenueForecasts.map((forecast: RevenueForecast) => (
              <Card key={forecast.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base capitalize">{forecast.forecastType} Forecast</CardTitle>
                      <CardDescription>
                        {new Date(forecast.forecastPeriod).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {(parseFloat(forecast.confidenceLevel) * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">
                    {formatCurrency(parseFloat(forecast.totalForecast))}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Breakdown by Stream</div>
                    {Object.entries(forecast.streamBreakdown).map(([stream, amount]) => (
                      <div key={stream} className="flex justify-between text-sm">
                        <span className="capitalize">{stream.replace('_', ' ')}</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Method: {forecast.forecastMethod.replace('_', ' ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Market Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Market Trends</h3>
            <p className="text-sm text-muted-foreground">Industry trends affecting your revenue potential</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketTrends.map((trend: MarketTrend) => (
              <Card key={trend.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm">{trend.trendType.replace('_', ' ')}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {trend.region}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Current Value</span>
                      <span className="font-medium">{formatCurrency(parseFloat(trend.trendValue))}</span>
                    </div>
                    
                    {trend.changePercentage && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Change</span>
                        <div className="flex items-center">
                          {parseFloat(trend.changePercentage) > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                          )}
                          <span className={`text-xs ${parseFloat(trend.changePercentage) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(parseFloat(trend.changePercentage)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Reliability</span>
                      <Progress 
                        value={parseFloat(trend.reliability) * 100} 
                        className="w-16 h-2"
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Source: {trend.dataSource.replace('_', ' ')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimize" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Revenue Optimization</h3>
            <p className="text-sm text-muted-foreground">AI-powered recommendations to maximize your revenue</p>
          </div>

          <div className="space-y-4">
            {optimizations.map((optimization: RevenueOptimization) => (
              <Card key={optimization.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base capitalize">
                        {optimization.optimizationType.replace('_', ' ')}
                      </CardTitle>
                      <CardDescription>
                        Projected Impact: {formatCurrency(parseFloat(optimization.projectedImpact || "0"))}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={optimization.status === 'completed' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {optimization.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>ROI</span>
                      <span className="font-medium">{parseFloat(optimization.roi || "0").toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Implementation Cost</span>
                      <span>{formatCurrency(parseFloat(optimization.implementationCost || "0"))}</span>
                    </div>
                    
                    {optimization.recommendedActions && (
                      <div>
                        <div className="text-sm font-medium mb-2">Recommended Actions</div>
                        <div className="space-y-1">
                          {optimization.recommendedActions.slice(0, 3).map((action, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              • {action.action}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Components */}
      <CreateRevenueStreamModal
        open={streamModalOpen}
        onOpenChange={setStreamModalOpen}
        userId={selectedUserId}
      />
      
      <CreateRevenueGoalModal
        open={goalModalOpen}
        onOpenChange={setGoalModalOpen}
        userId={selectedUserId}
      />
      
      <GenerateForecastModal
        open={forecastModalOpen}
        onOpenChange={setForecastModalOpen}
        userId={selectedUserId}
      />
    </div>
  );
}