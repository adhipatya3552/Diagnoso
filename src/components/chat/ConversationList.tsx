import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Search, Plus, Users, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { useDebounce } from '../../hooks/useDebounce';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  onNewConversation?: () => void;
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({ 
  onSelectConversation,
  onNewConversation,
  className = ''
}) => {
  const { conversations, activeConversationId, isLoading } = useChat();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'unread' | 'name'>('recent');
  const [filterRole, setFilterRole] = useState<'all' | 'doctor' | 'patient'>('all');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Filter and sort conversations
  const processedConversations = React.useMemo(() => {
    let result = [...conversations];
    
    // Apply search filter
    if (debouncedSearchTerm) {
      result = result.filter(conv => 
        conv.otherUser?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (conv.last_message_preview?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }
    
    // Apply role filter
    if (filterRole !== 'all') {
      result = result.filter(conv => conv.otherUser?.role === filterRole);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => {
          if (!a.last_message_at) return 1;
          if (!b.last_message_at) return -1;
          return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
        });
        break;
      case 'unread':
        result.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0));
        break;
      case 'name':
        result.sort((a, b) => {
          const nameA = a.otherUser?.name || '';
          const nameB = b.otherUser?.name || '';
          return nameA.localeCompare(nameB);
        });
        break;
    }
    
    return result;
  }, [conversations, debouncedSearchTerm, sortBy, filterRole]);
  
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="relative">
          <LoadingSkeleton variant="rectangular" height="40px" className="rounded-full" />
        </div>
        
        {Array.from({ length: 5 }).map((_, i) => (
          <LoadingSkeleton key={i} variant="rectangular" height="80px" className="rounded-xl" />
        ))}
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
          searchTerm ? 'text-blue-400' : 'text-white/50'
        }`} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search conversations..."
          className="w-full bg-white/10 border border-white/20 rounded-full py-2.5 pl-10 pr-10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
            searchTerm ? 'hidden' : 'block'
          } text-white/50 hover:text-white/80 transition-colors`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-white/10 rounded-xl p-3 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/70 mb-1 block">Sort by</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === 'recent' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setSortBy('unread')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === 'unread' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === 'name' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Name
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-white/70 mb-1 block">Filter by role</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterRole('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterRole === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterRole('doctor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterRole === 'doctor' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Doctors
                </button>
                <button
                  onClick={() => setFilterRole('patient')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterRole === 'patient' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Patients
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {onNewConversation && (
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          <span>New Conversation</span>
        </button>
      )}
      
      <div className="space-y-2">
        {processedConversations.length > 0 ? (
          processedConversations.map(conversation => {
            const otherUser = conversation.otherUser;
            const isActive = activeConversationId === conversation.id;
            
            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600/70 to-teal-600/70 shadow-lg' 
                    : 'hover:bg-white/10'
                }`}
              >
                <div className="relative">
                  {otherUser?.profile_photo_url ? (
                    <img 
                      src={otherUser.profile_photo_url} 
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold">
                      {otherUser?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    true ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-white truncate">{otherUser?.name}</h3>
                    <span className="text-xs text-white/60">
                      {conversation.last_message_at 
                        ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })
                        : 'New'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-white/70 truncate">
                      {conversation.last_message_preview || 'Start a conversation'}
                    </p>
                    
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center px-1.5 animate-pulse">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-white/70">
            <Users className="w-12 h-12 mx-auto mb-3 text-white/40" />
            <p>No conversations found</p>
            {searchTerm && (
              <p className="text-sm mt-1">Try a different search term</p>
            )}
            {!searchTerm && onNewConversation && (
              <button
                onClick={onNewConversation}
                className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Start a new conversation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};