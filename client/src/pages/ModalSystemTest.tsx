import { useModals } from '@/components/ModalProvider';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Shield, 
  Activity, 
  Users, 
  Music, 
  FileText, 
  Mail,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings
} from "lucide-react";

export default function ModalSystemTest() {
  const modals = useModals();

  const testNotifications = () => {
    modals.showNotification({
      type: 'success',
      title: 'Database Optimization Complete',
      message: 'All database queries have been optimized and performance improved by 25%.',
      details: [
        'Query response time reduced from 450ms to 340ms',
        'Index optimization completed on 12 tables',
        'Connection pool optimized for better resource usage',
        'Automatic maintenance scheduled'
      ],
      actionButton: {
        label: 'View Performance Report',
        action: () => console.log('Performance report opened')
      }
    });
  };

  const testSystemConfig = () => {
    modals.showSystemConfig({ configType: 'database' });
  };

  const testUserManagement = () => {
    modals.showUserManagement({
      mode: 'create',
      onUserAction: (action, data) => {
        console.log('User action:', action, data);
        modals.showSuccess(
          'User Created Successfully',
          `New user ${data?.name} has been created with ${data?.role} privileges.`,
          {
            label: 'Send Welcome Email',
            action: () => console.log('Welcome email sent')
          }
        );
      }
    });
  };

  const testMediaManagement = () => {
    modals.showMediaManagement({ mediaType: 'photos' });
  };

  const testProgressModal = () => {
    modals.showProgress({
      title: 'System Backup in Progress',
      message: 'Creating comprehensive system backup...',
      steps: [
        'Backing up database',
        'Archiving media files',
        'Compressing data',
        'Uploading to secure storage',
        'Verifying backup integrity'
      ],
      currentStep: 0,
      allowCancel: true,
      onCancel: () => console.log('Backup cancelled')
    });

    // Simulate progress
    let step = 0;
    const interval = setInterval(() => {
      step++;
      modals.updateProgress((step / 5) * 100, step);
      
      if (step >= 5) {
        clearInterval(interval);
        modals.closeModal('progress');
        modals.showSuccess(
          'Backup Complete',
          'System backup has been successfully created and stored securely.',
          {
            label: 'Download Backup',
            action: () => console.log('Backup download initiated')
          }
        );
      }
    }, 1500);
  };

  const testErrorModal = () => {
    modals.showError(
      'Database Connection Failed',
      'Unable to establish connection to the database server. This may affect platform functionality.',
      {
        code: 'DB_CONNECTION_ERROR',
        details: 'Connection timeout after 30 seconds',
        stack: 'at DatabaseConnection.connect (db.ts:42)'
      },
      [
        'Check database server status and ensure it is running',
        'Verify network connectivity between application and database',
        'Check database credentials and connection string',
        'Review database server logs for any error messages',
        'Consider increasing connection timeout settings'
      ],
      () => {
        console.log('Retrying database connection...');
        modals.showProgress({
          title: 'Reconnecting to Database',
          message: 'Attempting to establish database connection...',
          allowCancel: false
        });
        
        setTimeout(() => {
          modals.closeModal('progress');
          modals.showSuccess(
            'Connection Restored',
            'Database connection has been successfully restored. All systems are operational.'
          );
        }, 3000);
      }
    );
  };

  const testDataIntegrity = () => {
    modals.showDataIntegrityReport();
  };

  const testOpportunityValidation = () => {
    const mockOpportunity = {
      title: 'SXSW Music Festival 2025 - Artist Showcase',
      organizer: 'SXSW Conference & Festivals',
      description: 'Apply for performance opportunities at SXSW 2025. Showcase your music to industry professionals, media, and music fans from around the world.',
      sourceUrl: 'https://www.sxsw.com/apply-to-play/',
      compensationType: 'exposure',
      compensationRange: 'Performance opportunity + industry exposure',
      applicationDeadline: '2025-02-15',
      tags: ['festival', 'showcase', 'industry', 'networking']
    };

    modals.showOpportunityValidation(
      mockOpportunity,
      (validatedData) => {
        console.log('Opportunity validated:', validatedData);
        modals.showSuccess(
          'Opportunity Validated',
          'The opportunity data has been verified and is ready for use.',
          {
            label: 'Add to Opportunities',
            action: () => console.log('Opportunity added to system')
          }
        );
      }
    );
  };

  const testSystemStatus = () => {
    modals.showSystemStatus({
      type: 'maintenance',
      title: 'Scheduled Maintenance',
      message: 'System maintenance is scheduled to begin in 30 minutes. Some features may be temporarily unavailable.',
      timestamp: new Date().toISOString(),
      estimatedDuration: '2 hours',
      affectedSystems: ['OppHub Scanner', 'Database Optimization', 'Email Services'],
      actionRequired: true
    });
  };

  const testCommonSystemActions = () => {
    // Test the common system actions that replace toast notifications
    modals.showDatabaseOptimization();
  };

  const testSecurityScan = () => {
    modals.showSecurityScan();
  };

  const testBackupProcess = () => {
    modals.showBackupProcess();
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Modal System Test Suite</h1>
        <p className="text-muted-foreground">
          Comprehensive test interface for the new modal-based notification system that replaces all toast notifications.
        </p>
        <Badge variant="outline" className="mt-2">
          Toast-Free Architecture
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Notification Modals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Notification Modals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={testNotifications} className="w-full">
              Test Success Notification
            </Button>
            <Button onClick={testErrorModal} variant="destructive" className="w-full">
              Test Error Modal
            </Button>
            <Button onClick={testProgressModal} variant="outline" className="w-full">
              Test Progress Modal
            </Button>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={testSystemConfig} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Database Config
            </Button>
            <Button onClick={() => modals.showSystemConfig({ configType: 'security' })} className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Security Config
            </Button>
            <Button onClick={() => modals.showSystemConfig({ configType: 'performance' })} className="w-full">
              <Activity className="h-4 w-4 mr-2" />
              Performance Config
            </Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={testUserManagement} className="w-full">
              Create User
            </Button>
            <Button onClick={() => modals.showUserManagement({ 
              mode: 'edit', 
              userData: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'artist' }
            })} className="w-full">
              Edit User
            </Button>
            <Button onClick={() => modals.showUserManagement({ 
              mode: 'view', 
              userData: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'artist', status: 'active', createdAt: '2025-01-01' }
            })} variant="outline" className="w-full">
              View User Details
            </Button>
          </CardContent>
        </Card>

        {/* Media Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-orange-500" />
              Media Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={testMediaManagement} className="w-full">
              Photo Gallery
            </Button>
            <Button onClick={() => modals.showMediaManagement({ mediaType: 'videos' })} className="w-full">
              Video Library
            </Button>
            <Button onClick={() => modals.showMediaManagement({ mediaType: 'audio' })} className="w-full">
              Audio Files
            </Button>
          </CardContent>
        </Card>

        {/* Data Integrity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Data Integrity System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={testDataIntegrity} className="w-full">
              Data Integrity Report
            </Button>
            <Button onClick={testOpportunityValidation} className="w-full">
              Validate Opportunity
            </Button>
            <Button onClick={testSystemStatus} variant="outline" className="w-full">
              System Status
            </Button>
          </CardContent>
        </Card>

        {/* System Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-500" />
              System Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={testCommonSystemActions} className="w-full">
              Database Optimization
            </Button>
            <Button onClick={testSecurityScan} className="w-full">
              Security Scan
            </Button>
            <Button onClick={testBackupProcess} className="w-full">
              Backup Process
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Modal System Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Replaced Toast Notifications:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Success confirmations</li>
                <li>• Error notifications</li>
                <li>• Warning messages</li>
                <li>• Information alerts</li>
                <li>• Progress indicators</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Enhanced Features:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Detailed error information</li>
                <li>• Action buttons for follow-up</li>
                <li>• Progress tracking with steps</li>
                <li>• System status monitoring</li>
                <li>• Data integrity validation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}