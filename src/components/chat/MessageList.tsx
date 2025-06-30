import React, { useEffect, useRef } from 'react';
import { Message } from '../../lib/chatTypes';
import { MessageBubble } from './MessageBubble';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Search } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/70">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-white/50" />
        </div>
        <p className="text-lg font-medium mb-2">No messages yet</p>
        <p className="text-sm">Start the conversation by sending a message</p>
      </div>
    );
  }
  
  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  
  messages.forEach(message => {
    const date = new Date(message.created_at).toDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">
              {formatDate(date)}
            </div>
          </div>
          
          <div className="space-y-1">
            {dateMessages.map((message, index) => {
              const prevMessage = index > 0 ? dateMessages[index - 1] : null;
              const nextMessage = index < dateMessages.length - 1 ? dateMessages[index + 1] : null;
              
              // Show avatar only for the first message in a sequence from the same sender
              const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
              
              // Add more space between messages from different senders or if there's a time gap
              const timeGap = prevMessage && 
                (new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000);
              
              const className = timeGap ? 'mt-4' : '';
              
              return (
                <div key={message.id} className={className}>
                  <MessageBubble
                    message={message}
                    isCurrentUser={message.sender_id === currentUserId}
                    showAvatar={showAvatar}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};