import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Phone, Video, Search, Info, FileText } from 'lucide-react';
import { Conversation } from '../../lib/chatTypes';
import { useAuth } from '../../hooks/useAuth';
import { TypingIndicator } from './TypingIndicator';
import { formatDistanceToNow } from 'date-fns';
import { FileGallery } from './FileGallery';
import { useChat } from '../../context/ChatContext';

interface ChatHeaderProps {
  conversation: Conversation;
  typingUserIds: string[];
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  conversation, 
  typingUserIds,
  onBack 
}) => {
  const { user } = useAuth();
  const { messages } = useChat();
  const [showOptions, setShowOptions] = useState(false);
  const [showFileGallery, setShowFileGallery] = useState(false);
  
  if (!conversation || !user) return null;
  
  const otherUser = conversation.otherUser;
  const isTyping = typingUserIds.length > 0;
  const conversationMessages = messages[conversation.id] || [];
  
  return (
    <>
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          
          <div className="relative">
            {otherUser?.profile_photo_url ? (
              <img 
                src={otherUser.profile_photo_url} 
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/20 hover:border-white/40 transition-colors"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold">
                {otherUser?.name?.charAt(0) || '?'}
              </div>
            )}
            
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
              true ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
          </div>
          
          <div>
            <h3 className="font-medium text-white">{otherUser?.name}</h3>
            {isTyping ? (
              <TypingIndicator />
            ) : (
              <div className="flex items-center">
                <span className="text-xs text-white/70 capitalize">
                  {otherUser?.role} • last seen {formatDistanceToNow(new Date(), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Search className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Phone className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Video className="w-5 h-5 text-white" />
          </button>
          <div className="relative">
            <button 
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setShowOptions(!showOptions)}
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-lg py-1 z-50 animate-slide-down">
                <button 
                  className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                  onClick={() => {
                    setShowFileGallery(true);
                    setShowOptions(false);
                  }}
                >
                  <FileText className="w-4 h-4" />
                  <span>Shared Files</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Search Messages</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>Video Call</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Voice Call</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                  <Info className="w-4 h-4" />
                  <span>Contact Info</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showFileGallery && (
        <FileGallery 
          conversationId={conversation.id}
          messages={conversationMessages}
          onClose={() => setShowFileGallery(false)}
        />
      )}
    </>
  );
};