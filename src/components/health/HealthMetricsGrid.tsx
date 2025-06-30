import React from 'react';
import { HealthMetric, HealthMetricsCard } from './HealthMetricsCard';

interface HealthMetricsGridProps {
  metrics: HealthMetric[];
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
  onMetricClick?: (metric: HealthMetric) => void;
  className?: string;
}

export const HealthMetricsGrid: React.FC<HealthMetricsGridProps> = ({
  metrics,
  variant = 'default',
  showProgress = false,
  onMetricClick,
  className = ''
}) => {
  const gridCols = variant === 'detailed' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  
  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>
      {metrics.map((metric) => (
        <HealthMetricsCard
          key={metric.id}
          metric={metric}
          variant={variant}
          showProgress={showProgress}
          onClick={onMetricClick ? () => onMetricClick(metric) : undefined}
        />
      ))}
    </div>
  );
};