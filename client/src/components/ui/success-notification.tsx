import React, { useEffect, useState } from 'react';
import { Check, X, Music, Star, Heart, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessNotificationProps {
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  type?: 'default' | 'music' | 'booking' | 'favorite' | 'professional';
  autoClose?: boolean;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  message,
  description,
  duration = 4000,
  onClose,
  type = 'default',
  autoClose = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, autoClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'music':
        return <Music className="h-5 w-5" />;
      case 'booking':
        return <Star className="h-5 w-5" />;
      case 'favorite':
        return <Heart className="h-5 w-5" />;
      case 'professional':
        return <Briefcase className="h-5 w-5" />;
      default:
        return <Check className="h-5 w-5" />;
    }
  };

  const getThemeClasses = () => {
    switch (type) {
      case 'music':
        return 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-800';
      case 'booking':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800';
      case 'favorite':
        return 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800';
      case 'professional':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800';
      default:
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm w-full mx-auto pointer-events-auto",
      "transform transition-all duration-300 ease-in-out",
      isLeaving ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
    )}>
      <div className={cn(
        "rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        getThemeClasses()
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">
              {message}
            </p>
            {description && (
              <p className="mt-1 text-xs opacity-80">
                {description}
              </p>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {autoClose && (
          <div className="mt-2 h-1 bg-black/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current opacity-30 rounded-full transition-all ease-linear"
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Custom hook for success notifications
export const useSuccessNotification = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    props: SuccessNotificationProps;
  }>>([]);

  const showSuccess = (props: Omit<SuccessNotificationProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setNotifications(prev => [...prev, {
      id,
      props: {
        ...props,
        onClose: () => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }
      }
    }]);
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(({ id, props }) => (
        <SuccessNotification key={id} {...props} />
      ))}
    </div>
  );

  return {
    showSuccess,
    clearAll,
    NotificationContainer,
    notificationCount: notifications.length
  };
};

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);