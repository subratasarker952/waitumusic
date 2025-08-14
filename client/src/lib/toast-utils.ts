/**
 * Centralized Toast Utilities with Admin Configuration Integration
 * All toast calls should use these utilities to respect admin settings
 */

import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// Hook to get current admin configuration
export const useAdminConfig = () => {
  const { data: adminConfig } = useQuery({
    queryKey: ['/api/admin/config'],
    staleTime: 60000, // Cache for 1 minute
  });
  
  return adminConfig;
};

// Get dynamic toast duration from admin config
export const getToastDuration = (adminConfig?: any): number => {
  if (adminConfig?.ui?.toast?.duration) {
    return adminConfig.ui.toast.duration;
  }
  return 2000; // Default fallback to 2 seconds (more reasonable than 500ms)
};

// Enhanced toast hook that uses admin configuration
export const useEnhancedToast = () => {
  const { toast } = useToast();
  const adminConfig = useAdminConfig();
  
  const enhancedToast = (options: Parameters<typeof toast>[0]) => {
    const dynamicDuration = getToastDuration(adminConfig);
    
    return toast({
      ...options,
      // Only override duration if not explicitly provided
      duration: options.duration ?? dynamicDuration,
    });
  };
  
  return { toast: enhancedToast };
};

// Predefined toast types with admin configuration
export const createConfiguredToast = (adminConfig?: any) => {
  const duration = getToastDuration(adminConfig);
  
  return {
    success: (title: string, description?: string) => ({
      title,
      description,
      duration,
    }),
    error: (title: string, description?: string) => ({
      title,
      description,
      variant: 'destructive' as const,
      duration,
    }),
    info: (title: string, description?: string) => ({
      title,
      description,
      duration,
    }),
  };
};