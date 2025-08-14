import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Database, Shield, Globe, Server, Download, Upload } from 'lucide-react';

interface SystemConfig {
  maintenance_mode: boolean;
  demo_mode: boolean;
  registration_enabled: boolean;
  max_upload_size: number;
  session_timeout: number;
  email_notifications: boolean;
  backup_enabled: boolean;
  cdn_enabled: boolean;
}

interface SystemHealth {
  database_status: 'healthy' | 'warning' | 'error';
  api_response_time: number;
  storage_usage: number;
  memory_usage: number;
  cpu_usage: number;
  uptime: string;
}

interface SystemConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemConfigurationModal({ isOpen, onClose }: SystemConfigurationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState<SystemConfig | null>(null);

  // Fetch system configuration
  const { data: systemConfig, isLoading } = useQuery({
    queryKey: ['/api/admin/system/config'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/system/config');
      setConfig(response as SystemConfig);
      return response as SystemConfig;
    }
  });

  // Fetch system health
  const { data: systemHealth } = useQuery({
    queryKey: ['/api/admin/system/health'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/system/health');
      return response as SystemHealth;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Update configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: SystemConfig) => {
      return await apiRequest('/api/admin/system/config', {
        method: 'PUT',
        body: JSON.stringify(newConfig)
      });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'System configuration updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system/config'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update configuration', variant: 'destructive' });
    }
  });

  // Database backup
  const backupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/database/backup', {
        method: 'POST'
      });
    },
    onSuccess: (data: any) => {
      toast({ title: 'Success', description: `Database backup created: ${data.filename}` });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create backup', variant: 'destructive' });
    }
  });

  const handleConfigUpdate = (key: keyof SystemConfig, value: any) => {
    if (!config) return;
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const saveConfiguration = () => {
    if (config) {
      updateConfigMutation.mutate(config);
    }
  };

  const getHealthBadge = (status: string) => {
    const statusConfig = {
      healthy: { variant: 'default' as const, color: 'text-green-600' },
      warning: { variant: 'secondary' as const, color: 'text-yellow-600' },
      error: { variant: 'destructive' as const, color: 'text-red-600' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.error;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Configuration
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="demo-mode">Demo Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Show demo accounts on login page
                      </p>
                    </div>
                    <Switch
                      id="demo-mode"
                      checked={config?.demo_mode || false}
                      onCheckedChange={(checked) => handleConfigUpdate('demo_mode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registration">User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new user registration
                      </p>
                    </div>
                    <Switch
                      id="registration"
                      checked={config?.registration_enabled || false}
                      onCheckedChange={(checked) => handleConfigUpdate('registration_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send system email notifications
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={config?.email_notifications || false}
                      onCheckedChange={(checked) => handleConfigUpdate('email_notifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">File Upload Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="max-upload">Maximum Upload Size (MB)</Label>
                    <Input
                      id="max-upload"
                      type="number"
                      value={config?.max_upload_size || 100}
                      onChange={(e) => handleConfigUpdate('max_upload_size', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={config?.session_timeout || 60}
                      onChange={(e) => handleConfigUpdate('session_timeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>CDN Enabled</Label>
                      <p className="text-sm text-muted-foreground">
                        Use CDN for file delivery
                      </p>
                    </div>
                    <Switch
                      checked={config?.cdn_enabled || false}
                      onCheckedChange={(checked) => handleConfigUpdate('cdn_enabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={saveConfiguration} disabled={updateConfigMutation.isPending}>
                Save Configuration
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Two-Factor Authentication</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Require 2FA for admins</span>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password Policy</Label>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Minimum length</span>
                        <span>8 characters</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Require special characters</span>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Login Attempts</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Max failed attempts</span>
                      <Input className="w-20" type="number" defaultValue="5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Data Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Daily database backups
                      </p>
                    </div>
                    <Switch
                      checked={config?.backup_enabled || false}
                      onCheckedChange={(checked) => handleConfigUpdate('backup_enabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Retention</Label>
                    <div className="text-sm text-muted-foreground">
                      <p>User data: 2 years after deletion</p>
                      <p>Logs: 90 days</p>
                      <p>Backups: 30 days</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => backupMutation.mutate()}
                    disabled={backupMutation.isPending}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Create Manual Backup
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Database Status</span>
                      <Badge {...getHealthBadge(systemHealth?.database_status || 'error')}>
                        {systemHealth?.database_status || 'Unknown'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">API Response Time</span>
                        <span className="text-sm font-medium">
                          {systemHealth?.api_response_time || 0}ms
                        </span>
                      </div>
                      <Progress value={Math.min((systemHealth?.api_response_time || 0) / 10, 100)} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Memory Usage</span>
                        <span className="text-sm font-medium">
                          {systemHealth?.memory_usage || 0}%
                        </span>
                      </div>
                      <Progress value={systemHealth?.memory_usage || 0} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm font-medium">
                          {systemHealth?.cpu_usage || 0}%
                        </span>
                      </div>
                      <Progress value={systemHealth?.cpu_usage || 0} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700">
                        {systemHealth?.uptime || '0d'}
                      </p>
                      <p className="text-sm text-blue-600">Uptime</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">
                        {formatBytes(systemHealth?.storage_usage || 0)}
                      </p>
                      <p className="text-sm text-green-600">Storage Used</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cache Settings</Label>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Enable Redis Cache</span>
                        <Switch defaultChecked={true} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Cache TTL (hours)</span>
                        <Input className="w-20" type="number" defaultValue="24" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Mode</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Block access for non-admin users
                      </p>
                    </div>
                    <Switch
                      checked={config?.maintenance_mode || false}
                      onCheckedChange={(checked) => handleConfigUpdate('maintenance_mode', checked)}
                    />
                  </div>

                  {config?.maintenance_mode && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        ⚠️ Maintenance mode is enabled. Only administrators can access the platform.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Database className="w-4 h-4 mr-2" />
                      Optimize Database
                    </Button>
                  </div>

                  <div className="pt-2 text-sm text-muted-foreground">
                    <p>Last backup: {new Date().toLocaleDateString()}</p>
                    <p>Database size: {formatBytes(systemHealth?.storage_usage || 0)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}