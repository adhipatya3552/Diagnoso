import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, User, Check, X, AlertCircle, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useNotifications } from '../../hooks/useNotifications';

interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  requestedDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'waiting' | 'notified' | 'booked' | 'expired';
  notes?: string;
  createdAt: Date;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  preferredDays?: string[];
  notifiedAt?: Date;
}

interface WaitlistManagerProps {
  doctorId?: string;
  onAssignSlot?: (waitlistEntry: WaitlistEntry, slot: { date: Date; time: string }) => void;
  className?: string;
}

export const WaitlistManager: React.FC<WaitlistManagerProps> = ({
  doctorId,
  onAssignSlot,
  className = ''
}) => {
  const { addNotification } = useNotifications();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [filteredWaitlist, setFilteredWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'notified' | 'booked' | 'expired'>('waiting');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  
  // Mock data for waitlist
  useEffect(() => {
    const fetchWaitlist = async () => {
      setLoading(true);
      
      // In a real app, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('waitlist')
      //   .select('*')
      //   .eq('doctor_id', doctorId)
      //   .order('priority', { ascending: false })
      //   .order('created_at', { ascending: true });
      
      // For demo, use mock data
      const mockWaitlist: WaitlistEntry[] = [
        {
          id: '1',
          patientId: 'patient1',
          patientName: 'John Smith',
          patientEmail: 'john.smith@example.com',
          patientPhone: '(555) 123-4567',
          doctorId: 'doctor1',
          doctorName: 'Dr. Sarah Johnson',
          priority: 'high',
          status: 'waiting',
          notes: 'Patient has chronic condition requiring prompt follow-up',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          preferredTimeOfDay: 'morning',
          preferredDays: ['monday', 'wednesday', 'friday']
        },
        {
          id: '2',
          patientId: 'patient2',
          patientName: 'Maria Garcia',
          patientEmail: 'maria.garcia@example.com',
          patientPhone: '(555) 987-6543',
          doctorId: 'doctor1',
          doctorName: 'Dr. Sarah Johnson',
          priority: 'medium',
          status: 'waiting',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
          preferredTimeOfDay: 'afternoon'
        },
        {
          id: '3',
          patientId: 'patient3',
          patientName: 'David Wilson',
          patientEmail: 'david.wilson@example.com',
          patientPhone: '(555) 456-7890',
          doctorId: 'doctor1',
          doctorName: 'Dr. Sarah Johnson',
          requestedDate: addDays(new Date(), 7),
          priority: 'low',
          status: 'waiting',
          notes: 'Prefers appointment after work hours',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          preferredTimeOfDay: 'evening',
          preferredDays: ['tuesday', 'thursday']
        },
        {
          id: '4',
          patientId: 'patient4',
          patientName: 'Emily Johnson',
          patientEmail: 'emily.johnson@example.com',
          patientPhone: '(555) 789-0123',
          doctorId: 'doctor1',
          doctorName: 'Dr. Sarah Johnson',
          priority: 'urgent',
          status: 'notified',
          notes: 'Patient needs immediate follow-up for abnormal test results',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
          notifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        }
      ];
      
      setWaitlist(mockWaitlist);
      setFilteredWaitlist(mockWaitlist.filter(entry => entry.status === 'waiting'));
      setLoading(false);
    };
    
    fetchWaitlist();
  }, [doctorId]);
  
  // Filter waitlist based on search term, priority, and status
  useEffect(() => {
    let filtered = [...waitlist];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.patientPhone?.includes(searchTerm)
      );
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(entry => entry.priority === priorityFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }
    
    setFilteredWaitlist(filtered);
  }, [waitlist, searchTerm, priorityFilter, statusFilter]);
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'notified':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'booked':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Handle priority change
  const handlePriorityChange = (entryId: string, newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    // In a real app, update in Supabase
    // const { data, error } = await supabase
    //   .from('waitlist')
    //   .update({ priority: newPriority })
    //   .eq('id', entryId)
    //   .select();
    
    // For demo, update local state
    setWaitlist(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, priority: newPriority } 
          : entry
      )
    );
  };
  
  // Handle notify patient
  const handleNotifyPatient = (entry: WaitlistEntry) => {
    // In a real app, send notification to patient
    // and update waitlist entry status
    
    // For demo, update local state and show notification
    setWaitlist(prev => 
      prev.map(e => 
        e.id === entry.id 
          ? { ...e, status: 'notified', notifiedAt: new Date() } 
          : e
      )
    );
    
    // Add notification
    addNotification({
      title: 'Waitlist Notification Sent',
      message: `${entry.patientName} has been notified about an available appointment slot.`,
      type: 'system',
      priority: 'normal'
    });
  };
  
  // Handle assign slot
  const handleAssignSlot = () => {
    if (!selectedEntry || !selectedSlot) return;
    
    // In a real app, update waitlist entry and create appointment
    
    // For demo, update local state
    setWaitlist(prev => 
      prev.map(entry => 
        entry.id === selectedEntry.id 
          ? { ...entry, status: 'booked' } 
          : entry
      )
    );
    
    // Call parent handler
    if (onAssignSlot) {
      onAssignSlot(selectedEntry, selectedSlot);
    }
    
    // Add notification
    addNotification({
      title: 'Appointment Scheduled from Waitlist',
      message: `An appointment has been scheduled for ${selectedEntry.patientName} on ${format(selectedSlot.date, 'MMMM d')} at ${selectedSlot.time}.`,
      type: 'appointment',
      priority: 'normal'
    });
    
    // Close modal
    setShowAssignModal(false);
    setSelectedEntry(null);
    setSelectedSlot(null);
  };
  
  // Generate available slots
  const generateAvailableSlots = () => {
    const slots = [];
    const startDate = new Date();
    
    // Generate slots for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = addDays(startDate, i);
      
      // Skip weekends for this example
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Add morning slots
      slots.push({ date, time: '9:00 AM' });
      slots.push({ date, time: '10:00 AM' });
      slots.push({ date, time: '11:00 AM' });
      
      // Add afternoon slots
      slots.push({ date, time: '1:00 PM' });
      slots.push({ date, time: '2:00 PM' });
      slots.push({ date, time: '3:00 PM' });
      slots.push({ date, time: '4:00 PM' });
    }
    
    return slots;
  };
  
  const availableSlots = generateAvailableSlots();
  
  // Filter slots based on patient preferences
  const getFilteredSlots = () => {
    if (!selectedEntry) return availableSlots;
    
    return availableSlots.filter(slot => {
      // Filter by preferred days
      if (selectedEntry.preferredDays && selectedEntry.preferredDays.length > 0) {
        const dayName = format(slot.date, 'EEEE').toLowerCase();
        if (!selectedEntry.preferredDays.includes(dayName)) {
          return false;
        }
      }
      
      // Filter by preferred time of day
      if (selectedEntry.preferredTimeOfDay) {
        const hour = parseInt(slot.time.split(':')[0]);
        const isPM = slot.time.includes('PM');
        const adjustedHour = isPM && hour !== 12 ? hour + 12 : hour;
        
        switch (selectedEntry.preferredTimeOfDay) {
          case 'morning':
            return adjustedHour < 12;
          case 'afternoon':
            return adjustedHour >= 12 && adjustedHour < 17;
          case 'evening':
            return adjustedHour >= 17;
          default:
            return true;
        }
      }
      
      return true;
    });
  };
  
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Users className="w-6 h-6 text-blue-500 mr-2" />
          Appointment Waitlist
        </h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {filteredWaitlist.length} patient{filteredWaitlist.length !== 1 ? 's' : ''} waiting
          </span>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Status</option>
          <option value="waiting">Waiting</option>
          <option value="notified">Notified</option>
          <option value="booked">Booked</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      
      {/* Waitlist */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredWaitlist.length > 0 ? (
        <div className="space-y-4">
          {filteredWaitlist.map((entry) => (
            <div 
              key={entry.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800">{entry.patientName}</h3>
                    
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(entry.priority)}`}>
                        {entry.priority.charAt(0).toUpperCase() + entry.priority.slice(1)} Priority
                      </span>
                      
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {entry.patientEmail && (
                        <p>{entry.patientEmail}</p>
                      )}
                      
                      {entry.patientPhone && (
                        <p>{entry.patientPhone}</p>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Waiting since {format(new Date(entry.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      
                      {entry.requestedDate && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Requested date: {format(new Date(entry.requestedDate), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      
                      {entry.preferredTimeOfDay && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>Prefers: {entry.preferredTimeOfDay.charAt(0).toUpperCase() + entry.preferredTimeOfDay.slice(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    {entry.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                        <p>{entry.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  {entry.status === 'waiting' && (
                    <>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handlePriorityChange(entry.id, 'urgent')}
                          className={`p-1 rounded ${entry.priority === 'urgent' ? 'bg-red-100' : 'hover:bg-gray-100'}`}
                          title="Urgent"
                        >
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        </button>
                        <button
                          onClick={() => handlePriorityChange(entry.id, 'high')}
                          className={`p-1 rounded ${entry.priority === 'high' ? 'bg-orange-100' : 'hover:bg-gray-100'}`}
                          title="High"
                        >
                          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        </button>
                        <button
                          onClick={() => handlePriorityChange(entry.id, 'medium')}
                          className={`p-1 rounded ${entry.priority === 'medium' ? 'bg-yellow-100' : 'hover:bg-gray-100'}`}
                          title="Medium"
                        >
                          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        </button>
                        <button
                          onClick={() => handlePriorityChange(entry.id, 'low')}
                          className={`p-1 rounded ${entry.priority === 'low' ? 'bg-green-100' : 'hover:bg-gray-100'}`}
                          title="Low"
                        >
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        </button>
                      </div>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowAssignModal(true);
                        }}
                      >
                        Assign Slot
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotifyPatient(entry)}
                      >
                        Notify Patient
                      </Button>
                    </>
                  )}
                  
                  {entry.status === 'notified' && (
                    <>
                      <p className="text-xs text-gray-500 text-right">
                        Notified: {entry.notifiedAt ? format(new Date(entry.notifiedAt), 'MMM d, h:mm a') : 'Unknown'}
                      </p>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowAssignModal(true);
                        }}
                      >
                        Assign Slot
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No patients on waitlist</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm || priorityFilter !== 'all' || statusFilter !== 'all'
              ? "No patients match your current filters. Try adjusting your search criteria."
              : "There are currently no patients on the waitlist for appointments."}
          </p>
        </div>
      )}
      
      {/* Assign Slot Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedEntry(null);
          setSelectedSlot(null);
        }}
        title="Assign Appointment Slot"
        size="lg"
      >
        {selectedEntry && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">{selectedEntry.patientName}</h4>
                  <p className="text-sm text-blue-700">
                    Waiting since {format(new Date(selectedEntry.createdAt), 'MMMM d, yyyy')}
                  </p>
                  
                  {selectedEntry.preferredTimeOfDay && (
                    <p className="text-sm text-blue-700 mt-1">
                      Prefers: {selectedEntry.preferredTimeOfDay.charAt(0).toUpperCase() + selectedEntry.preferredTimeOfDay.slice(1)} appointments
                    </p>
                  )}
                  
                  {selectedEntry.preferredDays && selectedEntry.preferredDays.length > 0 && (
                    <p className="text-sm text-blue-700 mt-1">
                      Preferred days: {selectedEntry.preferredDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Available Appointment Slots</h4>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getFilteredSlots().map((slot, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSlot === slot
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {format(slot.date, 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {slot.time}
                        </p>
                      </div>
                      
                      {selectedSlot === slot && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {getFilteredSlots().length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No available slots match this patient's preferences</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setSelectedEntry({
                        ...selectedEntry,
                        preferredTimeOfDay: 'any',
                        preferredDays: []
                      })}
                    >
                      Show All Available Slots
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEntry(null);
                  setSelectedSlot(null);
                }}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                onClick={handleAssignSlot}
                disabled={!selectedSlot}
              >
                Assign Appointment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};