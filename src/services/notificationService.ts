import { supabase } from '../lib/supabase';
import { Notification, NotificationType } from '../types/notification';

// Create a notification
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  options?: {
    link?: string;
    actions?: Array<{ label: string; variant?: 'primary' | 'secondary' }>;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    image?: string;
    senderId?: string;
  }
) => {
  try {
    // In a real app, save to Supabase
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          type,
          link: options?.link,
          actions: options?.actions,
          priority: options?.priority || 'normal',
          image: options?.image,
          sender_id: options?.senderId,
          timestamp: new Date().toISOString(),
          read: false
        }
      ])
      .select();
    
    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Send email notification
export const sendEmailNotification = async (
  email: string,
  subject: string,
  body: string,
  options?: {
    template?: string;
    data?: Record<string, any>;
  }
) => {
  try {
    // In a real app, this would call an API endpoint or serverless function
    // that sends an email using a service like SendGrid, Mailgun, etc.
    
    // For demo purposes, we'll just log the email details
    console.log('Sending email notification:', {
      to: email,
      subject,
      body,
      template: options?.template,
      data: options?.data
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

// Send SMS notification
export const sendSmsNotification = async (
  phoneNumber: string,
  message: string
) => {
  try {
    // In a real app, this would call an API endpoint or serverless function
    // that sends an SMS using a service like Twilio, Nexmo, etc.
    
    // For demo purposes, we'll just log the SMS details
    console.log('Sending SMS notification:', {
      to: phoneNumber,
      message
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    throw error;
  }
};

// Send push notification
export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  options?: {
    icon?: string;
    image?: string;
    data?: Record<string, any>;
    actions?: Array<{ action: string; title: string }>;
  }
) => {
  try {
    // In a real app, this would call an API endpoint or serverless function
    // that sends a push notification using a service like Firebase Cloud Messaging,
    // OneSignal, etc.
    
    // For demo purposes, we'll just log the push notification details
    console.log('Sending push notification:', {
      userId,
      title,
      body,
      options
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

// Get user notification preferences
export const getUserNotificationPreferences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    // Return default preferences if none exist
    if (!data) {
      return {
        channels: {
          inApp: true,
          email: true,
          sms: false,
          push: false
        },
        types: {
          appointments: true,
          messages: true,
          reminders: true,
          system: true
        },
        frequency: 'immediate',
        doNotDisturb: {
          enabled: false,
          startTime: '22:00',
          endTime: '07:00'
        },
        emergencyOverride: true
      };
    }
    
    return data.preferences;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw error;
  }
};

// Update user notification preferences
export const updateUserNotificationPreferences = async (
  userId: string,
  preferences: any
) => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        preferences
      })
      .select();
    
    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

// Check if notification should be sent based on user preferences
export const shouldSendNotification = async (
  userId: string,
  type: NotificationType,
  channel: 'inApp' | 'email' | 'sms' | 'push',
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
) => {
  try {
    const preferences = await getUserNotificationPreferences(userId);
    
    // Check if the channel is enabled
    if (!preferences.channels[channel]) {
      return false;
    }
    
    // Check if the notification type is enabled
    const typeMapping: Record<NotificationType, keyof typeof preferences.types> = {
      'appointment': 'appointments',
      'message': 'messages',
      'system': 'system'
    };
    
    if (!preferences.types[typeMapping[type]]) {
      return false;
    }
    
    // Check Do Not Disturb
    if (preferences.doNotDisturb.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const startTime = preferences.doNotDisturb.startTime;
      const endTime = preferences.doNotDisturb.endTime;
      
      // Check if current time is within DND hours
      const isWithinDndHours = startTime <= endTime
        ? (currentTime >= startTime && currentTime <= endTime)
        : (currentTime >= startTime || currentTime <= endTime);
      
      // If within DND hours and not an emergency override
      if (isWithinDndHours && !(preferences.emergencyOverride && (priority === 'high' || priority === 'urgent'))) {
        return false;
      }
    }
    
    // Check frequency
    if (preferences.frequency !== 'immediate' && channel !== 'inApp') {
      // For non-immediate frequencies, we would queue the notification
      // for later delivery in a digest. For demo purposes, we'll just
      // return false for non-inApp channels.
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    // Default to sending in-app notifications if there's an error
    return channel === 'inApp';
  }
};