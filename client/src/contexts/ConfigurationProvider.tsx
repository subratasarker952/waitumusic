import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminConfigType, DEFAULT_ADMIN_CONFIG } from '@shared/admin-config';
import { applyCSSCustomProperties } from '@shared/configuration-context';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';

interface ConfigurationContextType {
  config: AdminConfigType;
  updateConfig: (newConfig: Partial<AdminConfigType>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ConfigurationContext = createContext<ConfigurationContextType | null>(null);

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

interface ConfigurationProviderProps {
  children: ReactNode;
}

export function ConfigurationProvider({ children }: ConfigurationProviderProps) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Only fetch admin config if user is an admin (roleId 1 or 2)
  const isAdmin = !!user && (user.roleId === 1 || user.roleId === 2);

  // Fetch current configuration only for admins
  const { data: config = DEFAULT_ADMIN_CONFIG, isLoading } = useQuery({
    queryKey: ['/api/admin/config'],
    queryFn: () => apiRequest('/api/admin/config'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: isAdmin // Only run query if user is admin
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: Partial<AdminConfigType>) => 
      apiRequest('/api/admin/config', {
        method: 'PUT',
        body: JSON.stringify(newConfig)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update configuration');
    }
  });

  // Apply CSS custom properties when configuration changes
  useEffect(() => {
    if (config) {
      applyCSSCustomProperties(config);
    }
  }, [config]);

  const updateConfig = async (newConfig: Partial<AdminConfigType>) => {
    const mergedConfig = { ...config, ...newConfig };
    
    // Apply CSS properties immediately for instant feedback
    applyCSSCustomProperties(mergedConfig);
    
    // Update server
    await updateConfigMutation.mutateAsync(newConfig);
  };

  const contextValue: ConfigurationContextType = {
    config,
    updateConfig,
    isLoading: isLoading || updateConfigMutation.isPending,
    error
  };

  return (
    <ConfigurationContext.Provider value={contextValue}>
      {children}
    </ConfigurationContext.Provider>
  );
}