export type NotificationType = 'appointment' | 'message' | 'system';

export interface NotificationAction {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  link?: string;
  actions?: NotificationAction[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  image?: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}