import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  Search, 
  Filter, 
  CheckCheck, 
  Trash2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Check 
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../types/notification';
import { Button } from '../components/ui/Button';
import { formatDistanceToNow, format } from 'date-fns';
import { NotificationPreferences } from '../components/notifications/NotificationPreferences';

export const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAllNotifications,
    loading 
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'appointments' | 'messages' | 'system'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'normal' | 'high' | 'urgent'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Update bulk actions visibility based on selection
  useEffect(() => {
    setShowBulkActions(selectedNotifications.size > 0);
  }, [selectedNotifications]);
  
  // Filter notifications based on active tab, search term, and filters
  const filteredNotifications = notifications.filter(notification => {
    // Filter by tab
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unread' && !notification.read) ||
      (activeTab === 'appointments' && notification.type === 'appointment') ||
      (activeTab === 'messages' && notification.type === 'message') ||
      (activeTab === 'system' && notification.type === 'system');
    
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by date
    const notificationDate = new Date(notification.timestamp);
    const now = new Date();
    const isToday = notificationDate.toDateString() === now.toDateString();
    const isThisWeek = notificationDate >= new Date(now.setDate(now.getDate() - 7));
    const isThisMonth = notificationDate >= new Date(now.setDate(now.getDate() - 30));
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && isToday) ||
      (dateFilter === 'week' && isThisWeek) ||
      (dateFilter === 'month' && isThisMonth);
    
    // Filter by priority
    const matchesPriority = priorityFilter === 'all' || 
      notification.priority === priorityFilter || 
      (!notification.priority && priorityFilter === 'normal');
    
    return matchesTab && matchesSearch && matchesDate && matchesPriority;
  });
  
  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });
  
  // Group notifications by date
  const groupedNotifications: Record<string, Notification[]> = {};
  
  sortedNotifications.forEach(notification => {
    const date = new Date(notification.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = format(date, 'MMMM d, yyyy');
    }
    
    if (!groupedNotifications[dateKey]) {
      groupedNotifications[dateKey] = [];
    }
    
    groupedNotifications[dateKey].push(notification);
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
  
  // Toggle notification selection
  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  // Select all notifications
  const selectAllNotifications = () => {
    if (selectedNotifications.size === sortedNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(sortedNotifications.map(n => n.id)));
    }
  };
  
  // Mark selected notifications as read
  const markSelectedAsRead = () => {
    selectedNotifications.forEach(id => {
      markAsRead(id);
    });
    setSelectedNotifications(new Set());
  };
  
  // Delete selected notifications
  const deleteSelectedNotifications = () => {
    selectedNotifications.forEach(id => {
      deleteNotification(id);
    });
    setSelectedNotifications(new Set());
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600 mt-2">Stay updated with your appointments, messages, and system alerts</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPreferences(!showPreferences)}
            >
              Notification Settings
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="primary"
                onClick={markAllAsRead}
              >
                Mark All as Read
              </Button>
            )}
          </div>
        </div>
        
        {/* Notification Preferences */}
        {showPreferences && (
          <div className="mb-8 animate-fade-in">
            <NotificationPreferences />
          </div>
        )}
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
              
              {/* Tabs */}
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'all'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5" />
                    <span>All Notifications</span>
                  </div>
                  <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                    {notifications.length}
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'unread'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5" />
                    <span>Unread</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'appointments'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5" />
                    <span>Appointments</span>
                  </div>
                  <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                    {notifications.filter(n => n.type === 'appointment').length}
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'messages'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </div>
                  <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                    {notifications.filter(n => n.type === 'message').length}
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('system')}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'system'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>System</span>
                  </div>
                  <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                    {notifications.filter(n => n.type === 'system').length}
                  </span>
                </button>
              </div>
              
              {/* Advanced Filters */}
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer mb-3"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <h3 className="font-medium text-gray-700 flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Advanced Filters</span>
                  </h3>
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                
                {showFilters && (
                  <div className="space-y-4 animate-slide-down">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                      </label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setDateFilter('all');
                        setPriorityFilter('all');
                        setSortBy('newest');
                        setSearchTerm('');
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Notification List */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
              {/* Search and Actions */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search notifications..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllNotifications}
                    >
                      {selectedNotifications.size === sortedNotifications.length && sortedNotifications.length > 0
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                    
                    {sortedNotifications.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowClearConfirm(true)}
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Bulk Actions */}
              {showBulkActions && (
                <div className="p-3 bg-blue-50 border-b border-blue-200 animate-slide-down">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">
                      {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
                    </span>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={CheckCheck}
                        onClick={markSelectedAsRead}
                      >
                        Mark as Read
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        onClick={deleteSelectedNotifications}
                      >
                        Delete
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        icon={X}
                        onClick={() => setSelectedNotifications(new Set())}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Clear Confirmation */}
              {showClearConfirm && (
                <div className="p-4 bg-red-50 border-b border-red-200 animate-fade-in">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800 mb-2">Clear all notifications?</h4>
                      <p className="text-sm text-red-700 mb-3">
                        This will permanently delete all {activeTab === 'all' ? '' : activeTab} notifications. This action cannot be undone.
                      </p>
                      
                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowClearConfirm(false)}
                        >
                          Cancel
                        </Button>
                        
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            deleteAllNotifications(activeTab);
                            setShowClearConfirm(false);
                          }}
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notifications */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : sortedNotifications.length > 0 ? (
                <div>
                  {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                    <div key={date}>
                      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-medium text-gray-700">{date}</h3>
                      </div>
                      
                      <div className="divide-y divide-gray-100">
                        {dateNotifications.map((notification) => (
                          <div key={notification.id} className="group">
                            <div 
                              className={`p-4 transition-all duration-300 ${
                                notification.read ? 'bg-white' : 'bg-blue-50'
                              } ${getNotificationColor(notification.type)}`}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedNotifications.has(notification.id)}
                                    onChange={() => toggleNotificationSelection(notification.id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                </div>
                                
                                <div className={`p-2 rounded-full ${
                                  notification.type === 'appointment' ? 'bg-blue-100' :
                                  notification.type === 'message' ? 'bg-green-100' :
                                  'bg-purple-100'
                                } mr-3`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                      <div className="flex items-center space-x-3 mt-2">
                                        <span className="text-xs text-gray-500 flex items-center">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </span>
                                        
                                        {notification.link && (
                                          <a 
                                            href={notification.link}
                                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!notification.read) {
                                                markAsRead(notification.id);
                                              }
                                            }}
                                          >
                                            View Details
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 ml-3">
                                      <button
                                        onClick={() => setExpandedNotification(
                                          expandedNotification === notification.id ? null : notification.id
                                        )}
                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        {expandedNotification === notification.id ? (
                                          <ChevronUp className="w-5 h-5" />
                                        ) : (
                                          <ChevronDown className="w-5 h-5" />
                                        )}
                                      </button>
                                      
                                      {!notification.read && (
                                        <button
                                          onClick={() => markAsRead(notification.id)}
                                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                          title="Mark as read"
                                        >
                                          <CheckCheck className="w-5 h-5" />
                                        </button>
                                      )}
                                      
                                      <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Expanded Content */}
                                  {expandedNotification === notification.id && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
                                      {notification.actions && notification.actions.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                          {notification.actions.map((action, index) => (
                                            <button
                                              key={index}
                                              onClick={() => {
                                                if (action.onClick) action.onClick();
                                                if (!notification.read) {
                                                  markAsRead(notification.id);
                                                }
                                              }}
                                              className={`px-4 py-2 text-sm font-medium rounded-lg ${
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
                                      
                                      <div className="text-sm text-gray-500">
                                        <p><strong>Received:</strong> {format(new Date(notification.timestamp), 'MMMM d, yyyy h:mm a')}</p>
                                        <p><strong>Status:</strong> {notification.read ? 'Read' : 'Unread'}</p>
                                        <p><strong>Type:</strong> {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}</p>
                                        {notification.priority && (
                                          <p><strong>Priority:</strong> {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No notifications</h3>
                  <p className="text-gray-500 max-w-md">
                    {searchTerm
                      ? "No notifications match your search"
                      : activeTab !== 'all'
                      ? `You don't have any ${activeTab} notifications`
                      : "You're all caught up! New notifications will appear here."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};