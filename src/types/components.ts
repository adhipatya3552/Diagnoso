import { DivideIcon as LucideIcon } from 'lucide-react';

// Base component interfaces
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: number | string;
  disabled?: boolean;
  children?: NavigationItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'doctor' | 'patient' | 'admin';
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
  options?: Array<{ value: string; label: string }>;
  multiple?: boolean;
  accept?: string;
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableData {
  [key: string]: any;
}

// Medical types
export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  type: 'consultation' | 'lab_result' | 'imaging' | 'prescription' | 'note';
  title: string;
  content: string;
  date: string;
  attachments?: string[];
  status: 'draft' | 'final' | 'amended';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  duration: number;
  type: 'video' | 'in_person' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
}

export interface HealthMetric {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  normalRange?: {
    min: number;
    max: number;
  };
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

// Chat types
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  replyTo?: string;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

// File upload types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Animation types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface TransitionConfig {
  enter: AnimationConfig;
  exit: AnimationConfig;
}

// Accessibility types
export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  role?: string;
  tabIndex?: number;
}