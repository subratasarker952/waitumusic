/**
 * Configuration Hook - Real-time Configuration Management
 * Provides React hooks for accessing and updating platform configuration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AdminConfigType } from '@shared/admin-config';
import { toast } from '@/hooks/use-toast';
import { useConfiguration as useConfigurationContext } from '../contexts/ConfigurationProvider';

export function useConfiguration() {
  const queryClient = useQueryClient();
  const configContext = useConfigurationContext();

  // Get current platform configuration (NO CACHE - REAL DATABASE QUERIES ONLY)
  const configurationQuery = useQuery({
    queryKey: ['/api/admin/configuration'],
    queryFn: () => apiRequest('/api/admin/configuration'),
    staleTime: 0, // No cache - always fetch fresh from database
    gcTime: 0, // No cache storage - real database queries only
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Update platform configuration
  const updateConfigurationMutation = useMutation({
    mutationFn: ({ config, changeDescription }: { 
      config: Partial<AdminConfigType>; 
      changeDescription?: string;
    }) => apiRequest('/api/admin/configuration', {
      method: 'PUT',
      body: JSON.stringify({ config, changeDescription }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/configuration'] });
      updateConfigurationInDOM(); // Update context immediately
      toast({
        title: "Configuration Updated",
        description: "Platform configuration has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  // Update specific UI element
  const updateUIElementMutation = useMutation({
    mutationFn: ({ elementPath, value, changeDescription }: {
      elementPath: string;
      value: any;
      changeDescription?: string;
    }) => apiRequest('/api/admin/configuration/ui-element', {
      method: 'PUT',
      body: JSON.stringify({ elementPath, value, changeDescription }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/configuration'] });
      updateConfigurationInDOM(); // Update context immediately
      toast({
        title: "UI Element Updated",
        description: "UI element has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update UI element",
        variant: "destructive",
      });
    },
  });

  // Get configuration history
  const historyQuery = useQuery({
    queryKey: ['/api/admin/configuration/history'],
    queryFn: () => apiRequest('/api/admin/configuration/history'),
    enabled: false, // Only fetch when explicitly requested
  });

  // Get user delegated aspects
  const getUserDelegatedAspects = (userId: number) => 
    useQuery({
      queryKey: ['/api/admin/configuration/delegations', userId],
      queryFn: () => apiRequest(`/api/admin/configuration/delegations/${userId}`),
      enabled: !!userId,
    });

  // Create configuration delegation
  const createDelegationMutation = useMutation({
    mutationFn: (delegationData: {
      delegatedTo: number;
      configurationAspects: string[];
      permissions: { read: boolean; write: boolean; admin: boolean };
      expiresAt?: Date;
    }) => apiRequest('/api/admin/configuration/delegation', {
      method: 'POST',
      body: JSON.stringify(delegationData),
    }),
    onSuccess: () => {
      toast({
        title: "Delegation Created",
        description: "Configuration delegation has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delegation Failed",
        description: error.message || "Failed to create delegation",
        variant: "destructive",
      });
    },
  });

  return {
    // Queries
    configuration: configurationQuery.data,
    isLoadingConfiguration: configurationQuery.isLoading,
    configurationError: configurationQuery.error,
    
    history: historyQuery.data,
    isLoadingHistory: historyQuery.isLoading,
    fetchHistory: historyQuery.refetch,
    
    // Mutations
    updateConfiguration: updateConfigurationMutation.mutate,
    isUpdatingConfiguration: updateConfigurationMutation.isPending,
    
    updateUIElement: updateUIElementMutation.mutate,
    isUpdatingUIElement: updateUIElementMutation.isPending,
    
    createDelegation: createDelegationMutation.mutate,
    isCreatingDelegation: createDelegationMutation.isPending,
    
    // Utilities
    getUserDelegatedAspects,
    refreshConfiguration: updateConfigurationInDOM,
  };
}

// Specialized hook for UI configuration
export function useUIConfiguration() {
  const { configuration, updateUIElement, isUpdatingUIElement } = useConfiguration();
  
  const updateToastDuration = (duration: number) => {
    updateUIElement({
      elementPath: 'ui.toasts.duration',
      value: duration,
      changeDescription: `Updated toast duration to ${duration}ms`,
    });
  };

  const updateApiTimeout = (type: 'short' | 'medium' | 'long', timeout: number) => {
    updateUIElement({
      elementPath: `api.timeout.${type}`,
      value: timeout,
      changeDescription: `Updated ${type} API timeout to ${timeout}ms`,
    });
  };

  const updateSecuritySetting = (setting: string, value: any) => {
    updateUIElement({
      elementPath: `security.${setting}`,
      value,
      changeDescription: `Updated security setting ${setting} to ${value}`,
    });
  };

  return {
    configuration,
    isUpdating: isUpdatingUIElement,
    updateToastDuration,
    updateApiTimeout,
    updateSecuritySetting,
    updateUIElement,
  };
}