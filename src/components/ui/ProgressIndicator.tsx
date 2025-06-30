import React from 'react';

export interface ProgressIndicatorProps {
  value: number;
  max?: number;
  variant?: 'linear' | 'circular' | 'step';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  showLabel?: boolean;
  label?: string;
  steps?: string[];
  currentStep?: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  variant = 'linear',
  size = 'md',
  color = 'blue',
  showLabel = false,
  label,
  steps = [],
  currentStep = 0,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  const sizes = {
    sm: { linear: 'h-2', circular: 'w-8 h-8' },
    md: { linear: 'h-3', circular: 'w-12 h-12' },
    lg: { linear: 'h-4', circular: 'w-16 h-16' }
  };

  if (variant === 'circular') {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={`relative ${className}`}>
        <svg className={`${sizes[size].circular} transform -rotate-90`} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${colors[color]} transition-all duration-500 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {label || `${Math.round(percentage)}%`}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'step') {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-300
                  ${index <= currentStep 
                    ? `${colors[color]} text-white shadow-lg` 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {index + 1}
              </div>
              <span className="text-xs text-gray-600 mt-1 text-center max-w-20">
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="relative">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
          <div 
            className={`absolute top-4 left-4 h-0.5 ${colors[color]} transition-all duration-500`}
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full ${sizes[size].linear} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${sizes[size].linear} ${colors[color]} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};