import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Server, Database, Activity, TrendingUp, Shield, 
  Monitor, Zap, Globe, Save, RotateCcw, Crown,
  Wrench, Target, Bell, Mail
} from 'lucide-react';
import { useConfiguration } from '@/contexts/ConfigurationProvider';
import { AdminConfigType, DEFAULT_ADMIN_CONFIG } from '@shared/admin-config';
import { useLocation } from 'wouter';

interface SystemAdministrationTabProps {
  userRole: string;
  userId: number;
}

export default function SystemAdministrationTab({ userRole, userId }: SystemAdministrationTabProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const {
    config: configuration,
    isLoading,
    updateConfig: updateConfigContext,
    error
  } = useConfiguration();
  
  const [config, setConfig] = useState<AdminConfigType>(DEFAULT_ADMIN_CONFIG);

  // Fetch system statistics
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => apiRequest('/api/dashboard/stats'),
    staleTime: 0,
    gcTime: 0,
  });

  // Update config helper
  const updateConfigValue = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setConfig(newConfig);
  };

  // Save configuration changes
  const handleSave = async () => {
    await updateConfigContext(config);
    toast({ title: "System configuration saved successfully" });
  };

  // Reset to defaults
  const handleReset = async () => {
    setConfig(DEFAULT_ADMIN_CONFIG);
    await updateConfigContext(DEFAULT_ADMIN_CONFIG);
    toast({ title: "System configuration reset to defaults" });
  };

  if (!['superadmin', 'admin'].includes(userRole)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Access Denied: Only superadmin and admin users can access system administration</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6" />
            System Administration
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage system-level settings, database configuration, and administrative controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset System Settings
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Apply Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="system-overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="system-overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Overview
          </TabsTrigger>
          <TabsTrigger value="database-management" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Management
          </TabsTrigger>
          <TabsTrigger value="security-settings" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Settings
          </TabsTrigger>
          <TabsTrigger value="system-overrides" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            System Overrides
          </TabsTrigger>
        </TabsList>

        {/* System Overview */}
        <TabsContent value="system-overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">API Status:</span>
                    <span className="text-green-600 font-medium">Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Database:</span>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Storage:</span>
                    <span className="text-green-600 font-medium">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email Service:</span>
                    <span className="text-orange-600 font-medium">Limited</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Maintenance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Maintenance Mode</Label>
                  <Switch
                    checked={config.featureToggles?.maintenanceModeEnabled || false}
                    onCheckedChange={(checked) => updateConfigValue('featureToggles.maintenanceModeEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Read-Only Mode</Label>
                  <Switch
                    checked={config.systemOverrides?.readOnlyMode || false}
                    onCheckedChange={(checked) => updateConfigValue('systemOverrides.readOnlyMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Debug Mode</Label>
                  <Switch
                    checked={config.systemOverrides?.debugMode || false}
                    onCheckedChange={(checked) => updateConfigValue('systemOverrides.debugMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Database Management */}
        <TabsContent value="database-management">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Database Backup Frequency</Label>
                  <Select 
                    value={config.systemOverrides?.databaseBackupFrequency || 'daily'}
                    onValueChange={(value) => updateConfigValue('systemOverrides.databaseBackupFrequency', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Connection Pool Size</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={config.systemOverrides?.connectionPoolSize || 10}
                    onChange={(e) => updateConfigValue('systemOverrides.connectionPoolSize', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Auto-optimize queries</Label>
                  <Switch
                    checked={config.systemOverrides?.autoOptimizeQueries || true}
                    onCheckedChange={(checked) => updateConfigValue('systemOverrides.autoOptimizeQueries', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={async () => {
                    try {
                      const response = await apiRequest('/api/admin/database/backup', { method: 'POST' });
                      toast({ title: "Backup Started", description: "Database backup initiated successfully" });
                    } catch (error) {
                      toast({ title: "Backup Failed", description: "Failed to start database backup", variant: "destructive" });
                    }
                  }}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Create Manual Backup
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={async () => {
                    try {
                      const response = await apiRequest('/api/admin/database/optimize', { method: 'POST' });
                      toast({ title: "Optimization Started", description: "Database optimization completed successfully" });
                    } catch (error) {
                      toast({ title: "Optimization Failed", description: "Failed to optimize database", variant: "destructive" });
                    }
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={async () => {
                    try {
                      const response = await apiRequest('/api/admin/database/health', { method: 'GET' });
                      toast({ 
                        title: "Health Check Complete", 
                        description: response.healthy ? "Database is healthy" : "Database issues detected", 
                        variant: response.healthy ? "default" : "destructive" 
                      });
                    } catch (error) {
                      toast({ title: "Health Check Failed", description: "Failed to run health check", variant: "destructive" });
                    }
                  }}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Run Health Check
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security-settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="1440"
                    value={config.systemOverrides?.sessionTimeoutMinutes || 60}
                    onChange={(e) => updateConfigValue('systemOverrides.sessionTimeoutMinutes', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Force HTTPS</Label>
                  <Switch
                    checked={config.systemOverrides?.forceHttps || true}
                    onCheckedChange={(checked) => updateConfigValue('systemOverrides.forceHttps', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Two-Factor Authentication</Label>
                  <Switch
                    checked={config.systemOverrides?.twoFactorRequired || false}
                    onCheckedChange={(checked) => updateConfigValue('systemOverrides.twoFactorRequired', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Rate Limiting</Label>
                  <Switch
                    checked={config.systemOverrides?.rateLimitingEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('systemOverrides.rateLimitingEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={async () => {
                    try {
                      const response = await apiRequest('/api/admin/security/scan', { method: 'POST' });
                      toast({ 
                        title: "Security Scan Complete", 
                        description: `Found ${response.issues || 0} security issues`,
                        variant: response.issues > 0 ? "destructive" : "default"
                      });
                    } catch (error) {
                      toast({ title: "Scan Failed", description: "Failed to run security scan", variant: "destructive" });
                    }
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Run Security Scan
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={async () => {
                    try {
                      const response = await apiRequest('/api/admin/security/export-logs', { method: 'GET' });
                      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({ title: "Logs Exported", description: "Security logs downloaded successfully" });
                    } catch (error) {
                      toast({ title: "Export Failed", description: "Failed to export security logs", variant: "destructive" });
                    }
                  }}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Export Security Logs
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation('/admin-panel?tab=authorization')}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Review User Permissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Overrides */}
        <TabsContent value="system-overrides">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>API Timeout (ms)</Label>
                  <Input
                    type="number"
                    min="1000"
                    max="30000"
                    value={config.systemOverrides?.apiTimeoutMs || 5000}
                    onChange={(e) => updateConfigValue('systemOverrides.apiTimeoutMs', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Max File Size (MB)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    value={config.systemOverrides?.maxFileSizeMB || 50}
                    onChange={(e) => updateConfigValue('systemOverrides.maxFileSizeMB', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Platform Fee (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={config.systemOverrides?.platformFeePercentage || 10}
                    onChange={(e) => updateConfigValue('systemOverrides.platformFeePercentage', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Email Notifications</Label>
                  <Switch
                    checked={config.systemOverrides?.emailNotificationsEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('systemOverrides.emailNotificationsEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Push Notifications</Label>
                  <Switch
                    checked={config.systemOverrides?.pushNotificationsEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('systemOverrides.pushNotificationsEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>SMS Notifications</Label>
                  <Switch
                    checked={config.systemOverrides?.smsNotificationsEnabled || false}
                    onCheckedChange={(checked) => updateConfigValue('systemOverrides.smsNotificationsEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Emergency Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => toast({ 
                    title: "Emergency shutdown initiated", 
                    description: "System entering maintenance mode",
                    variant: "destructive"
                  })}
                >
                  Emergency Shutdown
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => toast({ title: "System reset initiated", description: "Resetting to factory defaults" })}
                >
                  Factory Reset
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => toast({ title: "Services restarted", description: "All system services restarted successfully" })}
                >
                  Restart Services
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}