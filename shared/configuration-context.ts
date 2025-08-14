/**
 * Real-time Configuration Context System
 * Provides live configuration updates across the platform
 */

import React, { createContext, useContext } from 'react';
import { AdminConfigType, DEFAULT_ADMIN_CONFIG } from './admin-config';

export interface ConfigurationContextType {
  config: AdminConfigType;
  updateConfig: (newConfig: Partial<AdminConfigType>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const ConfigurationContext = createContext<ConfigurationContextType>({
  config: DEFAULT_ADMIN_CONFIG,
  updateConfig: async () => {},
  isLoading: false,
  error: null
});

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

// CSS Custom Properties Generator
export const generateCSSCustomProperties = (config: AdminConfigType): string => {
  return `
    :root {
      /* Toast Configuration */
      --toast-duration: ${config.ui.toast.duration}ms;
      --toast-max-toasts: ${config.ui.toast.maxToasts};
      
      /* Color Configuration */
      --color-primary: ${config.ui.colors.primary};
      --color-secondary: ${config.ui.colors.secondary};
      --color-success: ${config.ui.colors.success};
      --color-warning: ${config.ui.colors.warning};
      --color-error: ${config.ui.colors.error};
      --color-info: ${config.ui.colors.info};
      
      /* Modal Configuration */
      --modal-animation-duration: ${config.ui.modal.animationDuration}ms;
      
      /* Technical Rider Configuration */
      --technical-rider-autosave-interval: ${config.technicalRider.autoSaveInterval}ms;
      --max-band-members: ${config.technicalRider.maxBandMembers};
      --max-team-members: ${config.technicalRider.maxTeamMembers};
      --max-management-members: ${config.technicalRider.maxManagementMembers};
      
      /* API Configuration (for frontend timeout displays) */
      --api-timeout-short: ${config.api.timeout.short}ms;
      --api-timeout-medium: ${config.api.timeout.medium}ms;
      --api-timeout-long: ${config.api.timeout.long}ms;
      
      /* Security Configuration (for frontend displays) */
      --session-timeout: ${config.security.sessionTimeout}ms;
      --max-login-attempts: ${config.security.maxFailedAttempts};
    }
  `;
};

// Apply CSS Custom Properties to DOM
export const applyCSSCustomProperties = (config: AdminConfigType) => {
  if (typeof document !== 'undefined') {
    const styleElement = document.getElementById('dynamic-config-styles') || document.createElement('style');
    styleElement.id = 'dynamic-config-styles';
    styleElement.textContent = generateCSSCustomProperties(config);
    
    if (!document.getElementById('dynamic-config-styles')) {
      document.head.appendChild(styleElement);
    }
  }
};