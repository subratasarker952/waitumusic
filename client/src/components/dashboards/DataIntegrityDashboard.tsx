import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  AlertTriangle, CheckCircle, Clock, Database, Search, 
  Shield, Users, Zap, RefreshCw, Eye, Settings 
} from 'lucide-react';

interface DataInconsistency {
  id: string;
  type: 'role_mismatch' | 'dummy_data' | 'null_data' | 'duplicate_data' | 'incomplete_profile';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedTable: string;
  affectedRecordId: number;
  currentValue: any;
  suggestedFix: any;
  confidence: number;
  researchEvidence: string[];
  autoFixable: boolean;
  created_at: string;
}

interface DataIntegrityReport {
  scan_id: string;
  scan_date: string;
  total_records_scanned: number;
  inconsistencies_found: number;
  critical_issues: number;
  auto_fixable_issues: number;
  issues: DataInconsistency[];
  recommendations: string[];
}

export default function DataIntegrityDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch latest integrity report
  const { data: report, isLoading, refetch } = useQuery<DataIntegrityReport>({
    queryKey: ['/api/data-integrity/latest-report'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Run new integrity scan
  const scanMutation = useMutation({
    mutationFn: () => apiRequest('/api/data-integrity/scan', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Data Integrity Scan Complete",
        description: "New scan completed successfully. Reviewing results...",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/data-integrity/latest-report'] });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: `Data integrity scan failed: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Apply approved fixes
  const applyFixesMutation = useMutation({
    mutationFn: (data: { scanId: string; issueIds: string[] }) => 
      apiRequest('/api/data-integrity/apply-fixes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (result) => {
      toast({
        title: "Fixes Applied",
        description: `Applied ${result.applied.length} fixes. ${result.failed.length} failed.`,
      });
      setSelectedIssues(new Set());
      queryClient.invalidateQueries({ queryKey: ['/api/data-integrity/latest-report'] });
    },
    onError: (error) => {
      toast({
        title: "Fix Application Failed",
        description: `Failed to apply fixes: ${error}`,
        variant: "destructive",
      });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'role_mismatch': return <Users className="h-4 w-4" />;
      case 'dummy_data': return <AlertTriangle className="h-4 w-4" />;
      case 'null_data': return <Database className="h-4 w-4" />;
      case 'duplicate_data': return <Shield className="h-4 w-4" />;
      case 'incomplete_profile': return <Settings className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const handleIssueSelection = (issueId: string, checked: boolean) => {
    const newSelection = new Set(selectedIssues);
    if (checked) {
      newSelection.add(issueId);
    } else {
      newSelection.delete(issueId);
    }
    setSelectedIssues(newSelection);
  };

  const handleApplySelectedFixes = () => {
    if (!report || selectedIssues.size === 0) return;
    
    const selectedIssuesList = Array.from(selectedIssues);
    const autoFixableSelected = selectedIssuesList.filter(id => 
      report.issues.find(issue => issue.id === id)?.autoFixable
    );

    if (autoFixableSelected.length === 0) {
      toast({
        title: "No Auto-Fixable Issues Selected",
        description: "Please select issues that can be automatically fixed.",
        variant: "destructive",
      });
      return;
    }

    applyFixesMutation.mutate({
      scanId: report.scan_id,
      issueIds: autoFixableSelected
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading data integrity report...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Data Integrity Dashboard
          </h1>
          <p className="text-muted-foreground">
            Proactive detection and resolution of data inconsistencies
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => scanMutation.mutate()} 
            disabled={scanMutation.isPending}
          >
            <Search className="h-4 w-4 mr-2" />
            {scanMutation.isPending ? 'Scanning...' : 'Run New Scan'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Records Scanned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {report.total_records_scanned}
              </div>
              <p className="text-xs text-muted-foreground">Platform records</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {report.inconsistencies_found}
              </div>
              <p className="text-xs text-muted-foreground">Data inconsistencies</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {report.critical_issues}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Auto-Fixable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {report.auto_fixable_issues}
              </div>
              <p className="text-xs text-muted-foreground">Can be fixed automatically</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {report ? (
            <Card>
              <CardHeader>
                <CardTitle>Latest Scan Results</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Scan completed: {new Date(report.scan_date).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.inconsistencies_found === 0 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Great! No data integrity issues found. Your platform data is clean and consistent.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Found {report.inconsistencies_found} data integrity issues that need attention.
                        {report.auto_fixable_issues > 0 && (
                          <span className="block mt-1">
                            {report.auto_fixable_issues} issues can be automatically fixed with your approval.
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Scan Data Available</h3>
                <p className="text-muted-foreground mb-4">
                  Run your first data integrity scan to begin monitoring platform data quality.
                </p>
                <Button onClick={() => scanMutation.mutate()}>
                  <Search className="h-4 w-4 mr-2" />
                  Run First Scan
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          {report && report.issues.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedIssues.size} of {report.issues.filter(i => i.autoFixable).length} auto-fixable issues selected
                </div>
                <Button 
                  onClick={handleApplySelectedFixes}
                  disabled={selectedIssues.size === 0 || applyFixesMutation.isPending}
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Apply Selected Fixes ({selectedIssues.size})
                </Button>
              </div>

              <div className="space-y-3">
                {report.issues.map((issue) => (
                  <Card key={issue.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {issue.autoFixable && (
                          <Checkbox
                            checked={selectedIssues.has(issue.id)}
                            onCheckedChange={(checked) => 
                              handleIssueSelection(issue.id, checked as boolean)
                            }
                            className="mt-1"
                          />
                        )}
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(issue.type)}
                            <Badge className={getSeverityColor(issue.severity)}>
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {issue.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {issue.autoFixable && (
                              <Badge variant="secondary">
                                <Zap className="h-3 w-3 mr-1" />
                                Auto-fixable
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {issue.confidence}% confidence
                            </Badge>
                          </div>
                          
                          <p className="font-medium">{issue.description}</p>
                          
                          <div className="text-sm text-muted-foreground">
                            <p><strong>Table:</strong> {issue.affectedTable}</p>
                            <p><strong>Record ID:</strong> {issue.affectedRecordId}</p>
                            {typeof issue.currentValue === 'string' && (
                              <p><strong>Current Value:</strong> "{issue.currentValue}"</p>
                            )}
                          </div>
                          
                          {issue.researchEvidence.length > 0 && (
                            <details className="text-sm">
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                View Research Evidence ({issue.researchEvidence.length})
                              </summary>
                              <ul className="mt-2 ml-4 list-disc space-y-1">
                                {issue.researchEvidence.map((evidence, idx) => (
                                  <li key={idx}>{evidence}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                          
                          {issue.suggestedFix && (
                            <details className="text-sm">
                              <summary className="cursor-pointer text-green-600 hover:text-green-800">
                                View Suggested Fix
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs">
                                {JSON.stringify(issue.suggestedFix, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          
          {report && report.issues.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                <p className="text-muted-foreground">
                  Your platform data is clean and consistent. Great job!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {report && report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actionable Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.recommendations.map((recommendation, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
                      <Eye className="h-4 w-4 mt-0.5 text-blue-600" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Scan history will be available after multiple scans are completed.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}