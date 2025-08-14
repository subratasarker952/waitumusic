/**
 * Industry-Standard Toast Notification System
 * Consistent notifications across the platform
 */

import React from 'react';
import * as Toast from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100',
  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100',
};

const iconStyles = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',  
  info: 'text-blue-600 dark:text-blue-400',
};

export const ToastItem: React.FC<ToastProps & { onClose: () => void }> = ({
  title,
  description,
  type = 'info',
  action,
  onClose,
}) => {
  const Icon = toastIcons[type];

  return (
    <Toast.Root
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
        toastStyles[type]
      )}
      duration={5000}
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconStyles[type])} />
        <div className="flex-1 space-y-1">
          <Toast.Title className="text-sm font-semibold">
            {title}
          </Toast.Title>
          {description && (
            <Toast.Description className="text-sm opacity-90">
              {description}
            </Toast.Description>
          )}
        </div>
      </div>

      {action && (
        <Toast.Action
          altText={action.label}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={action.onClick}
        >
          {action.label}
        </Toast.Action>
      )}

      <Toast.Close
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Toast.Close>
    </Toast.Root>
  );
};

// Toast context and provider
interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

// Hook for enhanced toast functionality
export const useEnhancedToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useEnhancedToast must be used within a ToastProvider');
  }
  
  const { addToast } = context;
  
  const showToast = (config: {
    title: string;
    description?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }) => {
    addToast({
      title: config.title,
      description: config.description,
      type: config.type || 'info',
      duration: config.duration
    });
  };

  const toast = (config: { title: string; description?: string; variant?: string }) => {
    addToast({
      title: config.title,
      description: config.description,
      type: config.variant === 'destructive' ? 'error' : 'info'
    });
  };

  return { showToast, toast };
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <Toast.Provider swipeDirection="right">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
        <Toast.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

// Hook to use toasts within this component system
export const usePerfectToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('usePerfectToast must be used within a ToastProvider');
  }
  return context;
};

// Export for compatibility with existing imports
export const useToast = usePerfectToast;

// Convenience functions
export const toast = {
  success: (title: string, description?: string) => {
    // This will be implemented when the provider is integrated
    console.log('Success:', title, description);
  },
  error: (title: string, description?: string) => {
    console.log('Error:', title, description);
  },
  warning: (title: string, description?: string) => {
    console.log('Warning:', title, description);
  },
  info: (title: string, description?: string) => {
    console.log('Info:', title, description);
  },
};