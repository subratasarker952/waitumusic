import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  RefreshCw,
  Zap,
  Database,
  Globe,
  Shield,
  Settings,
  TrendingUp,
  AlertCircle,
  PlayCircle,
  StopCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface SystemIssue {
  category: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  component: string;
  issue: string;
  expectedBehavior: string;
  actualBehavior: string;
  rootCause: string;
  preventiveMeasures: string[];
  autoFixAvailable: boolean;
  priority: number;
}

interface ComponentHealth {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILING' | 'BROKEN';
  issues: SystemIssue[];
  dependencies: string[];
  criticalityScore: number;
}

interface SystemAnalysis {
  overallHealth: number;
  criticalIssues: SystemIssue[];
  componentHealth: ComponentHealth[];
  preventiveMeasures: string[];
  proactiveRecommendations: string[];
}

export const ComprehensiveSystemAnalyzer: React.FC = () => {
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [autoFixRunning, setAutoFixRunning] = useState(false);

  // Fetch system analysis
  const { data: analysis, isLoading, refetch } = useQuery<{
    success: boolean;
    analysis: SystemAnalysis;
    timestamp: string;
  }>({
    queryKey: ['/api/system-analysis/comprehensive'],
    enabled: false, // Only run on manual trigger
  });

  // Auto-fix mutation
  const autoFixMutation = useMutation({
    mutationFn: () => apiRequest('/api/system-analysis/auto-fix', { method: 'POST' }),
    onSuccess: (data) => {
      toast({
        title: "Auto-fix Complete",
        description: `Fixed ${data.result.fixed} issues, ${data.result.failed} failed`
      });
      refetch(); // Refresh analysis after fixes
    },
    onError: (error) => {
      toast({
        title: "Auto-fix Failed",
        description: "Failed to apply automatic fixes",
        variant: "destructive"
      });
    }
  });

  const runAnalysis = async () => {
    setAnalysisRunning(true);
    try {
      await refetch();
      toast({
        title: "System Analysis Complete",
        description: "Comprehensive system analysis has been completed"
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to run system analysis",
        variant: "destructive"
      });
    } finally {
      setAnalysisRunning(false);
    }
  };

  const runAutoFix = async () => {
    setAutoFixRunning(true);
    try {
      await autoFixMutation.mutateAsync();
    } finally {
      setAutoFixRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600 dark:text-green-400';
      case 'DEGRADED': return 'text-yellow-600 dark:text-yellow-400';
      case 'FAILING': return 'text-orange-600 dark:text-orange-400';
      case 'BROKEN': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'DEGRADED': return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'FAILING': return <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'BROKEN': return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default: return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>OppHub Comprehensive System Analyzer</span>
          </CardTitle>
          <CardDescription>
            Proactive identification and prevention of all platform issues. This analyzer examines every component 
            to identify what should be working but isn't, and implements preventive measures.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runAnalysis} 
              disabled={analysisRunning || isLoading}
              className="flex items-center space-x-2"
            >
              {analysisRunning || isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              <span>{analysisRunning || isLoading ? 'Analyzing...' : 'Run Comprehensive Analysis'}</span>
            </Button>
            
            {analysis?.analysis && (
              <Button 
                onClick={runAutoFix} 
                disabled={autoFixRunning}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {autoFixRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                <span>{autoFixRunning ? 'Applying Fixes...' : 'Apply Auto-Fixes'}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis?.analysis && (
        <div className="space-y-6">
          {/* Overall Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall System Health</span>
                <Badge variant={analysis.analysis.overallHealth >= 90 ? "default" : 
                             analysis.analysis.overallHealth >= 70 ? "secondary" : "destructive"}>
                  {analysis.analysis.overallHealth}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={analysis.analysis.overallHealth} className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analysis.analysis.componentHealth.filter(c => c.status === 'HEALTHY').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Healthy Components</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {analysis.analysis.componentHealth.filter(c => ['DEGRADED', 'FAILING'].includes(c.status)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Degraded Components</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {analysis.analysis.criticalIssues.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Critical Issues</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Tabs defaultValue="issues" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="issues">Critical Issues</TabsTrigger>
              <TabsTrigger value="components">Component Health</TabsTrigger>
              <TabsTrigger value="preventive">Preventive Measures</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Critical Issues Requiring Immediate Attention</CardTitle>
                  <CardDescription>
                    Issues that should be working but aren't, and their root causes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {analysis.analysis.criticalIssues.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <p className="text-lg font-medium">No Critical Issues Found</p>
                        <p className="text-muted-foreground">All critical systems are functioning properly</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {analysis.analysis.criticalIssues.map((issue, index) => (
                          <Card key={index} className="border-red-200 dark:border-red-800">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <XCircle className="h-5 w-5 text-red-600" />
                                  <span className="font-medium">{issue.component}</span>
                                </div>
                                <Badge className={getCategoryColor(issue.category)}>
                                  {issue.category}
                                </Badge>
                              </div>
                              <h4 className="font-medium mb-2">{issue.issue}</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Expected: </span>
                                  <span className="text-muted-foreground">{issue.expectedBehavior}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Actual: </span>
                                  <span className="text-muted-foreground">{issue.actualBehavior}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Root Cause: </span>
                                  <span className="text-muted-foreground">{issue.rootCause}</span>
                                </div>
                                {issue.autoFixAvailable && (
                                  <Badge variant="outline" className="text-green-600">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Auto-fix Available
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="components" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Component Health Status</CardTitle>
                  <CardDescription>
                    Detailed health status of all platform components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {analysis.analysis.componentHealth
                        .sort((a, b) => b.criticalityScore - a.criticalityScore)
                        .map((component, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(component.status)}
                                <span className="font-medium">{component.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  Priority: {component.criticalityScore}
                                </Badge>
                                <Badge className={getStatusColor(component.status)}>
                                  {component.status}
                                </Badge>
                              </div>
                            </div>
                            {component.issues.length > 0 && (
                              <div className="space-y-2">
                                <Separator />
                                <div className="text-sm">
                                  <span className="font-medium">Issues ({component.issues.length}):</span>
                                  <ul className="list-disc list-inside mt-1 space-y-1">
                                    {component.issues.map((issue, issueIndex) => (
                                      <li key={issueIndex} className="text-muted-foreground">
                                        {issue.issue}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Dependencies: </span>
                              {component.dependencies.join(', ')}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preventive" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preventive Measures</CardTitle>
                  <CardDescription>
                    Proactive measures to prevent future issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {analysis.analysis.preventiveMeasures.map((measure, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 rounded border">
                          <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span className="text-sm">{measure}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Proactive Recommendations</CardTitle>
                  <CardDescription>
                    Strategic recommendations for long-term platform health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {analysis.analysis.proactiveRecommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 rounded border">
                          <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Timestamp */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center text-sm text-muted-foreground">
                Last analysis: {new Date(analysis.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Initial State */}
      {!analysis && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Ready to Analyze System Health</h3>
            <p className="text-muted-foreground mb-4">
              Click "Run Comprehensive Analysis" to identify all issues that should be working but aren't, 
              and get proactive recommendations for prevention.
            </p>
            <Button onClick={runAnalysis} size="lg">
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};