import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ProgressIndicator } from '../ui/ProgressIndicator';

export interface HealthMetric {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'normal' | 'warning' | 'critical' | 'good';
  target?: number;
  progress?: number;
  lastUpdated?: string;
  description?: string;
  color?: string;
}

export interface HealthMetricsCardProps {
  metric: HealthMetric;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

export const HealthMetricsCard: React.FC<HealthMetricsCardProps> = ({
  metric,
  variant = 'default',
  showProgress = false,
  onClick,
  className = ''
}) => {
  const Icon = metric.icon;
  
  const statusColors = {
    normal: 'text-blue-600 bg-blue-50 border-blue-200',
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  };

  const iconColors = {
    normal: 'text-blue-500',
    good: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500'
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    stable: 'text-gray-500'
  };

  const TrendIcon = metric.trend ? trendIcons[metric.trend] : null;
  const statusColor = metric.status ? statusColors[metric.status] : statusColors.normal;
  const iconColor = metric.status ? iconColors[metric.status] : iconColors.normal;
  const customColor = metric.color ? metric.color : '';

  if (variant === 'compact') {
    return (
      <div
        className={`
          bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300
          ${onClick ? 'cursor-pointer hover:scale-105' : ''}
          ${className}
        `}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColor}`}>
              <Icon className={`w-5 h-5 ${iconColor} ${customColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{metric.title}</p>
              <p className="text-lg font-bold text-gray-900">
                {metric.value}
                {metric.unit && <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>}
              </p>
            </div>
          </div>
          
          {TrendIcon && (
            <div className="flex items-center space-x-1">
              <TrendIcon className={`w-4 h-4 ${trendColors[metric.trend!]}`} />
              {metric.trendValue && (
                <span className={`text-sm font-medium ${trendColors[metric.trend!]}`}>
                  {metric.trendValue}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={`
          bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300
          ${onClick ? 'cursor-pointer hover:scale-105' : ''}
          ${className}
        `}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColor}`}>
              <Icon className={`w-6 h-6 ${iconColor} ${customColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{metric.title}</h3>
              {metric.lastUpdated && (
                <p className="text-sm text-gray-500">Updated {metric.lastUpdated}</p>
              )}
            </div>
          </div>
          
          {TrendIcon && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
              metric.trend === 'up' ? 'bg-green-50' :
              metric.trend === 'down' ? 'bg-red-50' :
              'bg-gray-50'
            }`}>
              <TrendIcon className={`w-4 h-4 ${trendColors[metric.trend!]}`} />
              {metric.trendValue && (
                <span className={`text-sm font-medium ${trendColors[metric.trend!]}`}>
                  {metric.trendValue}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
            {metric.unit && (
              <span className="text-lg text-gray-500">{metric.unit}</span>
            )}
          </div>
          
          {metric.target && (
            <p className="text-sm text-gray-600 mt-1">
              Target: {metric.target}{metric.unit}
            </p>
          )}
          
          {metric.description && (
            <p className="text-sm text-gray-600 mt-2">{metric.description}</p>
          )}
        </div>
        
        {showProgress && metric.progress !== undefined && (
          <ProgressIndicator
            value={metric.progress}
            color={metric.status === 'good' ? 'green' : metric.status === 'warning' ? 'yellow' : metric.status === 'critical' ? 'red' : 'blue'}
            showLabel
            className="mt-4"
          />
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-300
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${statusColor}`}>
          <Icon className={`w-6 h-6 ${iconColor} ${customColor}`} />
        </div>
        
        {TrendIcon && (
          <div className="flex items-center space-x-1">
            <TrendIcon className={`w-4 h-4 ${trendColors[metric.trend!]}`} />
            {metric.trendValue && (
              <span className={`text-sm font-medium ${trendColors[metric.trend!]}`}>
                {metric.trendValue}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
          {metric.unit && (
            <span className="text-sm text-gray-500">{metric.unit}</span>
          )}
        </div>
        
        {metric.lastUpdated && (
          <p className="text-xs text-gray-500 mt-2">Updated {metric.lastUpdated}</p>
        )}
        
        {showProgress && metric.progress !== undefined && (
          <ProgressIndicator
            value={metric.progress}
            color={metric.status === 'good' ? 'green' : metric.status === 'warning' ? 'yellow' : metric.status === 'critical' ? 'red' : 'blue'}
            size="sm"
            className="mt-3"
          />
        )}
      </div>
    </div>
  );
};