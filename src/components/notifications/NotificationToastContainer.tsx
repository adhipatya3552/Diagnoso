import React from 'react';
import { NotificationToast } from './NotificationToast';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 3
}) => {
  const { toasts, removeToast } = useNotifications();
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4 flex flex-col items-end',
    'top-left': 'top-4 left-4 flex flex-col items-start',
    'bottom-right': 'bottom-4 right-4 flex flex-col-reverse items-end',
    'bottom-left': 'bottom-4 left-4 flex flex-col-reverse items-start',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center'
  };
  
  // Only show the most recent toasts up to maxToasts
  const visibleToasts = toasts.slice(0, maxToasts);
  
  return (
    <div className={`fixed z-50 space-y-3 ${positionClasses[position]}`}>
      {visibleToasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          notification={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};