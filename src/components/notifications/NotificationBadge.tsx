import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationBadgeProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 9,
  showZero = false,
  className = ''
}) => {
  const { unreadCount } = useNotifications();
  
  // Use provided count or get from context
  const badgeCount = count !== undefined ? count : unreadCount;
  
  // Don't render if count is 0 and showZero is false
  if (badgeCount === 0 && !showZero) {
    return null;
  }
  
  return (
    <span 
      className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full bg-red-500 text-white animate-pulse ${className}`}
    >
      {badgeCount > max ? `${max}+` : badgeCount}
    </span>
  );
};