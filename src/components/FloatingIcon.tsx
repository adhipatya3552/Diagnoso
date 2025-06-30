import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FloatingIconProps {
  icon: LucideIcon;
  className?: string;
  animationDelay?: string;
}

export const FloatingIcon: React.FC<FloatingIconProps> = ({ 
  icon: Icon, 
  className = '', 
  animationDelay = '0s' 
}) => {
  return (
    <div 
      className={`absolute animate-bounce ${className}`}
      style={{ animationDelay, animationDuration: '3s' }}
    >
      <Icon className="w-8 h-8 text-white/30 animate-pulse" />
    </div>
  );
};