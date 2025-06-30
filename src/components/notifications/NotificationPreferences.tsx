import React, { useState, useEffect } from 'react';
import { Bell, Mail, Phone, MessageSquare, Calendar, AlertCircle, Clock, Moon, Check, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';

export interface NotificationPreferences {
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  types: {
    appointments: boolean;
    messages: boolean;
    reminders: boolean;
    system: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  emergencyOverride: boolean;
}

interface NotificationPreferencesProps {
  onSave?: (preferences: NotificationPreferences) => Promise<void>;
  className?: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  onSave,
  className = ''
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
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
  });
  
  const [loading, setLoading] = useState(false);
  
  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data && data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (err) {
        console.error('Error loading notification preferences:', err);
      }
    };
    
    loadPreferences();
  }, [user]);
  
  // Handle toggle for channel preferences
  const handleChannelToggle = (channel: keyof NotificationPreferences['channels']) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel]
      }
    }));
  };
  
  // Handle toggle for notification types
  const handleTypeToggle = (type: keyof NotificationPreferences['types']) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
  };
  
  // Handle frequency change
  const handleFrequencyChange = (frequency: NotificationPreferences['frequency']) => {
    setPreferences(prev => ({
      ...prev,
      frequency
    }));
  };
  
  // Handle do not disturb toggle
  const handleDndToggle = () => {
    setPreferences(prev => ({
      ...prev,
      doNotDisturb: {
        ...prev.doNotDisturb,
        enabled: !prev.doNotDisturb.enabled
      }
    }));
  };
  
  // Handle do not disturb time change
  const handleDndTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setPreferences(prev => ({
      ...prev,
      doNotDisturb: {
        ...prev.doNotDisturb,
        [field]: value
      }
    }));
  };
  
  // Handle emergency override toggle
  const handleEmergencyOverrideToggle = () => {
    setPreferences(prev => ({
      ...prev,
      emergencyOverride: !prev.emergencyOverride
    }));
  };
  
  // Handle save preferences
  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (onSave) {
        await onSave(preferences);
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .upsert({
            user_id: user.id,
            preferences: preferences
          });
        
        if (error) throw error;
      }
      
      success('Notification preferences saved successfully');
    } catch (err: any) {
      console.error('Error saving notification preferences:', err);
      error(err.message || 'Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-lg ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <Bell className="w-5 h-5 text-blue-500 mr-2" />
        Notification Preferences
      </h2>
      
      <div className="space-y-8">
        {/* Notification Channels */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Channels</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">In-App Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications within the application</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels.inApp}
                  onChange={() => handleChannelToggle('inApp')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels.email}
                  onChange={() => handleChannelToggle('email')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via text message</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels.sms}
                  onChange={() => handleChannelToggle('sms')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels.push}
                  onChange={() => handleChannelToggle('push')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Types</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Appointment Notifications</p>
                  <p className="text-sm text-gray-500">Reminders, confirmations, and changes</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.types.appointments}
                  onChange={() => handleTypeToggle('appointments')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Message Notifications</p>
                  <p className="text-sm text-gray-500">New messages and replies</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.types.messages}
                  onChange={() => handleTypeToggle('messages')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Reminder Notifications</p>
                  <p className="text-sm text-gray-500">Medication, follow-ups, and health tasks</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.types.reminders}
                  onChange={() => handleTypeToggle('reminders')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">System Notifications</p>
                  <p className="text-sm text-gray-500">Account updates, security alerts, and platform news</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.types.system}
                  onChange={() => handleTypeToggle('system')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Notification Frequency */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Frequency</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                checked={preferences.frequency === 'immediate'}
                onChange={() => handleFrequencyChange('immediate')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-800">Immediate</p>
                <p className="text-sm text-gray-500">Receive notifications as they happen</p>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                checked={preferences.frequency === 'daily'}
                onChange={() => handleFrequencyChange('daily')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-800">Daily Digest</p>
                <p className="text-sm text-gray-500">Receive a daily summary of all notifications</p>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                checked={preferences.frequency === 'weekly'}
                onChange={() => handleFrequencyChange('weekly')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-800">Weekly Digest</p>
                <p className="text-sm text-gray-500">Receive a weekly summary of all notifications</p>
              </div>
            </label>
          </div>
        </div>
        
        {/* Do Not Disturb */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Do Not Disturb</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Moon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Do Not Disturb</p>
                  <p className="text-sm text-gray-500">Pause notifications during specific hours</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.doNotDisturb.enabled}
                  onChange={handleDndToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {preferences.doNotDisturb.enabled && (
              <div className="pl-12 space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={preferences.doNotDisturb.startTime}
                      onChange={(e) => handleDndTimeChange('startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={preferences.doNotDisturb.endTime}
                      onChange={(e) => handleDndTimeChange('endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.emergencyOverride}
                    onChange={handleEmergencyOverrideToggle}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-800">Allow Emergency Overrides</p>
                    <p className="text-sm text-gray-500">Critical notifications will still be delivered</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">About Notification Settings</h4>
              <p className="text-sm text-blue-700 mt-1">
                These settings control how and when you receive notifications from Diagnosa. 
                You can customize your preferences to ensure you receive important updates 
                without being overwhelmed.
              </p>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            loading={loading}
            icon={Check}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};