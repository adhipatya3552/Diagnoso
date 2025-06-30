import React, { useState } from 'react';
import { ChatProvider } from '../context/ChatContext';
import { ChatLayout } from '../components/chat/ChatLayout';
import { NewConversationModal } from '../components/chat/NewConversationModal';

export const ChatPage: React.FC = () => {
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)]">
        <ChatProvider>
          <ChatLayout 
            onNewConversation={() => setShowNewConversationModal(true)}
          />
          <NewConversationModal 
            isOpen={showNewConversationModal}
            onClose={() => setShowNewConversationModal(false)}
          />
        </ChatProvider>
      </div>
    </div>
  );
};