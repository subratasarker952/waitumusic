import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Play, 
  Users, 
  Settings, 
  Upload, 
  CreditCard,
  Shield,
  Search,
  Music,
  BookOpen,
  Database,
  RefreshCw,
  Eye,
  Zap,
  Clock,
  Smartphone,
  FileText,
  Lock,
  UserCheck,
  Navigation,
  Wrench
} from 'lucide-react';

interface AuditResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  issues: string[];
  userImpact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  testedAt: string;
}

interface AuditSummary {
  totalComponents: number;
  passed: number;
  failed: number;
  warnings: number;
  criticalIssues: number;
}

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

interface PlatformImprovement {
  id: string;
  category: 'error_boundaries' | 'mobile' | 'notifications' | 'api_handling' | 'data_consistency' | 'loading_states' | 'form_validation' | 'authentication' | 'logging' | 'file_uploads';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  implemented: boolean;
}

const PlatformAuditDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('audit');
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [selectedImprovements, setSelectedImprovements] = useState<Set<string>>(new Set());
  const [auditResults, setAuditResults] = useState<{
    summary: AuditSummary;
    results: AuditResult[];
    recommendations: string[];
  } | null>(null);

  const [userFlowTests, setUserFlowTests] = useState<any[]>([]);

  // Fetch latest integrity report
  const { data: integrityReport, isLoading: integrityLoading, refetch: refetchIntegrity } = useQuery<DataIntegrityReport>({
    queryKey: ['/api/data-integrity/latest-report'],
    refetchInterval: 30000
  });

  // Platform improvements data
  const platformImprovements: PlatformImprovement[] = [
    {
      id: 'error-boundaries',
      category: 'error_boundaries',
      title: 'Comprehensive Error Boundaries for React Components',
      description: 'Implement error boundaries to catch JavaScript errors in component tree and display fallback UI',
      priority: 'critical',
      effort: 'medium',
      impact: 'high',
      implemented: false
    },
    {
      id: 'mobile-responsive',
      category: 'mobile',
      title: 'Consistent Mobile Responsiveness Across All Pages',
      description: 'Ensure all components and pages work seamlessly on mobile devices with touch-friendly interactions',
      priority: 'high',
      effort: 'high',
      impact: 'high',
      implemented: false
    },
    {
      id: 'success-notifications',
      category: 'notifications',
      title: 'Success Notifications for All User Actions',
      description: 'Add success notifications for all CRUD operations and user interactions with clear feedback',
      priority: 'medium',
      effort: 'low',
      impact: 'medium',
      implemented: false
    },
    {
      id: 'api-failure-handling',
      category: 'api_handling',
      title: 'Graceful Degradation for API Failures',
      description: 'Implement proper fallback mechanisms when API calls fail with meaningful error messages',
      priority: 'critical',
      effort: 'medium',
      impact: 'high',
      implemented: false
    },
    {
      id: 'data-consistency',
      category: 'data_consistency',
      title: 'Data Consistency Across All Components',
      description: 'Ensure data remains consistent across all components with proper cache invalidation',
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      implemented: false
    },
    {
      id: 'loading-states',
      category: 'loading_states',
      title: 'Loading States for All Async Operations',
      description: 'Add skeleton loaders and loading indicators for all async operations',
      priority: 'medium',
      effort: 'low',
      impact: 'medium',
      implemented: false
    },
    {
      id: 'form-validation',
      category: 'form_validation',
      title: 'Proper Form Validation with Clear Error Messages',
      description: 'Implement comprehensive form validation with user-friendly error messages',
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      implemented: false
    },
    {
      id: 'auth-flow',
      category: 'authentication',
      title: 'Proper Authentication Flow with Redirects',
      description: 'Ensure seamless authentication flow with proper redirects and session management',
      priority: 'critical',
      effort: 'medium',
      impact: 'high',
      implemented: false
    },
    {
      id: 'comprehensive-logging',
      category: 'logging',
      title: 'Comprehensive Logging for Debugging',
      description: 'Add structured logging throughout the application for better debugging and monitoring',
      priority: 'medium',
      effort: 'low',
      impact: 'medium',
      implemented: false
    },
    {
      id: 'file-upload-handling',
      category: 'file_uploads',
      title: 'Proper Error Handling for File Uploads',
      description: 'Implement robust error handling for file uploads with progress indicators and validation',
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      implemented: false
    }
  ];

  // OppHub AI specific testing areas
  const oppHubTestAreas = [
    {
      id: 'user-registration',
      name: 'User Registration',
      icon: UserCheck,
      description: 'Test user registration flow including validation, email confirmation, and profile creation',
      tests: [
        'Email validation and duplicate prevention',
        'Password strength requirements',
        'Profile completion workflow',
        'Role-based access assignment',
        'Email confirmation process'
      ]
    },
    {
      id: 'dashboard-navigation',
      name: 'Dashboard Navigation',
      icon: Navigation,
      description: 'Test dashboard navigation and role-based interface rendering',
      tests: [
        'Role-based dashboard display',
        'Navigation menu accessibility',
        'Tab switching functionality',
        'Mobile navigation drawer',
        'Breadcrumb navigation'
      ]
    },
    {
      id: 'payment-processing',
      name: 'Payment Processing',
      icon: CreditCard,
      description: 'Test payment flows including bookings, services, and subscription handling',
      tests: [
        'Stripe payment integration',
        'Invoice generation',
        'Payment status tracking',
        'Refund processing',
        'Currency conversion'
      ]
    },
    {
      id: 'profile-management',
      name: 'Profile Management',
      icon: Users,
      description: 'Test user profile management and data consistency',
      tests: [
        'Profile photo upload',
        'Personal information updates',
        'Professional details editing',
        'Privacy settings control',
        'Account deletion process'
      ]
    },
    {
      id: 'admin-panel',
      name: 'Admin Panel',
      icon: Shield,
      description: 'Test admin panel functionality and system management',
      tests: [
        'User management operations',
        'System configuration access',
        'Data integrity monitoring',
        'Security audit features',
        'Platform statistics display'
      ]
    },
    {
      id: 'mobile-navigation',
      name: 'Mobile Navigation',
      icon: Smartphone,
      description: 'Test mobile-specific navigation and touch interactions',
      tests: [
        'Touch gesture recognition',
        'Mobile menu functionality',
        'Responsive layout adaptation',
        'Mobile form interactions',
        'Swipe navigation support'
      ]
    }
  ];

  // Run comprehensive platform audit with REAL-TIME AI ANALYSIS
  const auditMutation = useMutation({
    mutationFn: () => apiRequest('/api/platform-audit/run', { method: 'POST' }),
    onSuccess: (data) => {
      setAuditResults(data.audit);
      console.log('🔍 Real-time audit analysis type:', data.analysisType);
      console.log('⚡ Execution time:', data.executionTime + 'ms');
      toast({
        title: "🔍 Real-Time AI Platform Audit Complete",
        description: `${data.analysisType || 'REAL_TIME_AI_POWERED'} analysis: ${data.audit.summary.passed}/${data.audit.summary.totalComponents} components passed in ${data.executionTime || 'unknown'}ms`,
      });
    },
    onError: (error) => {
      toast({
        title: "Real-Time Audit Failed", 
        description: `AI-powered platform audit failed: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Run data integrity scan
  const integrityScanMutation = useMutation({
    mutationFn: () => apiRequest('/api/data-integrity/scan', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Data Integrity Scan Complete",
        description: "New scan completed successfully. Reviewing results...",
      });
      refetchIntegrity();
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: `Data integrity scan failed: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Execute OppHub AI specific test with REAL SYSTEM VALIDATION
  const executeOppHubTestMutation = useMutation({
    mutationFn: (testAreaId: string) => 
      apiRequest('/api/opphub-ai/execute-test', { method: 'POST', body: JSON.stringify({ testAreaId }) }),
    onSuccess: (data, testAreaId) => {
      console.log('🤖 OppHub AI test result:', data.testResult);
      toast({
        title: "🤖 Real OppHub AI Test Complete",
        description: `${data.testResult.analysisType || 'REAL_AI_TESTING'}: ${data.testResult.passed}/${data.testResult.testsRun} tests passed for ${oppHubTestAreas.find(t => t.id === testAreaId)?.name}`,
      });
    },
    onError: (error, testAreaId) => {
      toast({
        title: "AI Test Failed",
        description: `Real OppHub AI test failed: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Execute individual improvement with REAL IMPLEMENTATION
  const executeImprovementMutation = useMutation({
    mutationFn: (improvementId: string) => 
      apiRequest('/api/platform-improvements/execute', { method: 'POST', body: JSON.stringify({ improvementId }) }),
    onSuccess: (data, improvementId) => {
      console.log('🔧 Real improvement execution:', data.executionResult);
      toast({
        title: "🔧 Real Improvement Executed",
        description: `${data.executionResult.analysisType || 'REAL_IMPROVEMENT_EXECUTION'}: ${platformImprovements.find(i => i.id === improvementId)?.title} completed in ${data.executionResult.executionTime}ms`,
      });
    },
    onError: (error, improvementId) => {
      toast({
        title: "Real Execution Failed",
        description: `Failed to execute real improvement: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Apply integrity fixes
  const applyFixesMutation = useMutation({
    mutationFn: (data: { scanId: string; issueIds: string[] }) => 
      apiRequest('/api/data-integrity/apply-fixes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({
        title: "Fixes Applied Successfully",
        description: "Selected data integrity issues have been resolved.",
      });
      setSelectedIssues(new Set());
      refetchIntegrity();
    },
    onError: (error) => {
      toast({
        title: "Fix Application Failed",
        description: `Failed to apply fixes: ${error}`,
        variant: "destructive",
      });
    }
  });

  const toggleIssueSelection = (issueId: string) => {
    const newSelection = new Set(selectedIssues);
    if (newSelection.has(issueId)) {
      newSelection.delete(issueId);
    } else {
      newSelection.add(issueId);
    }
    setSelectedIssues(newSelection);
  };

  // This query is already defined above - removing duplicate

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // getSeverityColor function is already defined above - removing duplicate

  // Critical user flows to test
  const criticalUserFlows = [
    {
      name: 'User Registration & Login',
      userRole: 'new_user',
      steps: [
        'Navigate to registration page',
        'Fill registration form with valid data',
        'Submit registration',
        'Verify email confirmation',
        'Login with new credentials',
        'Access dashboard'
      ]
    },
    {
      name: 'Artist Music Upload',
      userRole: 'managed_artist',
      steps: [
        'Login as managed artist',
        'Navigate to music upload',
        'Fill music metadata form',
        'Upload audio file',
        'Set pricing and availability',
        'Submit and verify upload'
      ]
    },
    {
      name: 'Booking Creation Flow',
      userRole: 'fan',
      steps: [
        'Browse artist profiles',
        'Select artist for booking',
        'Fill booking form',
        'Select date and time',
        'Submit booking request',
        'Receive confirmation'
      ]
    },
    {
      name: 'OppHub Opportunity Discovery',
      userRole: 'managed_artist',
      steps: [
        'Access OppHub dashboard',
        'View opportunity list',
        'Filter by category',
        'Click opportunity details',
        'Apply to opportunity',
        'Track application status'
      ]
    },
    {
      name: 'Admin User Management',
      userRole: 'superadmin',
      steps: [
        'Access admin dashboard',
        'Navigate to user management',
        'Create new user',
        'Edit existing user',
        'Change user role',
        'Verify changes applied'
      ]
    }
  ];

  const runFullAuditMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/platform-audit/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Audit failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setAuditResults(data.audit);
      toast({
        title: 'Platform Audit Complete',
        description: `${data.audit.summary.passed}/${data.audit.summary.totalComponents} components passed`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Audit Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const testUserFlowMutation = useMutation({
    mutationFn: async (flow: any) => {
      const response = await fetch('/api/platform-audit/user-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(flow)
      });
      
      if (!response.ok) {
        throw new Error('User flow test failed');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      setUserFlowTests(prev => [...prev, data.flowResult]);
      toast({
        title: 'User Flow Test Complete',
        description: `${variables.flowName} - ${data.flowResult.success ? 'Passed' : 'Failed'}`
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Platform Audit & Data Integrity</h2>
          <p className="text-muted-foreground">Comprehensive platform testing, validation, and data integrity monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => integrityScanMutation.mutate()}
            disabled={integrityScanMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            {integrityScanMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {integrityScanMutation.isPending ? 'Scanning...' : 'Data Integrity Scan'}
          </Button>
          <Button
            onClick={() => auditMutation.mutate()}
            disabled={auditMutation.isPending}
            className="flex items-center gap-2"
          >
            {auditMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {auditMutation.isPending ? 'Running Audit...' : 'Run Platform Audit'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="audit">Platform Audit</TabsTrigger>
          <TabsTrigger value="integrity">Data Integrity</TabsTrigger>
          <TabsTrigger value="opphub">OppHub AI Tests</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="flows">User Flows</TabsTrigger>
        </TabsList>

        {/* Platform Audit Tab */}
        <TabsContent value="audit" className="space-y-6">
          {auditResults && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Components</p>
                  <p className="text-2xl font-bold">{auditResults.summary.totalComponents}</p>
                </div>
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{auditResults.summary.passed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{auditResults.summary.warnings}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{auditResults.summary.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">{auditResults.summary.criticalIssues}</p>
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Flow Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Critical User Flow Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalUserFlows.map((flow, index) => {
              const tested = userFlowTests.find(t => t.flowName === flow.name);
              return (
                <Card key={index} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{flow.name}</h3>
                      {tested && getStatusIcon(tested.success ? 'pass' : 'fail')}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Role: {flow.userRole}</p>
                    <p className="text-xs text-gray-600 mb-3">Steps: {flow.steps.length}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testUserFlowMutation.mutate({
                        userRole: flow.userRole,
                        flowName: flow.name,
                        steps: flow.steps
                      })}
                      disabled={testUserFlowMutation.isPending}
                      className="w-full"
                    >
                      {testUserFlowMutation.isPending ? 'Testing...' : 'Test Flow'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Audit Results */}
      {auditResults && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Audit Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditResults.results.map((result, index) => (
                <Alert key={index} className={`border-l-4 ${
                  result.status === 'pass' ? 'border-l-green-500' :
                  result.status === 'warning' ? 'border-l-yellow-500' :
                  'border-l-red-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className="font-semibold">{result.component}</h4>
                        <Badge className={getImpactColor(result.userImpact)}>
                          {result.userImpact} impact
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(result.testedAt).toLocaleString()}
                    </span>
                  </div>
                  
                  {result.issues.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-red-700 mb-1">Issues Found:</h5>
                      <ul className="text-sm text-red-600 space-y-1">
                        {result.issues.map((issue, idx) => (
                          <li key={idx} className="ml-4">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-blue-700 mb-1">Recommendations:</h5>
                      <ul className="text-sm text-blue-600 space-y-1">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="ml-4">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

          {/* Platform Recommendations with Execute Buttons */}
          {auditResults && auditResults.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Platform Improvement Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {auditResults.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <AlertDescription className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {recommendation}
                        </div>
                        <Button size="sm" variant="outline">
                          <Wrench className="h-3 w-3 mr-1" />
                          Execute
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Integrity Tab */}
        <TabsContent value="integrity" className="space-y-6">
          {integrityLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          ) : integrityReport ? (
            <div className="space-y-6">
              {/* Integrity Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Records Scanned</p>
                        <p className="text-2xl font-bold">{integrityReport.total_records_scanned}</p>
                      </div>
                      <Database className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Issues Found</p>
                        <p className="text-2xl font-bold text-red-600">{integrityReport.inconsistencies_found}</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Critical Issues</p>
                        <p className="text-2xl font-bold text-orange-600">{integrityReport.critical_issues}</p>
                      </div>
                      <XCircle className="h-6 w-6 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Auto-Fixable</p>
                        <p className="text-2xl font-bold text-green-600">{integrityReport.auto_fixable_issues}</p>
                      </div>
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Issues with Execute Buttons */}
              {integrityReport.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Data Integrity Issues</span>
                      <Button
                        onClick={() => {
                          const selectedIds = Array.from(selectedIssues);
                          if (selectedIds.length > 0) {
                            applyFixesMutation.mutate({
                              scanId: integrityReport.scan_id,
                              issueIds: selectedIds
                            });
                          }
                        }}
                        disabled={selectedIssues.size === 0 || applyFixesMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Wrench className="h-4 w-4" />
                        Apply Selected Fixes ({selectedIssues.size})
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {integrityReport.issues.map((issue) => (
                        <div key={issue.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <Checkbox
                                checked={selectedIssues.has(issue.id)}
                                onCheckedChange={() => toggleIssueSelection(issue.id)}
                                disabled={!issue.autoFixable}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getSeverityColor(issue.severity)}>
                                    {issue.severity.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline">{issue.type.replace('_', ' ').toUpperCase()}</Badge>
                                </div>
                                <p className="font-medium mb-2">{issue.description}</p>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p><strong>Table:</strong> {issue.affectedTable}</p>
                                  <p><strong>Record ID:</strong> {issue.affectedRecordId}</p>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (issue.autoFixable) {
                                  applyFixesMutation.mutate({
                                    scanId: integrityReport.scan_id,
                                    issueIds: [issue.id]
                                  });
                                }
                              }}
                              disabled={!issue.autoFixable || applyFixesMutation.isPending}
                              className="flex items-center gap-1"
                            >
                              <Wrench className="h-3 w-3" />
                              Execute Fix
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">No data integrity report available. Run a scan to generate report.</p>
            </div>
          )}
        </TabsContent>

        {/* OppHub AI Tests Tab */}
        <TabsContent value="opphub" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {oppHubTestAreas.map((area) => {
              const IconComponent = area.icon;
              return (
                <Card key={area.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {area.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{area.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Test Coverage:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {area.tests.map((test, idx) => (
                          <li key={idx} className="flex items-center justify-between">
                            <span>• {test}</span>
                            <Button size="sm" variant="ghost" className="ml-2">
                              <Wrench className="h-3 w-3 mr-1" />
                              Execute
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      onClick={() => executeOppHubTestMutation.mutate(area.id)}
                      disabled={executeOppHubTestMutation.isPending}
                      className="w-full"
                    >
                      {executeOppHubTestMutation.isPending ? 'Testing...' : `Run ${area.name} Tests`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Platform Improvements Tab */}
        <TabsContent value="improvements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Improvement Recommendations</CardTitle>
              <p className="text-sm text-muted-foreground">
                Critical platform improvements to enhance stability, user experience, and maintainability
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformImprovements.map((improvement) => (
                  <div key={improvement.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPriorityColor(improvement.priority)}>
                            {improvement.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {improvement.category.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant={improvement.implemented ? "default" : "secondary"}>
                            {improvement.implemented ? 'IMPLEMENTED' : 'PENDING'}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-2">{improvement.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{improvement.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Effort: {improvement.effort}</span>
                          <span>Impact: {improvement.impact}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => executeImprovementMutation.mutate(improvement.id)}
                        disabled={improvement.implemented || executeImprovementMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Wrench className="h-4 w-4" />
                        {improvement.implemented ? 'Implemented' : 'Execute'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Flows Tab */}
        <TabsContent value="flows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Critical User Flow Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criticalUserFlows.map((flow, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{flow.name}</h4>
                      <Badge variant="outline">{flow.userRole}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Test Steps:</p>
                      {flow.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                              {stepIdx + 1}
                            </div>
                            {step}
                          </div>
                          <Button size="sm" variant="ghost">
                            <Wrench className="h-3 w-3 mr-1" />
                            Execute
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => testUserFlowMutation.mutate({ 
                        flowName: flow.name, 
                        userRole: flow.userRole, 
                        steps: flow.steps 
                      })}
                      disabled={testUserFlowMutation.isPending}
                      className="w-full"
                    >
                      {testUserFlowMutation.isPending ? 'Testing...' : 'Test Complete Flow'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Flow Test Results */}
          {userFlowTests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>User Flow Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userFlowTests.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{result.flowName}</h4>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Completed Steps: {result.completedSteps}/{result.totalSteps}</p>
                      {result.issues && result.issues.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-red-600">Issues Found:</p>
                          {result.issues.map((issue, issueIdx) => (
                            <div key={issueIdx} className="flex items-center justify-between">
                              <p className="text-sm text-red-600">• {issue}</p>
                              <Button size="sm" variant="outline">
                                <Wrench className="h-3 w-3 mr-1" />
                                Fix Issue
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformAuditDashboard;