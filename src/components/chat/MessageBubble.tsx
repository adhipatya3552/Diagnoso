import React, { useState } from 'react';
import { Message } from '../../lib/chatTypes';
import { Check, CheckCheck, Clock, MoreVertical, Trash2, Copy, Reply, Star } from 'lucide-react';
import { formatMessageTime } from '../../utils/formatters';
import { useChat } from '../../context/ChatContext';
import { FileMessage } from './FileMessage';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isCurrentUser,
  showAvatar = true
}) => {
  const { deleteMessage } = useChat();
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  if (message.is_deleted) {
    return (
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className="bg-gray-500/20 text-white/50 px-4 py-2 rounded-2xl text-sm italic">
          This message was deleted
        </div>
      </div>
    );
  }
  
  const getMessageStatus = () => {
    if (message.read_at) {
      return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
    } else {
      return <Check className="w-3.5 h-3.5 text-white/70" />;
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteMessage(message.id);
      setShowOptions(false);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowOptions(false);
  };
  
  const renderContent = () => {
    switch (message.message_type) {
      case 'image':
      case 'file':
        return <FileMessage message={message} isCurrentUser={isCurrentUser} />;
      
      case 'system':
        return (
          <div className="text-center py-1 px-3 bg-blue-500/20 rounded-full text-xs text-white/80">
            {message.content}
          </div>
        );
      
      default:
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };
  
  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center my-2">
        {renderContent()}
      </div>
    );
  }
  
  return (
    <div 
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2 group`}
      onDoubleClick={() => setShowReactions(true)}
    >
      <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs lg:max-w-md`}>
        {showAvatar && !isCurrentUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold mr-2 flex-shrink-0">
            {message.sender_id.charAt(0)}
          </div>
        )}
        
        <div className="relative">
          <div className={`
            px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300
            ${isCurrentUser 
              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-l-2xl rounded-tr-2xl' 
              : 'bg-white/10 text-white rounded-r-2xl rounded-tl-2xl'
            }
          `}>
            {renderContent()}
            
            <div className={`flex items-center space-x-1 mt-1 text-xs ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <span className="text-white/50">
                {formatMessageTime(message.created_at)}
              </span>
              {isCurrentUser && getMessageStatus()}
            </div>
          </div>
          
          {/* Message reactions */}
          {showReactions && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full shadow-lg p-1 z-10 animate-scale-in">
              <div className="flex space-x-1">
                {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      // Handle reaction
                      setShowReactions(false);
                    }}
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-lg transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Message options */}
          <div 
            className={`absolute ${isCurrentUser ? 'right-0' : 'left-0'} top-0 transform ${isCurrentUser ? 'translate-x-6' : '-translate-x-6'} opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 bg-white/10 backdrop-blur-lg rounded-full hover:bg-white/20 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
            
            {showOptions && (
              <div className={`absolute ${isCurrentUser ? 'right-0' : 'left-0'} mt-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg py-1 w-32 z-10 animate-slide-down`}>
                <button
                  onClick={() => {
                    // Handle reply
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-white/90 hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <Reply className="w-4 h-4 text-white/70" />
                  <span>Reply</span>
                </button>
                
                <button
                  onClick={handleCopy}
                  className="w-full text-left px-3 py-2 text-white/90 hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4 text-white/70" />
                  <span>Copy</span>
                </button>
                
                <button
                  onClick={() => {
                    // Handle star message
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-white/90 hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <Star className="w-4 h-4 text-white/70" />
                  <span>Star</span>
                </button>
                
                {isCurrentUser && (
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 text-white/90 hover:bg-white/10 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {showAvatar && isCurrentUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold ml-2 flex-shrink-0">
            {message.sender_id.charAt(0)}
          </div>
        )}
      </div>
    </div>
  );
};