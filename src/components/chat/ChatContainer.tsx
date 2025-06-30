import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { ConnectionStatus } from './ConnectionStatus';
import { EmptyConversation } from './EmptyConversation';
import { LoadingSpinner } from '../LoadingSpinner';
import { ChevronDown } from 'lucide-react';

interface ChatContainerProps {
  conversationId: string;
  className?: string;
  onBack?: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  conversationId,
  className = '',
  onBack
}) => {
  const { 
    messages, 
    fetchMessages, 
    isLoading, 
    conversations,
    markConversationAsRead,
    setTypingStatus,
    typingUsers
  } = useChat();
  const { user } = useAuth();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [debouncedTyping, setDebouncedTyping] = useState(false);
  
  const conversation = conversations.find(c => c.id === conversationId);
  const conversationMessages = messages[conversationId] || [];
  const typingUserIds = typingUsers[conversationId] || [];
  
  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      markConversationAsRead(conversationId);
    }
  }, [conversationId]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (conversationMessages.length > 0 && isAtBottom) {
      scrollToBottom();
    } else if (conversationMessages.length > 0 && !isAtBottom) {
      setHasNewMessages(true);
    }
  }, [conversationMessages.length]);
  
  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(isBottom);
      
      if (isBottom && hasNewMessages) {
        setHasNewMessages(false);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNewMessages]);
  
  // Handle typing status
  useEffect(() => {
    if (!conversationId) return;
    
    let typingTimeout: NodeJS.Timeout;
    
    if (debouncedTyping) {
      setTypingStatus(conversationId, true);
      
      typingTimeout = setTimeout(() => {
        setDebouncedTyping(false);
        setTypingStatus(conversationId, false);
      }, 3000);
    }
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      if (debouncedTyping) setTypingStatus(conversationId, false);
    };
  }, [debouncedTyping, conversationId]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleTyping = () => {
    setDebouncedTyping(true);
  };
  
  if (!conversationId) {
    return (
      <div className={`flex flex-col h-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl ${className}`}>
        <EmptyConversation />
      </div>
    );
  }
  
  if (isLoading && conversationMessages.length === 0) {
    return (
      <div className={`flex flex-col h-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl ${className}`}>
      <ConnectionStatus />
      
      {conversation && (
        <ChatHeader 
          conversation={conversation}
          typingUserIds={typingUserIds}
          onBack={onBack}
        />
      )}
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent bg-gradient-to-b from-transparent to-black/20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <MessageList 
          messages={conversationMessages} 
          currentUserId={user?.id || ''}
        />
        <div ref={messagesEndRef} />
      </div>
      
      {hasNewMessages && !isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 animate-bounce"
        >
          <ChevronDown className="w-4 h-4" />
          <span>New messages</span>
        </button>
      )}
      
      <MessageInput 
        conversationId={conversationId}
        onTyping={handleTyping}
      />
    </div>
  );
};