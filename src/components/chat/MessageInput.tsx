import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, X, Mic } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { FileAttachmentButton } from './FileAttachmentButton';
import { FileUploadHandler } from './FileUploadHandler';

interface MessageInputProps {
  conversationId: string;
  onTyping?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  conversationId,
  onTyping
}) => {
  const { sendMessage, sendFileMessage } = useChat();
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Simulate recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => clearInterval(interval);
  }, [isRecording]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !isRecording) return;
    
    if (isRecording) {
      // Handle voice message
      setIsRecording(false);
      // In a real app, you would upload the audio file
      await sendMessage(conversationId, "Voice message", "file");
      return;
    }
    
    try {
      await sendMessage(conversationId, message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      await sendFileMessage(conversationId, file);
      setShowFileUpload(false);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping?.();
  };
  
  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
      {showFileUpload && (
        <div className="mb-4 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Upload File</h3>
            <button
              onClick={() => setShowFileUpload(false)}
              className="text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <FileUploadHandler
            onFileSelect={handleFileUpload}
            maxSize={20 * 1024 * 1024} // 20MB
            acceptedTypes={[
              'image/*',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'text/plain',
              'application/zip',
              'application/x-rar-compressed'
            ]}
          />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="absolute bottom-full right-0 mb-2 z-10 animate-slide-up"
          >
            <Picker 
              data={data} 
              onEmojiSelect={handleEmojiSelect}
              theme="dark"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        )}
        
        {isRecording ? (
          <div className="flex items-center space-x-2 bg-white/10 rounded-full p-2 border border-white/20">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white">Recording... {formatTime(recordingTime)}</span>
            <button
              type="button"
              onClick={() => setIsRecording(false)}
              className="ml-auto p-2 bg-red-500 rounded-full"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <button
              type="submit"
              className="p-2 bg-green-500 rounded-full"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex items-end space-x-2">
            <FileAttachmentButton 
              onFileSelect={(file) => {
                handleFileUpload(file);
              }}
              disabled={isUploading}
            />
            
            <div className="flex-1 bg-white/10 rounded-full border border-white/20 overflow-hidden">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full bg-transparent text-white placeholder-white/50 px-4 py-3 resize-none focus:outline-none min-h-[44px] max-h-32"
                rows={1}
                disabled={isUploading}
              />
            </div>
            
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <Smile className="w-5 h-5 text-white" />
            </button>
            
            {message.trim() ? (
              <button
                type="submit"
                disabled={!message.trim() || isUploading}
                className={`p-3 rounded-full ${
                  message.trim() && !isUploading
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600'
                    : 'bg-white/10'
                } transition-all duration-300`}
              >
                <Send className={`w-5 h-5 ${
                  message.trim() && !isUploading ? 'text-white' : 'text-white/50'
                }`} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecording(true)}
                className="p-3 rounded-full hover:bg-white/10 transition-colors"
              >
                <Mic className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        )}
      </form>
      
      {isUploading && (
        <div className="mt-2 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          <span className="text-sm text-white/70">Uploading file...</span>
        </div>
      )}
    </div>
  );
};