import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  Bell,
  Clock,
  User,
  Settings,
  Database,
  Activity,
  Shield,
  Zap
} from "lucide-react";

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function NotificationModal({ 
  open, 
  onOpenChange, 
  type, 
  title, 
  message, 
  details,
  actionButton,
  onConfirm 
}: NotificationModalProps) {
  const getIcon = () => {
    const icons = {
      success: CheckCircle,
      error: AlertTriangle,
      warning: AlertTriangle,
      info: Info
    };
    const Icon = icons[type];
    const colors = {
      success: 'text-green-500',
      error: 'text-red-500', 
      warning: 'text-yellow-500',
      info: 'text-blue-500'
    };
    return <Icon className={`h-8 w-8 ${colors[type]}`} />;
  };

  const getBorderColor = () => {
    const colors = {
      success: 'border-green-200',
      error: 'border-red-200',
      warning: 'border-yellow-200', 
      info: 'border-blue-200'
    };
    return colors[type];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-lg ${getBorderColor()}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getIcon()}
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {message}
          </div>

          {details && details.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs space-y-1">
                  {details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {type === 'error' ? 'Dismiss' : 'Close'}
            </Button>
            <div className="flex gap-2">
              {actionButton && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    actionButton.action();
                    onOpenChange(false);
                  }}
                >
                  {actionButton.label}
                </Button>
              )}
              {onConfirm && (
                <Button 
                  onClick={() => {
                    onConfirm();
                    onOpenChange(false);
                  }}
                >
                  Confirm
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// System Status Notification Modal
interface SystemStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: {
    type: 'maintenance' | 'update' | 'alert' | 'success';
    title: string;
    message: string;
    timestamp: string;
    affectedSystems?: string[];
    estimatedDuration?: string;
    actionRequired?: boolean;
  };
}

export function SystemStatusModal({ open, onOpenChange, status }: SystemStatusModalProps) {
  const getStatusIcon = () => {
    const icons = {
      maintenance: Settings,
      update: Zap,
      alert: AlertTriangle,
      success: CheckCircle
    };
    const Icon = icons[status.type];
    if (!Icon) return null;
    const colors = {
      maintenance: 'text-orange-500',
      update: 'text-blue-500',
      alert: 'text-red-500',
      success: 'text-green-500'
    };
    return <Icon className={`h-6 w-6 ${colors[status.type]}`} />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            System Notification
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{status.title}</h3>
            <p className="text-sm text-muted-foreground">{status.message}</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span>{new Date(status.timestamp).toLocaleString()}</span>
            </div>
            {status.estimatedDuration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{status.estimatedDuration}</span>
              </div>
            )}
          </div>

          {status.affectedSystems && status.affectedSystems.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Affected Systems:</h4>
              <div className="flex flex-wrap gap-1">
                {status.affectedSystems.map((system, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {system}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {status.actionRequired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Action Required</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Please review system settings and take necessary action.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => onOpenChange(false)}>
              Acknowledge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Progress/Loading Modal (replaces loading toasts)
interface ProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  progress?: number; // 0-100
  steps?: string[];
  currentStep?: number;
  allowCancel?: boolean;
  onCancel?: () => void;
}

export function ProgressModal({ 
  open, 
  onOpenChange, 
  title, 
  message, 
  progress, 
  steps, 
  currentStep,
  allowCancel,
  onCancel 
}: ProgressModalProps) {
  return (
    <Dialog open={open} onOpenChange={allowCancel ? onOpenChange : undefined}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            {message}
          </div>

          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {steps && steps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Steps:</h4>
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {currentStep !== undefined && index < currentStep ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : currentStep === index ? (
                      <div className="h-3 w-3 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                    ) : (
                      <div className="h-3 w-3 border border-gray-300 rounded-full"></div>
                    )}
                    <span className={currentStep === index ? 'font-medium' : 'text-muted-foreground'}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allowCancel && (
            <div className="flex justify-end pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  onCancel?.();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Success Confirmation Modal (replaces success toasts)
interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  icon?: JSX.Element;
  nextAction?: {
    label: string;
    action: () => void;
  };
}

export function SuccessModal({ 
  open, 
  onOpenChange, 
  title, 
  message, 
  icon,
  nextAction 
}: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="text-center py-6">
          {icon || <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />}
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{message}</p>
          
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {nextAction && (
              <Button onClick={() => {
                nextAction.action();
                onOpenChange(false);
              }}>
                {nextAction.label}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Error Detail Modal (replaces error toasts)
interface ErrorDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  error?: {
    code?: string;
    details?: string;
    stack?: string;
  };
  suggestions?: string[];
  reportAction?: () => void;
  retryAction?: () => void;
}

export function ErrorDetailModal({ 
  open, 
  onOpenChange, 
  title, 
  message, 
  error,
  suggestions,
  reportAction,
  retryAction 
}: ErrorDetailModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {message}
          </div>

          {error && (
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-red-600">Error Details</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
              </CardHeader>
              {showDetails && (
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs font-mono">
                    {error.code && (
                      <div>
                        <span className="font-semibold">Code:</span> {error.code}
                      </div>
                    )}
                    {error.details && (
                      <div>
                        <span className="font-semibold">Details:</span> {error.details}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {suggestions && suggestions.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-600">Suggested Solutions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Dismiss
            </Button>
            <div className="flex gap-2">
              {reportAction && (
                <Button variant="outline" size="sm" onClick={reportAction}>
                  Report Issue
                </Button>
              )}
              {retryAction && (
                <Button size="sm" onClick={retryAction}>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}