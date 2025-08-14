import React from 'react';
import { useModalSystem } from '@/hooks/useModalSystem';

// Import all modal components
import { DataIntegrityReportModal, OpportunityValidationModal } from './modals/DataIntegrityModals';
import { 
  SystemConfigModal, 
  UserManagementModal, 
  MediaManagementModal, 
  EmailConfigModal 
} from './modals/SystemActionModals';
import { 
  NotificationModal, 
  SystemStatusModal, 
  ProgressModal, 
  SuccessModal, 
  ErrorDetailModal 
} from './modals/NotificationModals';

interface ModalProviderProps {
  children: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const modalSystem = useModalSystem();

  return (
    <>
      {children}
      
      {/* Data Integrity Modals */}
      <DataIntegrityReportModal
        open={modalSystem.isModalOpen('dataIntegrityReport')}
        onOpenChange={(open) => !open && modalSystem.closeModal('dataIntegrityReport')}
      />
      
      <OpportunityValidationModal
        open={modalSystem.isModalOpen('opportunityValidation')}
        onOpenChange={(open) => !open && modalSystem.closeModal('opportunityValidation')}
        opportunityData={modalSystem.getModalData('opportunityValidation')?.opportunityData}
        onValidated={modalSystem.getModalData('opportunityValidation')?.onValidated}
      />

      {/* System Action Modals */}
      <SystemConfigModal
        open={modalSystem.isModalOpen('systemConfig')}
        onOpenChange={(open) => !open && modalSystem.closeModal('systemConfig')}
        configType={modalSystem.getModalData('systemConfig')?.configType || 'database'}
      />

      <UserManagementModal
        open={modalSystem.isModalOpen('userManagement')}
        onOpenChange={(open) => !open && modalSystem.closeModal('userManagement')}
        mode={modalSystem.getModalData('userManagement')?.mode || 'create'}
        userData={modalSystem.getModalData('userManagement')?.userData}
        onUserAction={modalSystem.getModalData('userManagement')?.onUserAction}
      />

      <MediaManagementModal
        open={modalSystem.isModalOpen('mediaManagement')}
        onOpenChange={(open) => !open && modalSystem.closeModal('mediaManagement')}
        mediaType={modalSystem.getModalData('mediaManagement')?.mediaType || 'photos'}
      />

      <EmailConfigModal
        open={modalSystem.isModalOpen('emailConfig')}
        onOpenChange={(open) => !open && modalSystem.closeModal('emailConfig')}
      />

      {/* Notification Modals */}
      <NotificationModal
        open={modalSystem.isModalOpen('notification')}
        onOpenChange={(open) => !open && modalSystem.closeModal('notification')}
        type={modalSystem.getModalData('notification')?.type || 'info'}
        title={modalSystem.getModalData('notification')?.title || ''}
        message={modalSystem.getModalData('notification')?.message || ''}
        details={modalSystem.getModalData('notification')?.details}
        actionButton={modalSystem.getModalData('notification')?.actionButton}
        onConfirm={modalSystem.getModalData('notification')?.onConfirm}
      />

      <SystemStatusModal
        open={modalSystem.isModalOpen('systemStatus')}
        onOpenChange={(open) => !open && modalSystem.closeModal('systemStatus')}
        status={modalSystem.getModalData('systemStatus') || {
          type: 'info',
          title: 'System Status',
          message: 'System is operational',
          timestamp: new Date().toISOString()
        }}
      />

      <ProgressModal
        open={modalSystem.isModalOpen('progress')}
        onOpenChange={(open) => !open && modalSystem.closeModal('progress')}
        title={modalSystem.getModalData('progress')?.title || 'Processing...'}
        message={modalSystem.getModalData('progress')?.message || 'Please wait...'}
        progress={modalSystem.getModalData('progress')?.progress}
        steps={modalSystem.getModalData('progress')?.steps}
        currentStep={modalSystem.getModalData('progress')?.currentStep}
        allowCancel={modalSystem.getModalData('progress')?.allowCancel}
        onCancel={modalSystem.getModalData('progress')?.onCancel}
      />

      <SuccessModal
        open={modalSystem.isModalOpen('success')}
        onOpenChange={(open) => !open && modalSystem.closeModal('success')}
        title={modalSystem.getModalData('success')?.title || 'Success'}
        message={modalSystem.getModalData('success')?.message || 'Operation completed successfully'}
        nextAction={modalSystem.getModalData('success')?.nextAction}
      />

      <ErrorDetailModal
        open={modalSystem.isModalOpen('error')}
        onOpenChange={(open) => !open && modalSystem.closeModal('error')}
        title={modalSystem.getModalData('error')?.title || 'Error'}
        message={modalSystem.getModalData('error')?.message || 'An error occurred'}
        error={modalSystem.getModalData('error')?.error}
        suggestions={modalSystem.getModalData('error')?.suggestions}
        reportAction={modalSystem.getModalData('error')?.reportAction}
        retryAction={modalSystem.getModalData('error')?.retryAction}
      />
    </>
  );
}

// Context for accessing the modal system
const ModalContext = React.createContext<ReturnType<typeof useModalSystem> | null>(null);

export function ModalSystemProvider({ children }: { children: React.ReactNode }) {
  const modalSystem = useModalSystem();

  return (
    <ModalContext.Provider value={modalSystem}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalSystemProvider');
  }
  return context;
}