import React, { useState, useEffect } from 'react';
import { ConversationList } from './ConversationList';
import { ChatContainer } from './ChatContainer';
import { useChat } from '../../context/ChatContext';
import { Menu, X, Search, ArrowLeft } from 'lucide-react';
import { EmptyConversation } from './EmptyConversation';

interface ChatLayoutProps {
  className?: string;
  onNewConversation?: () => void;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ 
  className = '',
  onNewConversation
}) => {
  const { setActiveConversation, activeConversationId, conversations } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Close sidebar on mobile when conversation is selected
  useEffect(() => {
    if (isMobile && activeConversationId) {
      setSidebarOpen(false);
    }
  }, [activeConversationId, isMobile]);
  
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
  };
  
  const handleBackToList = () => {
    setSidebarOpen(true);
  };
  
  return (
    <div className={`flex h-full rounded-3xl overflow-hidden shadow-2xl ${className}`}>
      {/* Sidebar */}
      <div className={`
        w-full md:w-96 bg-white/5 backdrop-blur-xl border-r border-white/10
        ${isMobile ? 'absolute inset-0 z-40' : 'relative'}
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Messages</h2>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <ConversationList 
              onSelectConversation={handleSelectConversation}
              onNewConversation={onNewConversation}
            />
          </div>
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 relative">
        {/* Mobile menu button */}
        {isMobile && activeConversationId && !sidebarOpen && (
          <button
            onClick={handleBackToList}
            className="absolute top-4 left-4 z-10 p-2 bg-white/10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        )}
        
        {activeConversationId ? (
          <ChatContainer 
            conversationId={activeConversationId}
            onBack={isMobile ? handleBackToList : undefined}
          />
        ) : (
          <div className="h-full bg-white/5 backdrop-blur-xl flex items-center justify-center">
            <EmptyConversation />
          </div>
        )}
      </div>
    </div>
  );
};