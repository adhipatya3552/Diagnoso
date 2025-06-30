import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs text-white/70">typing</span>
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
        <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.6s' }} />
        <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.6s' }} />
      </div>
    </div>
  );
};