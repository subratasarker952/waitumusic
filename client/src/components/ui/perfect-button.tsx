/**
 * Industry-Standard Perfect Button Component
 * Handles all interaction states, loading, accessibility, and consistency
 */

import React from 'react';
import { Button, ButtonProps } from './button';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PerfectButtonProps extends ButtonProps {
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  confirmable?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
  tooltip?: string;
  analytics?: {
    category: string;
    action: string;
    label?: string;
  };
}

export const PerfectButton = React.forwardRef<HTMLButtonElement, PerfectButtonProps>(
  ({
    children,
    loading = false,
    success = false,
    error = false,
    loadingText = 'Loading...',
    successText,
    errorText,
    icon,
    iconPosition = 'left',
    confirmable = false,
    confirmText = 'Are you sure?',
    onConfirm,
    onClick,
    disabled,
    className,
    analytics,
    tooltip,
    ...props
  }, ref) => {
    const [isConfirming, setIsConfirming] = React.useState(false);
    const [animationState, setAnimationState] = React.useState<'idle' | 'success' | 'error'>('idle');

    // Handle click with confirmation and analytics
    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;

      // Analytics tracking
      if (analytics && typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', analytics.action, {
          event_category: analytics.category,
          event_label: analytics.label,
        });
      }

      if (confirmable && !isConfirming) {
        setIsConfirming(true);
        return;
      }

      if (isConfirming && onConfirm) {
        onConfirm();
        setIsConfirming(false);
        return;
      }

      onClick?.(e);
    }, [loading, disabled, analytics, confirmable, isConfirming, onConfirm, onClick]);

    // Auto-reset confirmation after 3 seconds
    React.useEffect(() => {
      if (isConfirming) {
        const timer = setTimeout(() => setIsConfirming(false), 3000);
        return () => clearTimeout(timer);
      }
    }, [isConfirming]);

    // Handle success/error animations
    React.useEffect(() => {
      if (success) {
        setAnimationState('success');
        const timer = setTimeout(() => setAnimationState('idle'), 2000);
        return () => clearTimeout(timer);
      }
      if (error) {
        setAnimationState('error');
        const timer = setTimeout(() => setAnimationState('idle'), 2000);
        return () => clearTimeout(timer);
      }
    }, [success, error]);

    // Determine button content
    const getButtonContent = () => {
      if (loading) {
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </>
        );
      }

      if (animationState === 'success' && successText) {
        return (
          <>
            <Check className="h-4 w-4 text-green-600" />
            <span className="ml-2">{successText}</span>
          </>
        );
      }

      if (animationState === 'error' && errorText) {
        return (
          <>
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="ml-2">{errorText}</span>
          </>
        );
      }

      if (isConfirming) {
        return (
          <>
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="ml-2">{confirmText}</span>
          </>
        );
      }

      // Normal state
      return (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      );
    };

    // Dynamic styling based on state
    const getButtonClassName = () => {
      const baseClasses = 'transition-all duration-200 relative overflow-hidden';
      
      if (loading) return cn(baseClasses, 'cursor-wait', className);
      if (animationState === 'success') return cn(baseClasses, 'bg-green-600 hover:bg-green-700', className);
      if (animationState === 'error') return cn(baseClasses, 'bg-red-600 hover:bg-red-700', className);
      if (isConfirming) return cn(baseClasses, 'bg-orange-600 hover:bg-orange-700 animate-pulse', className);
      
      return cn(baseClasses, className);
    };

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={disabled || loading}
        className={getButtonClassName()}
        title={tooltip}
        aria-label={tooltip || (typeof children === 'string' ? children : undefined)}
        {...props}
      >
        {getButtonContent()}
        
        {/* Ripple effect for premium feel */}
        <span className="absolute inset-0 overflow-hidden rounded-md">
          <span className="absolute inset-0 rounded-md bg-white/20 opacity-0 transition-opacity duration-200 group-active:opacity-100" />
        </span>
      </Button>
    );
  }
);

PerfectButton.displayName = 'PerfectButton';