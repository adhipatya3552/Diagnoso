import { User } from './supabase';

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  file_url?: string;
  file_type?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  read_at?: string;
  is_deleted: boolean;
}

export interface Conversation {
  id: string;
  doctor_id: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
  last_message_preview?: string;
  last_message_at?: string;
  doctor_unread_count: number;
  patient_unread_count: number;
  
  // Populated fields (not from database)
  doctor?: User;
  patient?: User;
  otherUser?: User;
  unreadCount?: number;
}

export interface TypingStatus {
  id: string;
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
}

export interface ChatContextType extends ChatState {
  // Conversation actions
  fetchConversations: () => Promise<void>;
  createConversation: (doctorId: string, patientId: string) => Promise<string>;
  setActiveConversation: (conversationId: string) => void;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  
  // Message actions
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: MessageType) => Promise<void>;
  sendFileMessage: (conversationId: string, file: File) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // Typing status actions
  setTypingStatus: (conversationId: string, isTyping: boolean) => Promise<void>;
  
  // Connection status
  isConnected: boolean;
  reconnect: () => void;
}