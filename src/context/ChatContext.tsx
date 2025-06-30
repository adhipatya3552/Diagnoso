import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  ChatContextType, 
  ChatState, 
  Conversation, 
  Message, 
  MessageType 
} from '../lib/chatTypes';
import { useToast } from '../hooks/useToast';
import { RealtimeChannel } from '@supabase/supabase-js';

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},
  isLoading: false,
  error: null
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const [state, setState] = useState<ChatState>(initialState);
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<Record<string, RealtimeChannel>>({});

  // Initialize and cleanup Supabase realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Set up connection status listener
    const connectionStatus = supabase.realtime.onConnectionStateChange(event => {
      setIsConnected(event === 'OPEN');
    });

    // Subscribe to conversations
    const conversationsChannel = supabase.channel('conversations-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `doctor_id=eq.${user.id}`,
      }, payload => {
        fetchConversations();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `patient_id=eq.${user.id}`,
      }, payload => {
        fetchConversations();
      })
      .subscribe();

    // Initial data fetch
    fetchConversations();

    return () => {
      // Clean up subscriptions
      conversationsChannel.unsubscribe();
      
      // Clean up all message channels
      Object.values(channels).forEach(channel => {
        channel.unsubscribe();
      });
      
      // Clean up connection listener
      connectionStatus.unsubscribe();
    };
  }, [user]);

  // Subscribe to messages when active conversation changes
  useEffect(() => {
    if (!user || !state.activeConversationId) return;

    // Subscribe to messages for the active conversation
    subscribeToConversation(state.activeConversationId);
    
    // Mark conversation as read when it becomes active
    markConversationAsRead(state.activeConversationId);
    
    // Fetch messages for the active conversation
    fetchMessages(state.activeConversationId);

    return () => {
      // No need to unsubscribe here as we keep all channels active
      // They will be cleaned up when the component unmounts
    };
  }, [user, state.activeConversationId]);

  const subscribeToConversation = (conversationId: string) => {
    // If we already have a channel for this conversation, don't create another one
    if (channels[conversationId]) return;

    // Subscribe to messages
    const messagesChannel = supabase.channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, payload => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message;
          setState(prev => ({
            ...prev,
            messages: {
              ...prev.messages,
              [conversationId]: [
                ...(prev.messages[conversationId] || []),
                newMessage
              ].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
            }
          }));

          // If the message is from the other user and the conversation is active, mark it as read
          if (newMessage.sender_id !== user?.id && state.activeConversationId === conversationId) {
            markMessageAsRead(newMessage.id);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedMessage = payload.new as Message;
          setState(prev => ({
            ...prev,
            messages: {
              ...prev.messages,
              [conversationId]: (prev.messages[conversationId] || []).map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            }
          }));
        } else if (payload.eventType === 'DELETE') {
          const deletedMessageId = payload.old.id;
          setState(prev => ({
            ...prev,
            messages: {
              ...prev.messages,
              [conversationId]: (prev.messages[conversationId] || []).filter(msg => 
                msg.id !== deletedMessageId
              )
            }
          }));
        }
      })
      .subscribe();

    // Subscribe to typing status
    const typingChannel = supabase.channel(`typing-${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_status',
        filter: `conversation_id=eq.${conversationId}`,
      }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const typingStatus = payload.new as { user_id: string; is_typing: boolean };
          
          if (typingStatus.user_id !== user?.id) {
            setState(prev => {
              const currentTypingUsers = [...(prev.typingUsers[conversationId] || [])];
              
              if (typingStatus.is_typing && !currentTypingUsers.includes(typingStatus.user_id)) {
                return {
                  ...prev,
                  typingUsers: {
                    ...prev.typingUsers,
                    [conversationId]: [...currentTypingUsers, typingStatus.user_id]
                  }
                };
              } else if (!typingStatus.is_typing) {
                return {
                  ...prev,
                  typingUsers: {
                    ...prev.typingUsers,
                    [conversationId]: currentTypingUsers.filter(id => id !== typingStatus.user_id)
                  }
                };
              }
              
              return prev;
            });
          }
        }
      })
      .subscribe();

    // Store the channels for later cleanup
    setChannels(prev => ({
      ...prev,
      [conversationId]: messagesChannel
    }));
  };

  const fetchConversations = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch conversations where the user is either doctor or patient
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          doctor:doctor_id(id, name, email, profile_photo_url, role),
          patient:patient_id(id, name, email, profile_photo_url, role)
        `)
        .or(`doctor_id.eq.${user.id},patient_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process conversations to add derived fields
      const processedConversations = data.map(conv => {
        const isDoctor = user.id === conv.doctor_id;
        const otherUser = isDoctor ? conv.patient : conv.doctor;
        const unreadCount = isDoctor ? conv.doctor_unread_count : conv.patient_unread_count;

        return {
          ...conv,
          otherUser,
          unreadCount
        };
      });

      setState(prev => ({ 
        ...prev, 
        conversations: processedConversations,
        isLoading: false 
      }));

      // Subscribe to all conversations for real-time updates
      processedConversations.forEach(conv => {
        subscribeToConversation(conv.id);
      });
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || 'Failed to fetch conversations' 
      }));
      showError('Failed to load conversations');
    }
  };

  const createConversation = async (doctorId: string, patientId: string) => {
    if (!user) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if conversation already exists
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .match({ doctor_id: doctorId, patient_id: patientId })
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // If conversation exists, return its ID
      if (existingConv) {
        setState(prev => ({ ...prev, isLoading: false }));
        return existingConv.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          doctor_id: doctorId,
          patient_id: patientId
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch conversations to update the list
      await fetchConversations();

      setState(prev => ({ ...prev, isLoading: false }));
      return data.id;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || 'Failed to create conversation' 
      }));
      showError('Failed to create conversation');
      throw err;
    }
  };

  const setActiveConversation = (conversationId: string) => {
    setState(prev => ({ ...prev, activeConversationId: conversationId }));
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      const isDoctor = user.role === 'doctor';
      
      // Update the conversation unread count
      await supabase
        .from('conversations')
        .update({
          doctor_unread_count: isDoctor ? 0 : undefined,
          patient_unread_count: !isDoctor ? 0 : undefined
        })
        .eq('id', conversationId);

      // Mark all unread messages as read
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .is('read_at', null)
        .neq('sender_id', user.id);

      if (messages && messages.length > 0) {
        const messageIds = messages.map(msg => msg.id);
        
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', messageIds);
      }

      // Update local state
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      }));
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .neq('sender_id', user.id);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user || !conversationId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState(prev => ({ 
        ...prev, 
        messages: {
          ...prev.messages,
          [conversationId]: data
        },
        isLoading: false 
      }));
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || 'Failed to fetch messages' 
      }));
      showError('Failed to load messages');
    }
  };

  const sendMessage = async (conversationId: string, content: string, type: MessageType = 'text') => {
    if (!user || !conversationId || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: type
        })
        .select()
        .single();

      if (error) throw error;

      // Clear typing status after sending a message
      await setTypingStatus(conversationId, false);

      return data;
    } catch (err: any) {
      console.error('Error sending message:', err);
      showError('Failed to send message');
      throw err;
    }
  };

  const sendFileMessage = async (conversationId: string, file: File) => {
    if (!user || !conversationId || !file) return;

    try {
      // Determine message type based on file type
      const isImage = file.type.startsWith('image/');
      const messageType: MessageType = isImage ? 'image' : 'file';
      
      // Upload file to Supabase Storage
      const filePath = `${conversationId}/${user.id}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      // Create message with file information
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: isImage ? 'Sent an image' : `Sent a file: ${file.name}`,
          message_type: messageType,
          file_url: publicUrl,
          file_type: file.type,
          file_name: file.name,
          file_size: file.size
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err: any) {
      console.error('Error sending file message:', err);
      showError('Failed to send file');
      throw err;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      // Soft delete - update is_deleted flag
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Only allow deleting own messages

      if (error) throw error;
    } catch (err: any) {
      console.error('Error deleting message:', err);
      showError('Failed to delete message');
      throw err;
    }
  };

  const setTypingStatus = async (conversationId: string, isTyping: boolean) => {
    if (!user || !conversationId) return;

    try {
      const { error } = await supabase
        .from('typing_status')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: isTyping,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'conversation_id,user_id'
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error updating typing status:', err);
    }
  };

  const reconnect = () => {
    supabase.realtime.connect();
  };

  const contextValue: ChatContextType = {
    ...state,
    fetchConversations,
    createConversation,
    setActiveConversation,
    markConversationAsRead,
    fetchMessages,
    sendMessage,
    sendFileMessage,
    deleteMessage,
    setTypingStatus,
    isConnected,
    reconnect
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};