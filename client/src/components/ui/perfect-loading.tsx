import React from 'react';
import { Loader2 } from 'lucide-react';

interface PerfectLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PerfectLoading({ 
  message = "Loading...", 
  size = 'md',
  className = ""
}: PerfectLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]} text-primary mb-2`} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Alias for compatibility
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}> = ({ size = 'md', text = "Loading...", className }) => {
  return <PerfectLoading message={text} size={size} className={className} />;
};

// Additional loading components for specific use cases
export const OpportunityCardLoader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
      <div className="bg-gray-200 h-4 rounded mb-2"></div>
      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
    </div>
  );
};

export const DashboardLoader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="animate-pulse">
        <div className="bg-gray-200 h-8 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-200 h-24 rounded"></div>
          <div className="bg-gray-200 h-24 rounded"></div>
          <div className="bg-gray-200 h-24 rounded"></div>
        </div>
      </div>
    </div>
  );
};