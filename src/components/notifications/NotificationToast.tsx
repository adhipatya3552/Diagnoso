import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, MessageSquare, AlertCircle, Bell } from 'lucide-react';
import { Notification } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  
  // Auto close timer
  useEffect(() => {
    if (!autoClose) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress < 0 ? 0 : newProgress;
      });
    }, 100);
    
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [autoClose, duration, onClose]);
  
  // Get notification icon based on type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };
  
  // Get notification background color based on type
  const getNotificationColor = () => {
    switch (notification.type) {
      case 'appointment':
        return 'bg-blue-50 border-blue-200';
      case 'message':
        return 'bg-green-50 border-green-200';
      case 'system':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  const handleClick = () => {
    if (notification.link) {
      window.location.href = notification.link;
    }
    onClose();
  };
  
  return (
    <div 
      className={`max-w-sm w-full bg-white/95 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      } ${getNotificationColor()}`}
    >
      <div className="p-4 cursor-pointer" onClick={handleClick}>
        <div className="flex items-start">
          <div className={`p-2 rounded-full ${
            notification.type === 'appointment' ? 'bg-blue-100' :
            notification.type === 'message' ? 'bg-green-100' :
            'bg-purple-100'
          } mr-3`}>
            {getNotificationIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExiting(true);
                  setTimeout(onClose, 300);
                }}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (action.onClick) action.onClick();
                      onClose();
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      action.variant === 'primary'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      {autoClose && (
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full transition-all ease-linear ${
              notification.type === 'appointment' ? 'bg-blue-500' :
              notification.type === 'message' ? 'bg-green-500' :
              'bg-purple-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};