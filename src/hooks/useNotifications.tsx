import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Notification, NotificationType, NotificationAction } from '../types/notification';

interface NotificationContextType {
  notifications: Notification[];
  toasts: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: (type?: 'all' | 'unread' | 'appointments' | 'messages' | 'system') => void;
  showToast: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  removeToast: (id: string) => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // In a real app, fetch from Supabase
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setNotifications(data);
        } else {
          // For demo, use mock data
          const mockNotifications: Notification[] = [
            {
              id: '1',
              title: 'Appointment Confirmed',
              message: 'Your appointment with Dr. Sarah Johnson on January 15, 2025 at 2:00 PM has been confirmed.',
              type: 'appointment',
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
              read: false,
              link: '/patient/appointments',
              actions: [
                {
                  label: 'View Details',
                  variant: 'primary',
                  onClick: () => window.location.href = '/patient/appointments'
                },
                {
                  label: 'Reschedule',
                  variant: 'secondary',
                  onClick: () => console.log('Reschedule clicked')
                }
              ]
            },
            {
              id: '2',
              title: 'New Message',
              message: 'Dr. Michael Chen sent you a new message regarding your recent lab results.',
              type: 'message',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
              read: true,
              link: '/messages'
            },
            {
              id: '3',
              title: 'Prescription Refill Reminder',
              message: 'Your prescription for Lisinopril will expire in 3 days. Please contact your doctor for a refill.',
              type: 'system',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
              read: false,
              actions: [
                {
                  label: 'Request Refill',
                  variant: 'primary',
                  onClick: () => console.log('Request refill clicked')
                }
              ]
            },
            {
              id: '4',
              title: 'Appointment Reminder',
              message: 'Reminder: You have an appointment with Dr. Emily Rodriguez tomorrow at 11:00 AM.',
              type: 'appointment',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
              read: false,
              link: '/patient/appointments'
            },
            {
              id: '5',
              title: 'Lab Results Available',
              message: 'Your recent blood test results are now available. Please review them at your earliest convenience.',
              type: 'system',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
              read: true,
              link: '/patient/reports'
            }
          ];
          
          setNotifications(mockNotifications);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    if (user) {
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, payload => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          showToast(newNotification);
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);
  
  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
    if (!user) return '';
    
    const id = uuidv4();
    const newNotification: Notification = {
      id,
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // In a real app, save to Supabase
    supabase
      .from('notifications')
      .insert([{
        ...newNotification,
        user_id: user.id
      }])
      .then(({ error }) => {
        if (error) console.error('Error saving notification:', error);
      });
    
    // Update local state
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast for the new notification
    showToast(newNotification);
    
    return id;
  }, [user]);
  
  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    if (!user) return;
    
    // In a real app, update in Supabase
    supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error marking notification as read:', error);
      });
    
    // Update local state
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  }, [user]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    if (!user) return;
    
    // In a real app, update in Supabase
    supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .then(({ error }) => {
        if (error) console.error('Error marking all notifications as read:', error);
      });
    
    // Update local state
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, [user]);
  
  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    if (!user) return;
    
    // In a real app, delete from Supabase
    supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error deleting notification:', error);
      });
    
    // Update local state
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, [user]);
  
  // Delete all notifications
  const deleteAllNotifications = useCallback((type?: 'all' | 'unread' | 'appointments' | 'messages' | 'system') => {
    if (!user) return;
    
    // In a real app, delete from Supabase with appropriate filters
    let query = supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);
    
    if (type && type !== 'all') {
      if (type === 'unread') {
        query = query.eq('read', false);
      } else {
        query = query.eq('type', type);
      }
    }
    
    query.then(({ error }) => {
      if (error) console.error('Error deleting notifications:', error);
    });
    
    // Update local state
    setNotifications(prev => {
      if (!type || type === 'all') return [];
      
      return prev.filter(notification => {
        if (type === 'unread') return notification.read;
        return notification.type !== type;
      });
    });
  }, [user]);
  
  // Show toast notification
  const showToast = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
    const id = uuidv4();
    const newToast: Notification = {
      id,
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setToasts(prev => [newToast, ...prev]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
    
    return id;
  }, []);
  
  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  const contextValue: NotificationContextType = {
    notifications,
    toasts,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    showToast,
    removeToast,
    loading
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};