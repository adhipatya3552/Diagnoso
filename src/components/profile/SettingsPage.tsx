import React, { useState } from 'react';
import { 
  Shield, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Trash2, 
  Download,
  Save,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { TabNavigation } from '../navigation/TabNavigation';
import { useToast } from '../../hooks/useToast';

export interface SettingsData {
  // Security Settings
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  
  // Notification Settings
  emailNotifications: {
    appointments: boolean;
    reminders: boolean;
    messages: boolean;
    marketing: boolean;
  };
  smsNotifications: {
    appointments: boolean;
    reminders: boolean;
    emergencies: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    appointments: boolean;
    messages: boolean;
  };
  
  // Privacy Settings
  profileVisibility: 'public' | 'private' | 'doctors-only';
  dataSharing: boolean;
  analyticsOptOut: boolean;
  
  // Appearance Settings
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  
  // Account Settings
  autoLogout: number; // minutes
  sessionTimeout: boolean;
}

export interface SettingsPageProps {
  userRole: 'doctor' | 'patient';
  initialData?: Partial<SettingsData>;
  onSave: (data: Partial<SettingsData>) => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
  onExportData?: () => Promise<void>;
  className?: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' }
];

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userRole,
  initialData = {},
  onSave,
  onDeleteAccount,
  onExportData,
  className = ''
}) => {
  const { success, error } = useToast();
  const [settings, setSettings] = useState<SettingsData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    emailNotifications: {
      appointments: true,
      reminders: true,
      messages: true,
      marketing: false
    },
    smsNotifications: {
      appointments: true,
      reminders: true,
      emergencies: true
    },
    pushNotifications: {
      enabled: true,
      appointments: true,
      messages: true
    },
    profileVisibility: 'doctors-only',
    dataSharing: false,
    analyticsOptOut: false,
    theme: 'system',
    language: 'en',
    timezone: 'America/New_York',
    autoLogout: 30,
    sessionTimeout: true,
    ...initialData
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('security');

  const handleSettingChange = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const handleSave = async (section?: keyof SettingsData) => {
    setLoading(true);
    try {
      const dataToSave = section ? { [section]: settings[section] } : settings;
      await onSave(dataToSave);
      success('Settings saved successfully!');
    } catch (err) {
      error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!settings.currentPassword || !settings.newPassword) {
      error('Please fill in all password fields');
      return;
    }
    
    if (settings.newPassword !== settings.confirmPassword) {
      error('New passwords do not match');
      return;
    }
    
    if (settings.newPassword.length < 8) {
      error('New password must be at least 8 characters long');
      return;
    }

    await handleSave();
    setSettings(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      error('Please type DELETE to confirm account deletion');
      return;
    }

    setLoading(true);
    try {
      await onDeleteAccount?.();
      success('Account deletion initiated');
      setShowDeleteModal(false);
    } catch (err) {
      error('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      await onExportData?.();
      success('Data export initiated. You will receive an email when ready.');
    } catch (err) {
      error('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'account', label: 'Account', icon: Lock }
  ];

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
        
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              value={settings.currentPassword}
              onChange={(e) => setSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
              icon={Lock}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="relative">
            <Input
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={settings.newPassword}
              onChange={(e) => setSettings(prev => ({ ...prev, newPassword: e.target.value }))}
              icon={Lock}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <Input
            label="Confirm New Password"
            type="password"
            value={settings.confirmPassword}
            onChange={(e) => setSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
            icon={Lock}
          />
          
          <Button
            onClick={handlePasswordChange}
            variant="primary"
            loading={loading}
          >
            Update Password
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Two-Factor Authentication</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">Add an extra layer of security to your account</p>
            <p className="text-sm text-gray-500 mt-1">
              {settings.twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.twoFactorEnabled}
              onChange={(e) => handleSettingChange('twoFactorEnabled', '', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Management</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">Auto-logout after inactivity</p>
              <p className="text-sm text-gray-500">Automatically sign out after a period of inactivity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', '', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {settings.sessionTimeout && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-logout time (minutes)
              </label>
              <select
                value={settings.autoLogout}
                onChange={(e) => handleSettingChange('autoLogout', '', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Mail className="w-5 h-5 text-blue-500 mr-2" />
          Email Notifications
        </h3>
        
        <div className="space-y-4">
          {Object.entries(settings.emailNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-sm text-gray-500">
                  {key === 'appointments' && 'Receive emails about appointment confirmations and changes'}
                  {key === 'reminders' && 'Get reminder emails before your appointments'}
                  {key === 'messages' && 'Receive emails when you get new messages from doctors'}
                  {key === 'marketing' && 'Receive promotional emails and health tips'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('emailNotifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Smartphone className="w-5 h-5 text-green-500 mr-2" />
          SMS Notifications
        </h3>
        
        <div className="space-y-4">
          {Object.entries(settings.smsNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-sm text-gray-500">
                  {key === 'appointments' && 'Receive SMS about appointment confirmations'}
                  {key === 'reminders' && 'Get SMS reminders before your appointments'}
                  {key === 'emergencies' && 'Receive urgent SMS notifications'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('smsNotifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Bell className="w-5 h-5 text-purple-500 mr-2" />
          Push Notifications
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">Enable push notifications</p>
              <p className="text-sm text-gray-500">Allow browser notifications from Diagnosa</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications.enabled}
                onChange={(e) => handleSettingChange('pushNotifications', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {settings.pushNotifications.enabled && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-gray-700">Appointment notifications</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications.appointments}
                    onChange={(e) => handleSettingChange('pushNotifications', 'appointments', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-gray-700">Message notifications</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications.messages}
                    onChange={(e) => handleSettingChange('pushNotifications', 'messages', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Visibility</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who can see your profile?
          </label>
          <select
            value={settings.profileVisibility}
            onChange={(e) => handleSettingChange('profileVisibility', '', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="public">Public - Anyone can see your profile</option>
            <option value="doctors-only">Doctors Only - Only verified doctors can see your profile</option>
            <option value="private">Private - Only you can see your profile</option>
          </select>
        </div>
      </div>

      {/* Data Sharing */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Sharing</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">Share anonymized data for research</p>
              <p className="text-sm text-gray-500">Help improve healthcare by sharing anonymized health data for medical research</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dataSharing}
                onChange={(e) => handleSettingChange('dataSharing', '', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">Opt out of analytics</p>
              <p className="text-sm text-gray-500">Prevent collection of usage analytics to improve the platform</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.analyticsOptOut}
                onChange={(e) => handleSettingChange('analyticsOptOut', '', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme</h3>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Smartphone }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleSettingChange('theme', '', value)}
              className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                settings.theme === value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 ${settings.theme === value ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${settings.theme === value ? 'text-blue-700' : 'text-gray-700'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Globe className="w-5 h-5 text-green-500 mr-2" />
          Language & Region
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', '', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', '', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      {/* Data Export */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Export</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">Download your data</p>
            <p className="text-sm text-gray-500">Export all your personal data in a portable format</p>
          </div>
          <Button
            onClick={handleExportData}
            variant="outline"
            icon={Download}
            loading={loading}
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          Danger Zone
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-700 font-medium">Delete your account</p>
            <p className="text-sm text-red-600">This action cannot be undone. All your data will be permanently deleted.</p>
          </div>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
            icon={Trash2}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and security settings</p>
      </div>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="underline"
        className="mb-8"
      />

      <div className="min-h-96">
        {activeTab === 'security' && renderSecuritySettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'privacy' && renderPrivacySettings()}
        {activeTab === 'appearance' && renderAppearanceSettings()}
        {activeTab === 'account' && renderAccountSettings()}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={() => handleSave()}
          variant="primary"
          size="lg"
          loading={loading}
          icon={Save}
        >
          Save All Settings
        </Button>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">This action cannot be undone</h4>
                <p className="text-sm text-red-700 mt-1">
                  Deleting your account will permanently remove all your data, including:
                </p>
                <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                  <li>Profile information and medical history</li>
                  <li>Appointment records and messages</li>
                  <li>Uploaded documents and files</li>
                  <li>All account settings and preferences</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <strong>DELETE</strong> to confirm account deletion
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Type DELETE here"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="secondary"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="danger"
              fullWidth
              loading={loading}
              disabled={deleteConfirmation !== 'DELETE'}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};