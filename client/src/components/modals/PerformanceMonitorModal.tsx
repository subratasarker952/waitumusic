import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Clock, 
  Database,
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Monitor,
  Zap,
  Server
} from 'lucide-react';

interface PerformanceMonitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SystemResource {
  name: string;
  usage: number;
  total: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export default function PerformanceMonitorModal({ open, onOpenChange }: PerformanceMonitorModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'Response Time',
      value: 245,
      unit: 'ms',
      status: 'good',
      trend: 'stable',
      description: 'Average API response time'
    },
    {
      name: 'Throughput',
      value: 150,
      unit: 'req/min',
      status: 'good',
      trend: 'up',
      description: 'Requests processed per minute'
    },
    {
      name: 'Error Rate',
      value: 0.8,
      unit: '%',
      status: 'good',
      trend: 'down',
      description: 'Percentage of failed requests'
    },
    {
      name: 'Database Query Time',
      value: 89,
      unit: 'ms',
      status: 'good',
      trend: 'stable',
      description: 'Average database query execution time'
    },
    {
      name: 'Cache Hit Rate',
      value: 94.2,
      unit: '%',
      status: 'good',
      trend: 'up',
      description: 'Percentage of requests served from cache'
    },
    {
      name: 'Page Load Time',
      value: 1.8,
      unit: 's',
      status: 'warning',
      trend: 'up',
      description: 'Average frontend page load time'
    }
  ]);

  const [systemResources, setSystemResources] = useState<SystemResource[]>([
    {
      name: 'CPU Usage',
      usage: 23,
      total: 100,
      unit: '%',
      status: 'good'
    },
    {
      name: 'Memory Usage',
      usage: 1.8,
      total: 4.0,
      unit: 'GB',
      status: 'good'
    },
    {
      name: 'Disk Usage',
      usage: 12.5,
      total: 50.0,
      unit: 'GB',
      status: 'good'
    },
    {
      name: 'Network I/O',
      usage: 45.2,
      total: 100.0,
      unit: 'Mbps',
      status: 'good'
    },
    {
      name: 'Database Connections',
      usage: 8,
      total: 100,
      unit: 'connections',
      status: 'good'
    },
    {
      name: 'Active Sessions',
      usage: 23,
      total: 1000,
      unit: 'sessions',
      status: 'good'
    }
  ]);

  const [alertHistory, setAlertHistory] = useState([
    {
      id: '1',
      timestamp: '2025-01-23T10:15:00Z',
      level: 'warning',
      metric: 'Page Load Time',
      message: 'Page load time increased to 2.1s',
      resolved: true
    },
    {
      id: '2',
      timestamp: '2025-01-23T09:30:00Z',
      level: 'info',
      metric: 'Cache Hit Rate',
      message: 'Cache hit rate improved to 94.2%',
      resolved: true
    },
    {
      id: '3',
      timestamp: '2025-01-23T08:45:00Z',
      level: 'critical',
      metric: 'Database',
      message: 'Database connection pool exhausted',
      resolved: true
    },
    {
      id: '4',
      timestamp: '2025-01-23T08:00:00Z',
      level: 'warning',
      metric: 'Memory Usage',
      message: 'Memory usage exceeded 80%',
      resolved: true
    }
  ]);

  const [optimizationTasks, setOptimizationTasks] = useState([
    {
      id: '1',
      name: 'Database Index Optimization',
      status: 'completed',
      impact: 'high',
      description: 'Optimize database indexes for faster queries',
      estimatedImprovement: '25% faster queries'
    },
    {
      id: '2',
      name: 'Image Compression',
      status: 'in_progress',
      impact: 'medium',
      description: 'Compress and optimize uploaded images',
      estimatedImprovement: '15% faster page loads'
    },
    {
      id: '3',
      name: 'API Response Caching',
      status: 'pending',
      impact: 'high',
      description: 'Implement aggressive caching for static API responses',
      estimatedImprovement: '40% faster API responses'
    },
    {
      id: '4',
      name: 'CDN Implementation',
      status: 'pending',
      impact: 'high',
      description: 'Deploy content delivery network for static assets',
      estimatedImprovement: '60% faster asset loading'
    }
  ]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/admin/performance/metrics');
      const data = await response.json();
      
      if (data.metrics) {
        setPerformanceMetrics(data.metrics);
      }
      if (data.resources) {
        setSystemResources(data.resources);
      }
      if (data.alerts) {
        setAlertHistory(data.alerts);
      }
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runOptimization = async (taskId: string) => {
    try {
      await apiRequest('/api/admin/performance/optimize', {
        method: 'POST',
        body: { taskId }
      });
      
      toast({
        title: "Optimization Started",
        description: "Performance optimization task has been initiated."
      });
      
      // Update task status
      setOptimizationTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'in_progress' }
            : task
        )
      );
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Unable to start optimization task.",
        variant: "destructive"
      });
    }
  };

  const generatePerformanceReport = async () => {
    try {
      await apiRequest('/api/admin/performance/report', {
        method: 'POST'
      });
      
      toast({
        title: "Performance Report Generated",
        description: "Detailed performance report has been created and will be emailed to you."
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate performance report.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (open) {
      loadPerformanceData();
      // Set up real-time monitoring
      const interval = setInterval(loadPerformanceData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [open]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const getResourceUsagePercent = (resource: SystemResource) => {
    return Math.round((resource.usage / resource.total) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span>Performance Monitor</span>
          </DialogTitle>
          <DialogDescription>
            Real-time system performance monitoring, optimization, and reporting
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Optimization</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceMetrics.map((metric) => (
                <Card key={metric.name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    {getStatusIcon(metric.status)}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                        {metric.value}{metric.unit}
                      </div>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button onClick={loadPerformanceData} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Metrics
                  </Button>
                  <Button onClick={generatePerformanceReport} variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemResources.map((resource) => (
                <Card key={resource.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{resource.name}</span>
                      {getStatusIcon(resource.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{resource.usage} {resource.unit}</span>
                        <span>{getResourceUsagePercent(resource)}%</span>
                      </div>
                      <Progress 
                        value={getResourceUsagePercent(resource)} 
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        {resource.usage} / {resource.total} {resource.unit}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Alerts History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertHistory.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          alert.level === 'critical' ? 'bg-red-500' :
                          alert.level === 'warning' ? 'bg-yellow-500' : 
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {alert.metric} • {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={alert.resolved ? "secondary" : "destructive"}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                        <Badge variant="outline">
                          {alert.level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Optimization Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{task.name}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <p className="text-sm text-green-600 mt-1">
                          Expected: {task.estimatedImprovement}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          task.impact === 'high' ? 'destructive' :
                          task.impact === 'medium' ? 'default' : 'secondary'
                        }>
                          {task.impact} impact
                        </Badge>
                        <Badge variant={
                          task.status === 'completed' ? 'secondary' :
                          task.status === 'in_progress' ? 'default' : 'outline'
                        }>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        {task.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => runOptimization(task.id)}
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}