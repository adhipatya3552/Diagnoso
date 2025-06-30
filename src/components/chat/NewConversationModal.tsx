import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Search, User, X, UserCheck, Filter, Users, Star, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../context/ChatContext';
import { User as UserType } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { useDebounce } from '../../hooks/useDebounce';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();
  const { createConversation, setActiveConversation } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'doctor' | 'patient'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'recent'>('name');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    if (isOpen && debouncedSearchTerm.length >= 2) {
      searchUsers();
    } else if (isOpen) {
      // Load recent contacts when modal opens
      loadRecentContacts();
    }
  }, [debouncedSearchTerm, isOpen, filterRole]);
  
  const loadRecentContacts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get users from recent conversations
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          doctor:doctor_id(id, name, email, profile_photo_url, role),
          patient:patient_id(id, name, email, profile_photo_url, role)
        `)
        .or(`doctor_id.eq.${user.id},patient_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (convError) throw convError;
      
      // Extract unique users
      const uniqueUsers: UserType[] = [];
      const userIds = new Set<string>();
      
      convData.forEach(conv => {
        const otherUser = conv.doctor_id === user.id ? conv.patient : conv.doctor;
        if (otherUser && !userIds.has(otherUser.id)) {
          userIds.add(otherUser.id);
          uniqueUsers.push(otherUser);
        }
      });
      
      // Apply role filter if needed
      const filteredUsers = filterRole === 'all' 
        ? uniqueUsers 
        : uniqueUsers.filter(u => u.role === filterRole);
      
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error loading recent contacts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const searchUsers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Base query
      let query = supabase
        .from('users')
        .select('*')
        .neq('id', user.id)
        .ilike('name', `%${debouncedSearchTerm}%`);
      
      // Apply role filter if not "all"
      if (filterRole !== 'all') {
        query = query.eq('role', filterRole);
      }
      
      const { data, error } = await query.limit(10);
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartConversation = async () => {
    if (!user || !selectedUser) return;
    
    try {
      const doctorId = user.role === 'doctor' ? user.id : selectedUser.id;
      const patientId = user.role === 'patient' ? user.id : selectedUser.id;
      
      const conversationId = await createConversation(doctorId, patientId);
      setActiveConversation(conversationId);
      onClose();
    } catch (err) {
      console.error('Error creating conversation:', err);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Conversation"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
              searchTerm ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-500' 
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 animate-slide-down">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-800">Filters</h4>
              <button
                onClick={() => setShowFilters(false)}
                className="text-blue-500 hover:text-blue-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-blue-700 mb-1 block">Role</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterRole('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterRole === 'all' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <Users className="w-4 h-4 mx-auto mb-1" />
                    <span>All</span>
                  </button>
                  <button
                    onClick={() => setFilterRole('doctor')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterRole === 'doctor' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <User className="w-4 h-4 mx-auto mb-1" />
                    <span>Doctors</span>
                  </button>
                  <button
                    onClick={() => setFilterRole('patient')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterRole === 'patient' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <User className="w-4 h-4 mx-auto mb-1" />
                    <span>Patients</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-blue-700 mb-1 block">Sort by</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSortBy('name')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === 'name' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <Star className="w-4 h-4 mx-auto mb-1" />
                    <span>Name</span>
                  </button>
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === 'recent' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    <span>Recent</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {users.length > 0 ? (
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all hover:shadow-md
                      ${selectedUser?.id === user.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                      }
                    `}
                  >
                    <div className="relative">
                      {user.profile_photo_url ? (
                        <img 
                          src={user.profile_photo_url} 
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      
                      <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 text-xs rounded-full border border-white capitalize
                        ${user.role === 'doctor' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-teal-100 text-teal-800'
                        }
                      `}>
                        {user.role}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    
                    {selectedUser?.id === user.id && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-scale-in">
                        <UserCheck className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No users found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>Search for users to start a conversation</p>
                <p className="text-sm">Enter at least 2 characters</p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <Button
            variant="primary"
            disabled={!selectedUser}
            onClick={handleStartConversation}
          >
            Start Conversation
          </Button>
        </div>
      </div>
    </Modal>
  );
};