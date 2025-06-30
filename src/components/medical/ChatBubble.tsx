import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, File, Image, Mic } from 'lucide-react';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'doctor' | 'system';
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  type?: 'text' | 'image' | 'file' | 'audio';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  replyTo?: string;
}

export interface ChatBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onRetry?: (messageId: string) => void;
  onFileClick?: (fileUrl: string, fileName: string) => void;
  className?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  showAvatar = true,
  showTimestamp = true,
  onRetry,
  onFileClick,
  className = ''
}) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400 animate-pulse" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getFileIcon = () => {
    switch (message.type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'audio':
        return <Mic className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  if (isSystem) {
    return (
      <div className={`flex justify-center my-4 ${className}`}>
        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>
        {showAvatar && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser ? 'bg-blue-500 ml-2' : 'bg-gray-300 mr-2'
          }`}>
            <span className="text-white text-sm font-medium">
              {isUser ? 'U' : 'D'}
            </span>
          </div>
        )}
        
        <div className={`relative group ${isUser ? 'mr-2' : 'ml-2'}`}>
          <div
            className={`
              px-4 py-2 rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-md
              ${isUser 
                ? 'bg-blue-500 text-white rounded-br-sm' 
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
              }
              ${message.status === 'failed' ? 'border-red-300 bg-red-50' : ''}
            `}
          >
            {message.type === 'text' ? (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            ) : message.type === 'image' ? (
              <div className="space-y-2">
                <img
                  src={message.fileUrl}
                  alt={message.fileName}
                  className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => message.fileUrl && onFileClick?.(message.fileUrl, message.fileName || 'Image')}
                />
                {message.content && (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            ) : message.type === 'audio' ? (
              <div className="flex items-center space-x-3 min-w-48">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full">
                      <div className="w-1/3 h-1 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-500">0:15</span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => message.fileUrl && onFileClick?.(message.fileUrl, message.fileName || 'File')}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getFileIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.fileName}</p>
                  {message.fileSize && (
                    <p className="text-xs text-gray-500">{message.fileSize}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Message status and timestamp */}
          <div className={`flex items-center space-x-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {showTimestamp && (
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {isUser && getStatusIcon()}
            {message.status === 'failed' && onRetry && (
              <button
                onClick={() => onRetry(message.id)}
                className="text-xs text-red-500 hover:text-red-700 underline ml-2"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};