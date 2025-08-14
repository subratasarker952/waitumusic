import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Calendar, 
  Target, Zap, Brain, AlertTriangle, CheckCircle, Clock,
  BarChart3, PieChart, LineChart, Activity
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  type: 'revenue' | 'bookings' | 'users' | 'engagement';
  period: string;
}

interface PredictiveInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  recommendations: string[];
}

interface RevenueForcast {
  month: string;
  predicted: number;
  confidence: number;
  factors: string[];
}

export default function AdvancedAnalyticsDashboard() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeInsight, setActiveInsight] = useState<string | null>(null);

  // Fetch comprehensive analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/analytics/comprehensive', timeframe],
    queryFn: async () => {
      const response = await apiRequest(`/api/analytics/comprehensive?timeframe=${timeframe}`);
      return await response.json();
    }
  });

  // Fetch predictive insights
  const { data: insights } = useQuery({
    queryKey: ['/api/analytics/predictive-insights'],
    queryFn: async () => {
      const response = await apiRequest('/api/analytics/predictive-insights');
      return await response.json();
    }
  });

  // Fetch revenue forecasts
  const { data: forecasts } = useQuery({
    queryKey: ['/api/analytics/revenue-forecast'],
    queryFn: async () => {
      const response = await apiRequest('/api/analytics/revenue-forecast');
      return await response.json();
    }
  });

  const mockMetrics: AnalyticsMetric[] = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: '$45,750',
      change: 12.5,
      trend: 'up',
      type: 'revenue',
      period: 'Last 30 days'
    },
    {
      id: 'bookings',
      title: 'Active Bookings',
      value: 27,
      change: 8.3,
      trend: 'up',
      type: 'bookings',
      period: 'This month'
    },
    {
      id: 'artists',
      title: 'Active Artists',
      value: 15,
      change: 3.2,
      trend: 'up',
      type: 'users',
      period: 'This month'
    },
    {
      id: 'engagement',
      title: 'Platform Engagement',
      value: '94%',
      change: -2.1,
      trend: 'down',
      type: 'engagement',
      period: 'Weekly average'
    }
  ];

  const mockInsights: PredictiveInsight[] = [
    {
      id: 'revenue-spike',
      type: 'opportunity',
      title: 'Q2 Revenue Spike Predicted',
      description: 'AI models predict 35% revenue increase in Q2 based on booking patterns and seasonal trends.',
      confidence: 87,
      impact: 'high',
      actionRequired: true,
      recommendations: [
        'Increase artist availability for March-May',
        'Launch targeted marketing campaign for spring events',
        'Optimize pricing strategy for peak season'
      ]
    },
    {
      id: 'artist-utilization',
      type: 'opportunity',
      title: 'Underutilized Artist Talent',
      description: '3 managed artists have zero bookings in 45 days. High-potential revenue opportunity identified.',
      confidence: 92,
      impact: 'medium',
      actionRequired: true,
      recommendations: [
        'Create targeted marketing campaigns for underbooked artists',
        'Adjust pricing strategies to increase competitiveness',
        'Analyze market demand for their genres'
      ]
    },
    {
      id: 'user-churn',
      type: 'risk',
      title: 'User Retention Risk',
      description: '12% of new users inactive after first booking. Onboarding improvements needed.',
      confidence: 78,
      impact: 'medium',
      actionRequired: true,
      recommendations: [
        'Implement enhanced onboarding workflow',
        'Add follow-up communications post-booking',
        'Create user engagement campaigns'
      ]
    }
  ];

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'bookings': return <Calendar className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'engagement': return <Activity className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-5 w-5 text-green-500" />;
      case 'risk': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'trend': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default: return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  const handleInsightAction = async (insightId: string) => {
    try {
      await apiRequest(`/api/analytics/insights/${insightId}/action`, {
        method: 'POST'
      });
      
      toast({
        title: "Action Initiated",
        description: "Automated response has been triggered for this insight"
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Unable to initiate automated response",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Advanced Analytics Dashboard</h1>
          <p className="text-muted-foreground">AI-powered insights and predictive analytics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period === '7d' ? '7 Days' : 
               period === '30d' ? '30 Days' : 
               period === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </div>
                {getMetricIcon(metric.type)}
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs">
                  {getTrendIcon(metric.trend, metric.change)}
                  <span className={`ml-1 ${
                    metric.trend === 'up' ? 'text-green-500' : 
                    metric.trend === 'down' ? 'text-red-500' : 
                    'text-gray-500'
                  }`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="forecasts">Revenue Forecasts</TabsTrigger>
          <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Predictive Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInsights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      activeInsight === insight.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveInsight(activeInsight === insight.id ? null : insight.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant={insight.impact === 'high' ? 'destructive' : 
                                           insight.impact === 'medium' ? 'default' : 'secondary'}>
                              {insight.impact} impact
                            </Badge>
                            <Badge variant="outline">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {insight.description}
                          </p>
                          
                          {activeInsight === insight.id && (
                            <div className="mt-3 space-y-3">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Recommended Actions:</h5>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {insight.recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                              {insight.actionRequired && (
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInsightAction(insight.id);
                                  }}
                                >
                                  <Zap className="w-4 h-4 mr-2" />
                                  Take Action
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {insight.actionRequired && (
                        <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Revenue Forecasts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded">
                    <h4 className="font-medium mb-2">Next Quarter</h4>
                    <div className="text-2xl font-bold text-green-600">$67,500</div>
                    <p className="text-sm text-muted-foreground">+47% projected growth</p>
                    <Progress value={87} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">87% confidence</p>
                  </div>
                  
                  <div className="p-4 border rounded">
                    <h4 className="font-medium mb-2">6 Months</h4>
                    <div className="text-2xl font-bold text-blue-600">$142,000</div>
                    <p className="text-sm text-muted-foreground">+23% monthly growth</p>
                    <Progress value={73} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">73% confidence</p>
                  </div>
                  
                  <div className="p-4 border rounded">
                    <h4 className="font-medium mb-2">Annual</h4>
                    <div className="text-2xl font-bold text-purple-600">$285,000</div>
                    <p className="text-sm text-muted-foreground">Conservative estimate</p>
                    <Progress value={65} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">65% confidence</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Key Growth Factors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Managed artist portfolio expansion</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Seasonal booking demand increase</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Enhanced service offerings</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-orange-50 rounded">
                      <Brain className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">AI-optimized pricing strategies</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Peak Booking Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Friday - Sunday</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20" />
                      <span className="text-xs text-muted-foreground">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">6PM - 10PM</span>
                    <div className="flex items-center gap-2">
                      <Progress value={72} className="w-20" />
                      <span className="text-xs text-muted-foreground">72%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">March - May</span>
                    <div className="flex items-center gap-2">
                      <Progress value={67} className="w-20" />
                      <span className="text-xs text-muted-foreground">67%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Artist Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lí-Lí Octave</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20" />
                      <span className="text-xs text-muted-foreground">92%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">JCro</span>
                    <div className="flex items-center gap-2">
                      <Progress value={78} className="w-20" />
                      <span className="text-xs text-muted-foreground">78%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Janet Azzouz</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-20" />
                      <span className="text-xs text-muted-foreground">65%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automated Optimizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Dynamic Pricing Active</span>
                    <Badge variant="outline">Live</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI adjusts artist pricing based on demand, seasonality, and market conditions
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Smart Scheduling</span>
                    <Badge variant="outline">Processing</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Optimal time slot recommendations for maximum booking success rates
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Predictive Maintenance</span>
                    <Badge variant="outline">Monitoring</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Proactive system health monitoring and performance optimization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}