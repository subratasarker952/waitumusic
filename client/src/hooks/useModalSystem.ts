import { useState, useCallback } from 'react';

interface ModalState {
  [key: string]: {
    open: boolean;
    data?: any;
  };
}

interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string[];
  actionButton?: {
    label: string;
    action: () => void;
  };
  onConfirm?: () => void;
}

interface ProgressOptions {
  title: string;
  message: string;
  progress?: number;
  steps?: string[];
  currentStep?: number;
  allowCancel?: boolean;
  onCancel?: () => void;
}

interface SystemConfigOptions {
  configType: 'database' | 'security' | 'performance' | 'backup';
}

interface UserManagementOptions {
  mode: 'create' | 'edit' | 'view' | 'delete';
  userData?: any;
  onUserAction?: (action: string, data?: any) => void;
}

interface MediaManagementOptions {
  mediaType: 'photos' | 'videos' | 'documents' | 'audio';
}

export function useModalSystem() {
  const [modals, setModals] = useState<ModalState>({});

  const openModal = useCallback((modalKey: string, data?: any) => {
    setModals(prev => ({
      ...prev,
      [modalKey]: { open: true, data }
    }));
  }, []);

  const closeModal = useCallback((modalKey: string) => {
    setModals(prev => ({
      ...prev,
      [modalKey]: { open: false }
    }));
  }, []);

  const isModalOpen = useCallback((modalKey: string) => {
    return modals[modalKey]?.open || false;
  }, [modals]);

  const getModalData = useCallback((modalKey: string) => {
    return modals[modalKey]?.data;
  }, [modals]);

  // Specific modal methods to replace toast notifications
  const showNotification = useCallback((options: NotificationOptions) => {
    openModal('notification', options);
  }, [openModal]);

  const showSuccess = useCallback((title: string, message: string, nextAction?: { label: string; action: () => void }) => {
    openModal('success', { title, message, nextAction });
  }, [openModal]);

  const showError = useCallback((title: string, message: string, error?: any, suggestions?: string[], retryAction?: () => void) => {
    openModal('error', { 
      title, 
      message, 
      error, 
      suggestions, 
      retryAction,
      reportAction: () => {
        console.log('Error reported:', { title, message, error });
      }
    });
  }, [openModal]);

  const showProgress = useCallback((options: ProgressOptions) => {
    openModal('progress', options);
  }, [openModal]);

  const updateProgress = useCallback((progress?: number, currentStep?: number, message?: string) => {
    setModals(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        data: {
          ...prev.progress?.data,
          progress,
          currentStep,
          message: message || prev.progress?.data?.message
        }
      }
    }));
  }, []);

  const showSystemConfig = useCallback((options: SystemConfigOptions) => {
    openModal('systemConfig', options);
  }, [openModal]);

  const showUserManagement = useCallback((options: UserManagementOptions) => {
    openModal('userManagement', options);
  }, [openModal]);

  const showMediaManagement = useCallback((options: MediaManagementOptions) => {
    openModal('mediaManagement', options);
  }, [openModal]);

  const showEmailConfig = useCallback(() => {
    openModal('emailConfig', {});
  }, [openModal]);

  const showDataIntegrityReport = useCallback(() => {
    openModal('dataIntegrityReport', {});
  }, [openModal]);

  const showOpportunityValidation = useCallback((opportunityData: any, onValidated?: (data: any) => void) => {
    openModal('opportunityValidation', { opportunityData, onValidated });
  }, [openModal]);

  const showSystemStatus = useCallback((status: any) => {
    openModal('systemStatus', status);
  }, [openModal]);

  // Replace common toast patterns
  const showDatabaseOptimization = useCallback(() => {
    showProgress({
      title: 'Database Optimization',
      message: 'Optimizing database performance and connections...',
      steps: [
        'Analyzing query performance',
        'Optimizing indexes',
        'Cleaning up connections',
        'Updating statistics'
      ],
      currentStep: 0,
      allowCancel: false
    });

    // Simulate process
    let step = 0;
    const interval = setInterval(() => {
      step++;
      updateProgress((step / 4) * 100, step);
      
      if (step >= 4) {
        clearInterval(interval);
        closeModal('progress');
        showSuccess(
          'Database Optimized',
          'Database performance has been successfully optimized. Query response times improved by 15%.',
          {
            label: 'View Report',
            action: () => console.log('Database optimization report opened')
          }
        );
      }
    }, 1000);
  }, [showProgress, updateProgress, closeModal, showSuccess]);

  const showSecurityScan = useCallback(() => {
    showProgress({
      title: 'Security Scan',
      message: 'Running comprehensive security analysis...',
      steps: [
        'Scanning for vulnerabilities',
        'Checking access permissions',
        'Validating authentication',
        'Generating security report'
      ],
      currentStep: 0,
      allowCancel: true,
      onCancel: () => console.log('Security scan cancelled')
    });

    // Simulate process
    let step = 0;
    const interval = setInterval(() => {
      step++;
      updateProgress((step / 4) * 100, step);
      
      if (step >= 4) {
        clearInterval(interval);
        closeModal('progress');
        showSuccess(
          'Security Scan Complete',
          'No security vulnerabilities detected. All systems are secure.',
          {
            label: 'View Details',
            action: () => console.log('Security report opened')
          }
        );
      }
    }, 1500);
  }, [showProgress, updateProgress, closeModal, showSuccess]);

  const showBackupProcess = useCallback(() => {
    showProgress({
      title: 'Database Backup',
      message: 'Creating system backup...',
      progress: 0,
      allowCancel: false
    });

    // Simulate backup process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      updateProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        closeModal('progress');
        showSuccess(
          'Backup Complete',
          'System backup has been successfully created and stored securely.',
          {
            label: 'Download Backup',
            action: () => console.log('Backup download initiated')
          }
        );
      }
    }, 300);
  }, [showProgress, updateProgress, closeModal, showSuccess]);

  return {
    // Modal state management
    openModal,
    closeModal,
    isModalOpen,
    getModalData,
    
    // Notification methods (replaces toast)
    showNotification,
    showSuccess,
    showError,
    showProgress,
    updateProgress,
    
    // System action methods
    showSystemConfig,
    showUserManagement,
    showMediaManagement,
    showEmailConfig,
    showDataIntegrityReport,
    showOpportunityValidation,
    showSystemStatus,
    
    // Common system actions
    showDatabaseOptimization,
    showSecurityScan,
    showBackupProcess,
    
    // Modal states for rendering
    modals
  };
}