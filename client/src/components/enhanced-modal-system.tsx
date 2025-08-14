import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useSuccessNotification } from '@/components/ui/success-notification';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
  loading?: boolean;
  error?: string;
  success?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const EnhancedModal: React.FC<EnhancedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  headerActions,
  footerActions,
  loading = false,
  error,
  success,
  onSuccess,
  onError
}) => {
  const { showSuccess } = useSuccessNotification();
  const { measurePerformance } = usePerformanceOptimization();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Handle success notifications
  useEffect(() => {
    if (success) {
      showSuccess({ 
        message: success, 
        type: 'default',
        duration: 3000 
      });
      onSuccess?.();
    }
  }, [success, showSuccess, onSuccess]);

  // Handle error notifications  
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Enhanced close handler with performance measurement
  const handleClose = useCallback(() => {
    measurePerformance(() => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 200);
    }, 'modal_close');
  }, [onClose, measurePerformance]);

  // Keyboard event handling
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isOpen, closeOnEscape, handleClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0] as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-7xl';
      default: return 'max-w-lg';
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={closeOnOverlayClick ? handleClose : undefined}
    >
      <DialogContent 
        ref={modalRef}
        className={cn(
          getSizeClasses(),
          'max-h-[90vh] overflow-y-auto',
          isClosing && 'animate-out fade-out-0 zoom-out-95',
          className
        )}
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <div className="flex items-center gap-2">
            {headerActions}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Success</span>
            </div>
            <p className="text-green-700 mt-1">{success}</p>
          </div>
        )}

        {/* Modal Content */}
        {!loading && (
          <ErrorBoundary>
            <div className="py-4">
              {children}
            </div>
          </ErrorBoundary>
        )}

        {/* Footer Actions */}
        {footerActions && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            {footerActions}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Modal Hook for easier management
export const useEnhancedModal = () => {
  const [modals, setModals] = useState<Array<{
    id: string;
    props: EnhancedModalProps;
  }>>([]);

  const openModal = useCallback((props: Omit<EnhancedModalProps, 'isOpen' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setModals(prev => [...prev, {
      id,
      props: {
        ...props,
        isOpen: true,
        onClose: () => {
          setModals(prev => prev.filter(modal => modal.id !== id));
        }
      }
    }]);

    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  const ModalContainer = () => (
    <>
      {modals.map(({ id, props }) => (
        <EnhancedModal key={id} {...props} />
      ))}
    </>
  );

  return {
    openModal,
    closeModal,
    closeAllModals,
    ModalContainer,
    modalCount: modals.length
  };
};

// Higher-order component for modal integration
export const withModalIntegration = <P extends object>(
  Component: React.ComponentType<P>,
  defaultModalProps?: Partial<EnhancedModalProps>
) => {
  return (props: P & { modalProps?: Partial<EnhancedModalProps> }) => {
    const { modalProps, ...componentProps } = props;
    const { openModal, ModalContainer } = useEnhancedModal();

    const enhancedProps = {
      ...componentProps,
      openModal: (modalContentProps: Omit<EnhancedModalProps, 'isOpen' | 'onClose'>) =>
        openModal({ ...defaultModalProps, ...modalProps, ...modalContentProps })
    };

    return (
      <>
        <Component {...enhancedProps as P} />
        <ModalContainer />
      </>
    );
  };
};