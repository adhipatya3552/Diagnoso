import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Search, User, Check, X, Shield, Clock, Calendar, Share2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface ReportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  onShare: (userIds: string[], expiryDate?: string, permissions?: string[]) => Promise<void>;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export const ReportShareModal: React.FC<ReportShareModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  onShare
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
  const [expiryDate, setExpiryDate] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['view']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Mock users for demo
  const mockUsers: UserData[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'doctor',
      avatar: 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@example.com',
      role: 'doctor',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      role: 'doctor',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];
  
  // Filter users based on search term
  const filteredUsers = debouncedSearchTerm
    ? mockUsers.filter(user => 
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    : mockUsers;
  
  const toggleUserSelection = (user: UserData) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };
  
  const togglePermission = (permission: string) => {
    setPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };
  
  const handleShare = async () => {
    if (selectedUsers.length === 0) return;
    
    setLoading(true);
    try {
      await onShare(
        selectedUsers.map(u => u.id),
        expiryDate || undefined,
        permissions
      );
      
      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sharing report:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setSearchTerm('');
    setSelectedUsers([]);
    setExpiryDate('');
    setPermissions(['view']);
    setSuccess(false);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Share Medical Report"
      size="md"
    >
      <div className="space-y-6">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Report Shared Successfully!</h3>
            <p className="text-gray-600">
              The report has been shared with {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Sharing "{reportTitle}"</h4>
                  <p className="text-sm text-blue-700">
                    Share this medical report with healthcare providers. They will receive a notification and secure access to view the report.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for healthcare providers
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            
            {/* User List */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Select recipients
              </h4>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${
                        selectedUsers.some(u => u.id === user.id)
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleUserSelection(user)}
                    >
                      <div className="relative flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                          {selectedUsers.some(u => u.id === user.id) ? (
                            <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-full" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                        {user.role}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <User className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p>No users found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Selected recipients ({selectedUsers.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{user.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUserSelection(user);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Sharing Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Expiry (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="No expiration"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  If no date is set, access will not expire
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={permissions.includes('view')}
                        onChange={() => togglePermission('view')}
                        className="sr-only"
                        disabled
                      />
                      <div className="w-5 h-5 rounded border bg-blue-500 border-blue-500" />
                      <Check className="w-3 h-3 text-white absolute" />
                    </div>
                    <span className="text-sm text-gray-700">View (Required)</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={permissions.includes('download')}
                        onChange={() => togglePermission('download')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border transition-colors ${
                        permissions.includes('download') 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`} />
                      {permissions.includes('download') && (
                        <Check className="w-3 h-3 text-white absolute" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">Allow Download</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={permissions.includes('reshare')}
                        onChange={() => togglePermission('reshare')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border transition-colors ${
                        permissions.includes('reshare') 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`} />
                      {permissions.includes('reshare') && (
                        <Check className="w-3 h-3 text-white absolute" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">Allow Resharing</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                icon={Share2}
                loading={loading}
                onClick={handleShare}
                disabled={selectedUsers.length === 0}
              >
                Share Report
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};