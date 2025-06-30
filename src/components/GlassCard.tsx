import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true 
}) => {
  return (
    <div 
      className={`
        backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6
        shadow-xl shadow-black/10
        ${hover ? 'hover:bg-white/20 hover:border-white/30 hover:shadow-2xl hover:shadow-black/20 hover:scale-105' : ''}
        transition-all duration-300 ease-out
        ${className}
      `}
    >
      {children}
    </div>
  );
};