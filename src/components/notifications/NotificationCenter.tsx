import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  Settings, 
  Search, 
  CheckCheck, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Trash2 
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/Button';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAllNotifications,
    loading 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'appointments' | 'messages' | 'system'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  
  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Filter notifications based on active tab and search term
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unread' && !notification.read) ||
      (activeTab === 'appointments' && notification.type === 'appointment') ||
      (activeTab === 'messages' && notification.type === 'message') ||
      (activeTab === 'system' && notification.type === 'system');
    
    return matchesSearch && matchesTab;
  });
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
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
  
  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'border-blue-200 hover:bg-blue-50';
      case 'message':
        return 'border-green-200 hover:bg-green-50';
      case 'system':
        return 'border-purple-200 hover:bg-purple-50';
      default:
        return 'border-gray-200 hover:bg-gray-50';
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.link) {
      window.location.href = notification.link;
    }
  };
  
  // Toggle notification panel
  const toggleNotificationPanel = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={toggleNotificationPanel}
        className="relative p-2 rounded-full hover:bg-white/20 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div 
          ref={notificationPanelRef}
          className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => window.location.href = '/settings'}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notifications..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white"
              />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'unread'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'system'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              System
            </button>
          </div>
          
          {/* Notification List */}
          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 transition-all duration-300 cursor-pointer group ${
                      notification.read ? 'bg-white' : 'bg-blue-50'
                    } ${getNotificationColor(notification.type)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'appointment' ? 'bg-blue-100' :
                        notification.type === 'message' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 line-clamp-1">{notification.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{notification.message}</p>
                          </div>
                          
                          <div className="flex flex-col items-end ml-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </span>
                            
                            <div className="flex mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCheck className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {notification.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (action.onClick) action.onClick();
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
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">No notifications</h4>
                <p className="text-gray-500 text-sm max-w-xs">
                  {searchTerm
                    ? "No notifications match your search"
                    : activeTab !== 'all'
                    ? `No ${activeTab} notifications`
                    : "You're all caught up! New notifications will appear here."}
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                onClick={() => window.location.href = '/notifications'}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                View all notifications
              </button>
              
              {filteredNotifications.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear {activeTab === 'all' ? 'all' : activeTab}
                </button>
              )}
            </div>
            
            {/* Clear Confirmation */}
            {showClearConfirm && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                <p className="text-sm text-red-800 mb-2">
                  Are you sure you want to clear {activeTab === 'all' ? 'all' : activeTab} notifications?
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      deleteAllNotifications(activeTab);
                      setShowClearConfirm(false);
                    }}
                    className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};