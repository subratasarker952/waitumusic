import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useModalManager } from '@/hooks/useModalManager';
import { 
  Clock, 
  Shield, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Timer,
  LogOut,
  Smartphone,
  Monitor,
  Globe
} from "lucide-react";

interface SessionTimeoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SessionTimeoutModal({ open, onOpenChange }: SessionTimeoutModalProps) {
  const { toast } = useToast();
  
  const [sessionSettings, setSessionSettings] = useState({
    defaultTimeout: 24,
    rememberMeTimeout: 168, // 7 days
    adminTimeout: 12,
    superadminTimeout: 8,
    inactivityWarning: 5,
    enableRememberMe: true,
    forceMobileLogout: true,
    enableConcurrentSessions: false,
    maxConcurrentSessions: 3,
    enableDeviceTracking: true,
    enableLocationTracking: false,
    autoExtendOnActivity: true,
    requireReauth: false
  });

  const [testScenario, setTestScenario] = useState({
    userType: "fan",
    deviceType: "desktop",
    rememberMe: false,
    currentActivity: "browsing"
  });

  const calculateSessionTimeout = () => {
    let timeout = sessionSettings.defaultTimeout;
    
    if (testScenario.userType === "admin") {
      timeout = sessionSettings.adminTimeout;
    } else if (testScenario.userType === "superadmin") {
      timeout = sessionSettings.superadminTimeout;
    }
    
    if (testScenario.rememberMe && sessionSettings.enableRememberMe) {
      timeout = sessionSettings.rememberMeTimeout;
    }
    
    return timeout;
  };

  const handleSaveSettings = async () => {
    try {
      const response = await apiRequest('/api/admin/session-config', {
        method: 'POST',
        body: JSON.stringify(sessionSettings)
      });

      if (response.ok) {
        toast({
          title: "Session Configuration Updated",
          description: "New session timeout settings have been applied to all users.",
        });
        onOpenChange(false);
      } else {
        throw new Error('Failed to update session configuration');
      }
    } catch (error) {
      console.error('Error updating session configuration:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update session configuration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days} day${days !== 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-6 w-6 text-blue-600" />
            Session Timeout Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeout Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Timeout Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultTimeout">Default User Timeout (hours)</Label>
                  <Input
                    id="defaultTimeout"
                    type="number"
                    value={sessionSettings.defaultTimeout}
                    onChange={(e) => setSessionSettings(prev => ({
                      ...prev,
                      defaultTimeout: parseInt(e.target.value) || 24
                    }))}
                    min="1"
                    max="168"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Applies to: Artists, Musicians, Professionals, Fans
                  </p>
                </div>

                <div>
                  <Label htmlFor="adminTimeout">Admin Timeout (hours)</Label>
                  <Input
                    id="adminTimeout"
                    type="number"
                    value={sessionSettings.adminTimeout}
                    onChange={(e) => setSessionSettings(prev => ({
                      ...prev,
                      adminTimeout: parseInt(e.target.value) || 12
                    }))}
                    min="1"
                    max="72"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enhanced security for admin accounts
                  </p>
                </div>

                <div>
                  <Label htmlFor="superadminTimeout">Superadmin Timeout (hours)</Label>
                  <Input
                    id="superadminTimeout"
                    type="number"
                    value={sessionSettings.superadminTimeout}
                    onChange={(e) => setSessionSettings(prev => ({
                      ...prev,
                      superadminTimeout: parseInt(e.target.value) || 8
                    }))}
                    min="1"
                    max="24"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum security for superadmin access
                  </p>
                </div>

                <div>
                  <Label htmlFor="rememberMeTimeout">Remember Me Duration (hours)</Label>
                  <Input
                    id="rememberMeTimeout"
                    type="number"
                    value={sessionSettings.rememberMeTimeout}
                    onChange={(e) => setSessionSettings(prev => ({
                      ...prev,
                      rememberMeTimeout: parseInt(e.target.value) || 168
                    }))}
                    min="24"
                    max="720"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Extended session for trusted devices
                  </p>
                </div>

                <div>
                  <Label htmlFor="inactivityWarning">Inactivity Warning (minutes)</Label>
                  <Input
                    id="inactivityWarning"
                    type="number"
                    value={sessionSettings.inactivityWarning}
                    onChange={(e) => setSessionSettings(prev => ({
                      ...prev,
                      inactivityWarning: parseInt(e.target.value) || 5
                    }))}
                    min="1"
                    max="60"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Warning before automatic logout
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rememberMe">Enable "Remember Me"</Label>
                    <p className="text-xs text-muted-foreground">Allow extended sessions</p>
                  </div>
                  <Switch
                    id="rememberMe"
                    checked={sessionSettings.enableRememberMe}
                    onCheckedChange={(checked) => setSessionSettings(prev => ({
                      ...prev,
                      enableRememberMe: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mobileLogout">Force Mobile Logout</Label>
                    <p className="text-xs text-muted-foreground">Shorter timeout on mobile</p>
                  </div>
                  <Switch
                    id="mobileLogout"
                    checked={sessionSettings.forceMobileLogout}
                    onCheckedChange={(checked) => setSessionSettings(prev => ({
                      ...prev,
                      forceMobileLogout: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoExtend">Auto-extend on Activity</Label>
                    <p className="text-xs text-muted-foreground">Reset timer on user action</p>
                  </div>
                  <Switch
                    id="autoExtend"
                    checked={sessionSettings.autoExtendOnActivity}
                    onCheckedChange={(checked) => setSessionSettings(prev => ({
                      ...prev,
                      autoExtendOnActivity: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="concurrent">Multiple Sessions</Label>
                    <p className="text-xs text-muted-foreground">Allow concurrent logins</p>
                  </div>
                  <Switch
                    id="concurrent"
                    checked={sessionSettings.enableConcurrentSessions}
                    onCheckedChange={(checked) => setSessionSettings(prev => ({
                      ...prev,
                      enableConcurrentSessions: checked
                    }))}
                  />
                </div>

                {sessionSettings.enableConcurrentSessions && (
                  <div>
                    <Label htmlFor="maxSessions">Max Concurrent Sessions</Label>
                    <Input
                      id="maxSessions"
                      type="number"
                      value={sessionSettings.maxConcurrentSessions}
                      onChange={(e) => setSessionSettings(prev => ({
                        ...prev,
                        maxConcurrentSessions: parseInt(e.target.value) || 3
                      }))}
                      min="1"
                      max="10"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deviceTracking">Device Tracking</Label>
                    <p className="text-xs text-muted-foreground">Track login devices</p>
                  </div>
                  <Switch
                    id="deviceTracking"
                    checked={sessionSettings.enableDeviceTracking}
                    onCheckedChange={(checked) => setSessionSettings(prev => ({
                      ...prev,
                      enableDeviceTracking: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireReauth">Require Re-authentication</Label>
                    <p className="text-xs text-muted-foreground">For sensitive actions</p>
                  </div>
                  <Switch
                    id="requireReauth"
                    checked={sessionSettings.requireReauth}
                    onCheckedChange={(checked) => setSessionSettings(prev => ({
                      ...prev,
                      requireReauth: checked
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testing & Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Session Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="userType">User Type</Label>
                  <select
                    id="userType"
                    value={testScenario.userType}
                    onChange={(e) => setTestScenario(prev => ({
                      ...prev,
                      userType: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="fan">Fan</option>
                    <option value="artist">Artist</option>
                    <option value="musician">Musician</option>
                    <option value="professional">Professional</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="deviceType">Device Type</Label>
                  <select
                    id="deviceType"
                    value={testScenario.deviceType}
                    onChange={(e) => setTestScenario(prev => ({
                      ...prev,
                      deviceType: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="testRememberMe">Remember Me Enabled</Label>
                  <Switch
                    id="testRememberMe"
                    checked={testScenario.rememberMe}
                    onCheckedChange={(checked) => setTestScenario(prev => ({
                      ...prev,
                      rememberMe: checked
                    }))}
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Session Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatTime(calculateSessionTimeout())}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Warning at {sessionSettings.inactivityWarning} minutes before logout
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {testScenario.deviceType === "mobile" ? (
                      <Smartphone className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Monitor className="h-4 w-4 text-gray-600" />
                    )}
                    <span>Device: {testScenario.deviceType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span>Role: {testScenario.userType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sessionSettings.enableConcurrentSessions ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <LogOut className="h-4 w-4 text-red-600" />
                    )}
                    <span>
                      {sessionSettings.enableConcurrentSessions 
                        ? `Up to ${sessionSettings.maxConcurrentSessions} sessions`
                        : "Single session only"
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">1,247</div>
                      <p className="text-xs text-muted-foreground">Active Sessions</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">18</div>
                      <p className="text-xs text-muted-foreground">Admin Sessions</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">34</div>
                      <p className="text-xs text-muted-foreground">Expiring Soon</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Avg Session Duration</span>
                      <Badge variant="outline">6.2 hours</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Mobile Sessions</span>
                      <Badge variant="outline">42%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Remember Me Usage</span>
                      <Badge variant="outline">28%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Changes will affect all new sessions immediately</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}