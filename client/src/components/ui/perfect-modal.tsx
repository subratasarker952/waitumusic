/**
 * Industry-Standard Perfect Modal Component
 * Handles accessibility, focus management, animations, and consistency
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PerfectButton } from './perfect-button';

export interface PerfectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  
  // Modal types for consistent styling
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
  
  // Size variants
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // Footer actions
  showFooter?: boolean;
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    variant?: 'default' | 'destructive' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  
  // Behavior
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  
  // Custom styling
  className?: string;
  contentClassName?: string;
  
  // Accessibility
  'aria-describedby'?: string;
}

const modalTypeIcons = {
  default: null,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const modalTypeColors = {
  default: '',
  success: 'border-l-4 border-green-500',
  warning: 'border-l-4 border-yellow-500',
  error: 'border-l-4 border-red-500',
  info: 'border-l-4 border-blue-500',
};

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]',
};

export const PerfectModal: React.FC<PerfectModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  type = 'default',
  size = 'md',
  showFooter = true,
  primaryAction,
  secondaryAction,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  preventScroll = true,
  className,
  contentClassName,
  'aria-describedby': ariaDescribedBy,
}) => {
  const TypeIcon = modalTypeIcons[type];

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEscape) {
      onOpenChange(false);
    }
  }, [closeOnEscape, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [open, handleKeyDown, preventScroll]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            className
          )}
        />
        
        {/* Modal Content */}
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
            'bg-white dark:bg-gray-900 rounded-lg border shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200',
            sizeClasses[size],
            modalTypeColors[type],
            contentClassName
          )}
          onPointerDownOutside={closeOnOutsideClick ? undefined : (e) => e.preventDefault()}
          aria-describedby={ariaDescribedBy}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              {TypeIcon && (
                <TypeIcon className={cn(
                  'h-6 w-6',
                  type === 'success' && 'text-green-600',
                  type === 'warning' && 'text-yellow-600',
                  type === 'error' && 'text-red-600',
                  type === 'info' && 'text-blue-600'
                )} />
              )}
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {description}
                  </Dialog.Description>
                )}
              </div>
            </div>
            
            <Dialog.Close asChild>
              <button
                className={cn(
                  'rounded-sm opacity-70 ring-offset-background transition-opacity',
                  'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  'disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
                )}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          {children && (
            <div className="px-6 py-2 max-h-[60vh] overflow-y-auto">
              {children}
            </div>
          )}

          {/* Footer */}
          {showFooter && (primaryAction || secondaryAction) && (
            <div className="flex items-center justify-end space-x-3 p-6 pt-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
              {secondaryAction && (
                <PerfectButton
                  variant="outline"
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.label}
                </PerfectButton>
              )}
              {primaryAction && (
                <PerfectButton
                  variant={primaryAction.variant || 'default'}
                  onClick={primaryAction.onClick}
                  loading={primaryAction.loading}
                  loadingText="Processing..."
                >
                  {primaryAction.label}
                </PerfectButton>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Specialized modal variants for common use cases
export const ConfirmationModal: React.FC<Omit<PerfectModalProps, 'type'> & {
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}> = ({
  onConfirm,
  onOpenChange,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  ...props
}) => (
  <PerfectModal
    {...props}
    type={destructive ? 'error' : 'warning'}
    onOpenChange={onOpenChange}
    primaryAction={{
      label: confirmText,
      onClick: onConfirm,
      variant: destructive ? 'destructive' : 'default',
    }}
    secondaryAction={{
      label: cancelText,
      onClick: () => onOpenChange(false),
    }}
  />
);

export const SuccessModal: React.FC<Omit<PerfectModalProps, 'type'>> = (props) => (
  <PerfectModal {...props} type="success" />
);

export const ErrorModal: React.FC<Omit<PerfectModalProps, 'type'>> = (props) => (
  <PerfectModal {...props} type="error" />
);