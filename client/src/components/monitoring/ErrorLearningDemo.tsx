import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, Shield, CheckCircle, Zap } from 'lucide-react';

interface ErrorDemoResult {
  message: string;
  pattern?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export default function ErrorLearningDemo() {
  const [results, setResults] = useState<ErrorDemoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testScenarios = [
    {
      name: "Database Connection Error",
      error: "Database connection timeout after 30 seconds",
      context: "user_authentication_system",
      description: "Simulates database connectivity issues during user login"
    },
    {
      name: "Schema Missing Column",
      error: "column 'workflow_data' does not exist in table 'bookings'",
      context: "booking_workflow_access",
      description: "Tests schema validation and automatic fix recommendations"
    },
    {
      name: "API Rate Limit",
      error: "Rate limit exceeded: 429 Too Many Requests",
      context: "opportunity_scanner",
      description: "Demonstrates API throttling detection and prevention"
    },
    {
      name: "Authentication Token Expired",
      error: "JWT token has expired",
      context: "protected_route_access",
      description: "Shows token validation and refresh learning"
    }
  ];

  const runErrorTest = async (scenario: typeof testScenarios[0]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/opphub/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: scenario.error,
          context: scenario.context
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setResults(prev => [{
          message: `${scenario.name}: ${result.message}`,
          pattern: result.pattern,
          severity: result.severity
        }, ...prev]);
      }
    } catch (error) {
      setResults(prev => [{
        message: `${scenario.name}: Failed to report error`,
        severity: 'high'
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    for (const scenario of testScenarios) {
      await runErrorTest(scenario);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsLoading(false);
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            OppHub Error Learning System Demo
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test the intelligent error pattern recognition and prevention system
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runAllTests} disabled={isLoading}>
              {isLoading ? 'Running Tests...' : 'Run All Error Tests'}
            </Button>
            {testScenarios.map((scenario, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => runErrorTest(scenario)}
                disabled={isLoading}
              >
                {scenario.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testScenarios.map((scenario, index) => (
              <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium text-sm mb-1">{scenario.name}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{scenario.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Error Learning Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <Alert key={index}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <AlertDescription className="mb-2">
                        {result.message}
                      </AlertDescription>
                      {result.pattern && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pattern learned: {result.pattern}
                        </p>
                      )}
                    </div>
                    {result.severity && (
                      <Badge className={getSeverityColor(result.severity)}>
                        {result.severity.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            How OppHub Error Learning Protects Your Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Database className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-sm mb-1">Pattern Recognition</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Automatically categorizes and learns from all error types
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-sm mb-1">Prevention Strategies</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Generates prevention recommendations for each error type
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-medium text-sm mb-1">Auto-Recovery</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Provides immediate fixes for critical database schema errors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}