import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, Palette, Clock, Save, RotateCcw,
  Eye, MousePointer, Layers, Shield, DollarSign
} from 'lucide-react';
import { useConfiguration } from '@/contexts/ConfigurationProvider';
import { AdminConfigType, DEFAULT_ADMIN_CONFIG } from '@shared/admin-config';

interface PlatformConfigurationTabProps {
  userRole: string;
  userId: number;
}

export default function PlatformConfigurationTab({ userRole, userId }: PlatformConfigurationTabProps) {
  const { toast } = useToast();
  const {
    config: configuration,
    isLoading,
    updateConfig: updateConfigContext,
    error
  } = useConfiguration();
  
  const [config, setConfig] = useState<AdminConfigType>(DEFAULT_ADMIN_CONFIG);

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
    toast({ title: "Platform configuration saved successfully" });
  };

  // Reset to defaults
  const handleReset = async () => {
    setConfig(DEFAULT_ADMIN_CONFIG);
    await updateConfigContext(DEFAULT_ADMIN_CONFIG);
    toast({ title: "Platform configuration reset to defaults" });
  };

  if (userRole !== 'superadmin') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Access Denied: Only superadmin can access platform configuration</p>
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
            <Settings className="h-6 w-6" />
            Platform Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure platform UI behavior, toast settings, and user interface controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ui-controls" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="ui-controls" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            UI Controls
          </TabsTrigger>
          <TabsTrigger value="commission-rates" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Commission Rates
          </TabsTrigger>
          <TabsTrigger value="feature-toggles" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Feature Toggles
          </TabsTrigger>
          <TabsTrigger value="modal-access" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Modal Access
          </TabsTrigger>
        </TabsList>

        {/* UI Controls */}
        <TabsContent value="ui-controls">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Toast Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Toast Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Toast Duration (ms)</Label>
                  <Input
                    type="number"
                    min="100"
                    max="10000"
                    value={config.uiControls?.toastDurationMs || 3000}
                    onChange={(e) => updateConfigValue('uiControls.toastDurationMs', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration for toast notifications (100ms - 10000ms)
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Auto-dismiss toasts</Label>
                  <Switch
                    checked={config.uiControls?.autoHideToasts || true}
                    onCheckedChange={(checked) => updateConfigValue('uiControls.autoHideToasts', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Theme Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme & Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Dark mode available</Label>
                  <Switch
                    checked={config.uiControls?.darkModeEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('uiControls.darkModeEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Custom branding</Label>
                  <Switch
                    checked={config.uiControls?.customBrandingEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('uiControls.customBrandingEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Commission Rates */}
        <TabsContent value="commission-rates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Consultation Commission Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Consultation Commission Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Non-Managed Users (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.commissionRates?.nonManaged || 10}
                    onChange={(e) => updateConfigValue('commissionRates.nonManaged', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Commission rate for non-managed users
                  </p>
                </div>
                
                <div>
                  <Label>Publisher Level (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.commissionRates?.publisherLevel || 7.5}
                    onChange={(e) => updateConfigValue('commissionRates.publisherLevel', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Commission rate for publisher level managed users
                  </p>
                </div>
                
                <div>
                  <Label>Representation Level (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.commissionRates?.representationLevel || 5}
                    onChange={(e) => updateConfigValue('commissionRates.representationLevel', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Commission rate for representation level managed users
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fully Managed Commission Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Fully Managed Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Fully Managed Artists (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.commissionRates?.fullyManagedArtists || 0}
                    onChange={(e) => updateConfigValue('commissionRates.fullyManagedArtists', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Commission rate for fully managed artists
                  </p>
                </div>
                
                <div>
                  <Label>Fully Managed Musicians (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.commissionRates?.fullyManagedMusicians || 0}
                    onChange={(e) => updateConfigValue('commissionRates.fullyManagedMusicians', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Commission rate for fully managed musicians
                  </p>
                </div>
                
                <div>
                  <Label>Fully Managed Professionals (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.commissionRates?.fullyManagedProfessionals || 2.5}
                    onChange={(e) => updateConfigValue('commissionRates.fullyManagedProfessionals', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Commission rate for fully managed professionals
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Commission Rate Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Processing Fee + Commission:</strong> Platform adds processing fee + commission over and above the user-set price</p>
                <p>• <strong>Free Consultation Posting:</strong> All users can post consultations for free regardless of management level</p>
                <p>• <strong>Commission Structure:</strong> Commission rates are applied based on the user's management tier when bookings are processed</p>
                <p>• <strong>Rate Updates:</strong> Changes to commission rates apply to new bookings created after the update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Toggles */}
        <TabsContent value="feature-toggles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Platform Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Demo Mode</Label>
                  <Switch
                    checked={config.featureToggles?.demoModeEnabled || false}
                    onCheckedChange={(checked) => updateConfigValue('featureToggles.demoModeEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>User Registration</Label>
                  <Switch
                    checked={config.featureToggles?.userRegistrationEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('featureToggles.userRegistrationEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Booking System</Label>
                  <Switch
                    checked={config.featureToggles?.bookingSystemEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('featureToggles.bookingSystemEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Technical Rider Access for Talent</Label>
                  <Switch
                    checked={config.technicalRider?.allowAssignedTalentAccess || false}
                    onCheckedChange={(checked) => updateConfigValue('technicalRider.allowAssignedTalentAccess', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>File Uploads</Label>
                  <Switch
                    checked={config.featureToggles?.fileUploadsEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('featureToggles.fileUploadsEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Email System</Label>
                  <Switch
                    checked={config.featureToggles?.emailSystemEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('featureToggles.emailSystemEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Analytics</Label>
                  <Switch
                    checked={config.featureToggles?.analyticsEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('featureToggles.analyticsEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Modal Access */}
        <TabsContent value="modal-access">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Technical Modals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Stage Plot Designer</Label>
                  <Switch
                    checked={config.modalAccess?.stagePlotDesignerEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('modalAccess.stagePlotDesignerEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Mixer Configuration</Label>
                  <Switch
                    checked={config.modalAccess?.mixerConfigEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('modalAccess.mixerConfigEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Setlist Manager</Label>
                  <Switch
                    checked={config.modalAccess?.setlistManagerEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('modalAccess.setlistManagerEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Management Modals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>User Management</Label>
                  <Switch
                    checked={config.modalAccess?.userManagementEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('modalAccess.userManagementEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Content Management</Label>
                  <Switch
                    checked={config.modalAccess?.contentManagementEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('modalAccess.contentManagementEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Media Management</Label>
                  <Switch
                    checked={config.modalAccess?.mediaManagementEnabled || true}
                    onCheckedChange={(checked) => updateConfigValue('modalAccess.mediaManagementEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}