import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Calendar, 
  Users, 
  Search, 
  FileText, 
  Settings, 
  X,
  Stethoscope,
  Heart,
  Shield,
  BarChart3,
  MessageSquare,
  Pill,
  Activity,
  Bell,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { NotificationBadge } from './notifications/NotificationBadge';
import { useNotifications } from '../hooks/useNotifications';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home }
    ];

    switch (user?.role) {
      case 'patient':
        return [
          ...baseItems,
          { name: 'My Profile', href: '/patient/profile', icon: User },
          { name: 'Find Doctors', href: '/patient/doctors', icon: Search },
          { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
          { name: 'Calendar', href: '/patient/appointment-calendar', icon: Calendar },
          { name: 'Reminders', href: '/patient/reminders', icon: Clock },
          { name: 'Medical Records', href: '/patient/reports', icon: FileText },
          { name: 'Health Metrics', href: '/patient/health', icon: Activity },
          { name: 'Messages', href: '/messages', icon: MessageSquare },
          { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount }
        ];
      
      case 'doctor':
        return [
          ...baseItems,
          { name: 'My Profile', href: '/doctor/profile', icon: Stethoscope },
          { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
          { name: 'Calendar', href: '/doctor/calendar', icon: Calendar },
          { name: 'Reminders', href: '/doctor/reminders', icon: Clock },
          { name: 'My Patients', href: '/doctor/patients', icon: Users },
          { name: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill },
          { name: 'Medical Records', href: '/doctor/records', icon: FileText },
          { name: 'Messages', href: '/messages', icon: MessageSquare },
          { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount }
        ];
      
      case 'admin':
        return [
          ...baseItems,
          { name: 'User Management', href: '/admin/users', icon: Users },
          { name: 'Doctor Approvals', href: '/admin/approvals', icon: Shield },
          { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
          { name: 'System Settings', href: '/admin/settings', icon: Settings },
          { name: 'Messages', href: '/messages', icon: MessageSquare },
          { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount }
        ];
      
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const NavItem = ({ item }: { item: typeof navigationItems[0] & { badge?: number } }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg' 
            : 'text-gray-700 hover:bg-white/50 hover:text-blue-600'
          }
        `}
      >
        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
        <span className="font-medium">{item.name}</span>
        {item.badge && item.badge > 0 && (
          <NotificationBadge count={item.badge} />
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white/80 backdrop-blur-lg border-r border-white/20 shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Menu
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center">
                {user?.profile_photo_url ? (
                  <img
                    src={user.profile_photo_url}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/20">
            <NavLink
              to="/settings"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-white/50 hover:text-blue-600 transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};