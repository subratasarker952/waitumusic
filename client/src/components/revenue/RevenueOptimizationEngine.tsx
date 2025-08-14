import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  DollarSign, TrendingUp, Target, Zap, Brain, Settings,
  BarChart3, PieChart, Sparkles, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Clock, Users
} from 'lucide-react';

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive' | 'testing';
  expectedIncrease: number;
  timeframe: string;
  requirements: string[];
}

interface RevenueMetric {
  id: string;
  name: string;
  currentValue: number;
  optimizedValue: number;
  potential: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastTriggered?: Date;
  successRate: number;
}

export default function RevenueOptimizationEngine() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'strategies' | 'automation' | 'metrics'>('strategies');
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  // Fetch optimization data
  const { data: optimizationData, isLoading } = useQuery({
    queryKey: ['/api/revenue-optimization/analysis'],
    queryFn: async () => {
      const response = await apiRequest('/api/revenue-optimization/analysis');
      return await response.json();
    }
  });

  // Mutation for enabling/disabling strategies
  const toggleStrategyMutation = useMutation({
    mutationFn: async ({ strategyId, enabled }: { strategyId: string; enabled: boolean }) => {
      const response = await apiRequest(`/api/revenue-optimization/strategies/${strategyId}`, {
        method: 'PATCH',
        body: { enabled }
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue-optimization/analysis'] });
      toast({
        title: "Strategy Updated",
        description: "Revenue optimization strategy has been updated successfully"
      });
    }
  });

  // Revenue optimization strategies from API
  const { data: strategies } = useQuery({
    queryKey: ['/api/revenue/optimization-strategies']
  });
  
  const optimizationStrategies: OptimizationStrategy[] = (strategies as OptimizationStrategy[]) || [
    {
      id: 'dynamic-pricing',
      name: 'Dynamic Pricing Algorithm',
      description: 'AI-powered pricing that adjusts based on demand, season, and market conditions',
      impact: 'high',
      status: 'active',
      expectedIncrease: 23,
      timeframe: 'Immediate',
      requirements: ['Market data integration', 'Artist approval workflow']
    },
    {
      id: 'peak-season-boost',
      name: 'Peak Season Revenue Boost',
      description: 'Automatically increase rates during high-demand periods (March-May, Nov-Dec)',
      impact: 'high',
      status: 'active',
      expectedIncrease: 35,
      timeframe: 'Seasonal',
      requirements: ['Calendar integration', 'Demand forecasting']
    },
    {
      id: 'bundle-optimization',
      name: 'Service Bundle Optimization',
      description: 'Create and promote high-value service packages with cross-selling',
      impact: 'medium',
      status: 'testing',
      expectedIncrease: 18,
      timeframe: '2-4 weeks',
      requirements: ['Service catalog analysis', 'Customer preference data']
    },
    {
      id: 'retention-pricing',
      name: 'Client Retention Pricing',
      description: 'Loyalty-based pricing tiers for repeat customers and long-term contracts',
      impact: 'medium',
      status: 'inactive',
      expectedIncrease: 15,
      timeframe: '1-3 months',
      requirements: ['Customer history analysis', 'Loyalty program setup']
    }
  ];

  const mockMetrics: RevenueMetric[] = [
    {
      id: 'average-booking-value',
      name: 'Average Booking Value',
      currentValue: 2650,
      optimizedValue: 3125,
      potential: 17.9,
      trend: 'up',
      recommendation: 'Implement premium service packages for 15% value increase'
    },
    {
      id: 'conversion-rate',
      name: 'Booking Conversion Rate',
      currentValue: 73,
      optimizedValue: 87,
      potential: 19.2,
      trend: 'up',
      recommendation: 'Optimize response time and personalize artist recommendations'
    },
    {
      id: 'profit-margin',
      name: 'Average Profit Margin',
      currentValue: 42,
      optimizedValue: 58,
      potential: 38.1,
      trend: 'stable',
      recommendation: 'Reduce operational costs through automation and efficiency gains'
    },
    {
      id: 'repeat-client-rate',
      name: 'Repeat Client Rate',
      currentValue: 34,
      optimizedValue: 52,
      potential: 52.9,
      trend: 'up',
      recommendation: 'Launch loyalty program and proactive follow-up campaigns'
    }
  ];

  const mockAutomationRules: AutomationRule[] = [
    {
      id: 'price-alert',
      name: 'Competitive Price Alert',
      trigger: 'When competitor prices drop 10%+',
      action: 'Notify admins and suggest price adjustment',
      enabled: true,
      lastTriggered: new Date('2025-01-20'),
      successRate: 94
    },
    {
      id: 'demand-surge',
      name: 'Demand Surge Pricing',
      trigger: 'When booking requests exceed 150% of average',
      action: 'Automatically increase prices by 15%',
      enabled: true,
      lastTriggered: new Date('2025-01-18'),
      successRate: 87
    },
    {
      id: 'low-utilization',
      name: 'Low Utilization Response',
      trigger: 'When artist bookings below 30% of capacity',
      action: 'Reduce prices by 10% and boost marketing',
      enabled: false,
      successRate: 76
    },
    {
      id: 'season-adjustment',
      name: 'Seasonal Price Adjustment',
      trigger: 'Start of peak/off-peak seasons',
      action: 'Adjust all artist rates by seasonal multiplier',
      enabled: true,
      lastTriggered: new Date('2025-01-15'),
      successRate: 92
    }
  ];

  const handleStrategyToggle = (strategyId: string, enabled: boolean) => {
    toggleStrategyMutation.mutate({ strategyId, enabled });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'testing': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'stable': return <BarChart3 className="h-4 w-4 text-gray-500" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Revenue Optimization Engine
          </h1>
          <p className="text-muted-foreground">AI-powered revenue maximization and automation</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'strategies' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('strategies')}
          >
            <Target className="h-4 w-4 mr-2" />
            Strategies
          </Button>
          <Button
            variant={activeTab === 'automation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('automation')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Automation
          </Button>
          <Button
            variant={activeTab === 'metrics' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('metrics')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Metrics
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Potential</p>
                <p className="text-2xl font-bold text-green-600">+$127K</p>
                <p className="text-xs text-muted-foreground">Annual projection</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Strategies</p>
                <p className="text-2xl font-bold">3 / 4</p>
                <p className="text-xs text-muted-foreground">75% implementation</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Optimization Score</p>
                <p className="text-2xl font-bold text-blue-600">87%</p>
                <p className="text-xs text-muted-foreground">Above industry avg</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROI Improvement</p>
                <p className="text-2xl font-bold text-orange-600">+32%</p>
                <p className="text-xs text-muted-foreground">Last 90 days</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === 'strategies' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Optimization Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizationStrategies.map((strategy: OptimizationStrategy) => (
                <div 
                  key={strategy.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStrategy === strategy.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedStrategy(selectedStrategy === strategy.id ? null : strategy.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(strategy.status)}`}></div>
                        <h4 className="font-semibold">{strategy.name}</h4>
                        <Badge className={getImpactColor(strategy.impact)}>
                          {strategy.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          +{strategy.expectedIncrease}% revenue
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {strategy.description}
                      </p>
                      
                      {selectedStrategy === strategy.id && (
                        <div className="mt-4 space-y-3">
                          <div>
                            <h5 className="font-medium text-sm mb-2">Requirements:</h5>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {strategy.requirements.map((req: string, idx: number) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">Implementation Time:</span>
                            <Badge variant="secondary">{strategy.timeframe}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={strategy.status === 'active'}
                        onCheckedChange={(checked) => handleStrategyToggle(strategy.id, checked)}
                      />
                      {strategy.status === 'active' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {strategy.status === 'testing' && <Clock className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'automation' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Automation Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAutomationRules.map((rule) => (
                <div key={rule.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{rule.name}</h4>
                        <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {rule.successRate}% success
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Trigger: </span>
                          <span>{rule.trigger}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Action: </span>
                          <span>{rule.action}</span>
                        </div>
                      </div>
                      {rule.lastTriggered && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last triggered: {rule.lastTriggered.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => {
                        // Handle automation rule toggle
                        toast({
                          title: checked ? "Rule Activated" : "Rule Deactivated",
                          description: `${rule.name} is now ${checked ? 'active' : 'inactive'}`
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'metrics' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Metrics & Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockMetrics.map((metric) => (
                <div key={metric.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {metric.name}
                        {getTrendIcon(metric.trend)}
                      </h4>
                      <p className="text-sm text-muted-foreground">{metric.recommendation}</p>
                    </div>
                    <Badge className="bg-green-50 text-green-700">
                      +{metric.potential.toFixed(1)}% potential
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-bold">{metric.currentValue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Current</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{metric.optimizedValue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Optimized</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">+{(metric.optimizedValue - metric.currentValue).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Improvement</div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Optimization Progress</span>
                      <span>{metric.potential.toFixed(1)}%</span>
                    </div>
                    <Progress value={metric.potential} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}