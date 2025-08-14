import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Wrench, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DataIssue {
  id: string;
  type: 'critical' | 'medium' | 'low';
  description: string;
  table: string;
  status: 'active' | 'fixed';
  fixedAt?: Date;
}

export function DataIntegrityFixTracker() {
  const [issues, setIssues] = useState<DataIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadIssues = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/data-integrity/issues');
      setIssues(response.issues || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load data integrity issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runFixes = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/api/data-integrity/run-fixes', {
        method: 'POST'
      });
      await loadIssues(); // Refresh after fixes
    } catch (error) {
      console.error('Failed to run fixes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const activeIssues = issues.filter(issue => issue.status === 'active');
  const fixedIssues = issues.filter(issue => issue.status === 'fixed');

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Data Integrity Fix Tracker
        </CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={loadIssues}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={runFixes}
            disabled={isLoading || activeIssues.length === 0}
            size="sm"
          >
            Run Fixes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Active Issues</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{activeIssues.length}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Fixed Issues</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{fixedIssues.length}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Last Refresh</span>
            </div>
            <div className="text-sm text-blue-600">
              {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {activeIssues.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Active Issues</h3>
            <div className="space-y-2">
              {activeIssues.map(issue => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        issue.type === 'critical' ? 'bg-red-100 text-red-800' :
                        issue.type === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {issue.type}
                      </span>
                      <span className="font-medium">{issue.table}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                  </div>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {fixedIssues.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Recently Fixed</h3>
            <div className="space-y-2">
              {fixedIssues.slice(0, 5).map(issue => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        fixed
                      </span>
                      <span className="font-medium">{issue.table}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                    {issue.fixedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Fixed: {new Date(issue.fixedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {issues.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>No data integrity issues found</p>
            <p className="text-sm">All systems appear to be functioning normally</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}