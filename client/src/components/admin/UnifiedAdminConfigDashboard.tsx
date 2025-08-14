import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, Save, RotateCcw
} from 'lucide-react';
import { 
  AdminConfigType, 
  DEFAULT_ADMIN_CONFIG
} from '@shared/admin-config';
import { useConfiguration } from '@/contexts/ConfigurationProvider';
import { WYSIWYGConfigControls } from './WYSIWYGConfigControls';

const UnifiedAdminConfigDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { config: contextConfig, updateConfig: updateConfigContext } = useConfiguration();

  const [config, setConfig] = useState<AdminConfigType>(contextConfig || DEFAULT_ADMIN_CONFIG);
  const [isLoading, setIsLoading] = useState(false);

  // Update local config when context changes
  useEffect(() => {
    if (contextConfig) {
      setConfig(contextConfig);
    }
  }, [contextConfig]);

  // Save configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: AdminConfigType) => {
      return apiRequest('/api/admin/config', {
        method: 'PUT',
        body: JSON.stringify(newConfig)
      });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Configuration saved successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save configuration', variant: 'destructive' });
    }
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveConfigMutation.mutateAsync(config);
      await updateConfigContext(config);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    setConfig(DEFAULT_ADMIN_CONFIG);
    await updateConfigContext(DEFAULT_ADMIN_CONFIG);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading configuration...</p>
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
            Unified Platform Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Control all platform settings, UI behavior, and system configurations from this central dashboard
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
            {isLoading ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Platform Configuration - WYSIWYG UI Controls */}
      <WYSIWYGConfigControls onSave={handleSave} isLoading={isLoading} />
    </div>
  );
};

export default UnifiedAdminConfigDashboard;