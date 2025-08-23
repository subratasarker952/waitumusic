import React from 'react';
import logoImage from '/WaituMusic_Logo_AI_1753582673973.png';

interface WaituMusicLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const WaituMusicLogo: React.FC<WaituMusicLogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = false 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src={logoImage} 
        alt="WaituMusic Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`font-bold text-primary ${textSizeClasses[size]}`}>
          Wai'tuMusic
        </span>
      )}
    </div>
  );
};