import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface UseModalStateOptions {
  onOpen?: () => void;
  onClose?: () => void;
  resetFormOnClose?: boolean;
  confirmBeforeClose?: boolean;
  confirmMessage?: string;
}

export function useModalState(options: UseModalStateOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const formRef = useRef<any>(null);
  
  const {
    onOpen,
    onClose,
    resetFormOnClose = true,
    confirmBeforeClose = false,
    confirmMessage = 'You have unsaved changes. Are you sure you want to close?'
  } = options;
  
  // Open modal
  const open = useCallback(() => {
    setIsOpen(true);
    setHasUnsavedChanges(false);
    onOpen?.();
  }, [onOpen]);
  
  // Close modal with confirmation if needed
  const close = useCallback(() => {
    const shouldClose = () => {
      setIsClosing(true);
      
      // Reset form if needed
      if (resetFormOnClose && formRef.current?.reset) {
        formRef.current.reset();
      }
      
      // Cleanup
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        setHasUnsavedChanges(false);
        onClose?.();
      }, 200); // Animation duration
    };
    
    // Check for confirmation
    if (confirmBeforeClose && hasUnsavedChanges) {
      if (window.confirm(confirmMessage)) {
        shouldClose();
      }
    } else {
      shouldClose();
    }
  }, [confirmBeforeClose, hasUnsavedChanges, confirmMessage, resetFormOnClose, onClose]);
  
  // Toggle modal
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);
  
  // Register form for automatic reset
  const registerForm = useCallback((form: any) => {
    formRef.current = form;
  }, []);
  
  // Mark as having unsaved changes
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);
  
  // Mark as saved
  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);
  
  return {
    isOpen,
    isClosing,
    hasUnsavedChanges,
    open,
    close,
    toggle,
    registerForm,
    markAsChanged,
    markAsSaved,
    setIsOpen // For dialog component compatibility
  };
}

// Hook for managing multiple modals
export function useMultipleModals<T extends string>(modalNames: T[]) {
  const [openModals, setOpenModals] = useState<Set<T>>(new Set());
  
  const isOpen = useCallback((modalName: T) => {
    return openModals.has(modalName);
  }, [openModals]);
  
  const open = useCallback((modalName: T) => {
    setOpenModals(prev => new Set(prev).add(modalName));
  }, []);
  
  const close = useCallback((modalName: T) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      next.delete(modalName);
      return next;
    });
  }, []);
  
  const toggle = useCallback((modalName: T) => {
    if (isOpen(modalName)) {
      close(modalName);
    } else {
      open(modalName);
    }
  }, [isOpen, open, close]);
  
  const closeAll = useCallback(() => {
    setOpenModals(new Set());
  }, []);
  
  return {
    isOpen,
    open,
    close,
    toggle,
    closeAll,
    openModals: Array.from(openModals)
  };
}

// Hook for confirmation dialogs
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'default' | 'destructive';
  } | null>(null);
  
  const confirm = useCallback((options: typeof config) => {
    setConfig(options);
    setIsOpen(true);
  }, []);
  
  const handleConfirm = useCallback(() => {
    config?.onConfirm();
    setIsOpen(false);
    setConfig(null);
  }, [config]);
  
  const handleCancel = useCallback(() => {
    config?.onCancel?.();
    setIsOpen(false);
    setConfig(null);
  }, [config]);
  
  return {
    isOpen,
    config,
    confirm,
    handleConfirm,
    handleCancel,
    setIsOpen
  };
}

// Hook for managing form state in modals
export function useModalForm<T extends Record<string, any>>(options: {
  defaultValues?: T;
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  resetOnSuccess?: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = useCallback(async (data: T) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await options.onSubmit(data);
      
      if (options.resetOnSuccess) {
        // Reset will be handled by the form
      }
      
      options.onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      options.onError?.(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [options]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    isSubmitting,
    error,
    handleSubmit,
    clearError
  };
}