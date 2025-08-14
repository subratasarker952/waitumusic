import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Shield, AlertTriangle, CheckCircle, Database, Users, Clock, TrendingUp } from 'lucide-react';

interface HealthReport {
  uptime: number;
  errorRate: number;
  responseTime: number;
  databaseConnections: number;
  activeUsers: number;
  lastHealthCheck: string;
  totalErrorPatterns: number;
  criticalErrorsLastHour: number;
  topErrorTypes: [string, number][];
  preventionStrategies: string[];
}

interface ErrorPattern {
  pattern: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function OppHubHealthDashboard() {
  const [healthData, setHealthData] = useState<HealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [testError, setTestError] = useState<string>('');

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/opphub/health');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const reportTestError = async () => {
    try {
      setTestError('Testing error reporting...');
      const response = await fetch('/api/opphub/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Test error from health dashboard',
          context: 'health_dashboard_test'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setTestError(`Error reported successfully: ${result.pattern || 'Pattern learned'}`);
        // Refresh health data after reporting error
        setTimeout(fetchHealthData, 1000);
      }
    } catch (error) {
      setTestError('Failed to report test error');
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-green-600';
    if (uptime >= 99) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getErrorRateColor = (errorRate: number) => {
    if (errorRate === 0) return 'text-green-600';
    if (errorRate < 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading OppHub Health Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            OppHub Site Reliability Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time platform health with proactive error prevention
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchHealthData} variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={reportTestError} variant="outline" size="sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Test Error Reporting
          </Button>
        </div>
      </div>

      {testError && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{testError}</AlertDescription>
        </Alert>
      )}

      {healthData && (
        <>
          {/* Main Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  System Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getUptimeColor(healthData.uptime)}`}>
                    {healthData.uptime.toFixed(1)}%
                  </span>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Error Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getErrorRateColor(healthData.errorRate)}`}>
                    {healthData.errorRate.toFixed(2)}%
                  </span>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    {healthData.activeUsers}
                  </span>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {healthData.responseTime}ms
                  </span>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Error Pattern Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Patterns Learned:</span>
                  <Badge variant="secondary">{healthData.totalErrorPatterns}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Critical Errors (Last Hour):</span>
                  <Badge variant={healthData.criticalErrorsLastHour > 0 ? "destructive" : "default"}>
                    {healthData.criticalErrorsLastHour}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Top Error Types:</h4>
                  {healthData.topErrorTypes.map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{type}</span>
                      <Badge variant="outline">{count} occurrences</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Prevention Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthData.preventionStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{strategy}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium text-green-800 dark:text-green-200">Healthy</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">All systems operational</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-medium text-blue-800 dark:text-blue-200">Monitoring Active</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Error learning enabled</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-medium text-purple-800 dark:text-purple-200">Protected</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Proactive prevention active</p>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}