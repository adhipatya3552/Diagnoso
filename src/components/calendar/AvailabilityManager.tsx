import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  setHours, 
  setMinutes, 
  addMinutes,
  isSameDay
} from 'date-fns';
import { Clock, Save, Plus, Trash2, AlertCircle, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAvailability } from '../../hooks/useAvailability';

interface AvailabilityManagerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userRole: 'doctor' | 'patient';
}

interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  isOpen,
  onClose,
  userId,
  userRole
}) => {
  const { availability, updateAvailability, loading } = useAvailability(userId);
  
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [workingHours, setWorkingHours] = useState<Record<string, { start: string; end: string; available: boolean }>>({
    monday: { start: '09:00', end: '17:00', available: true },
    tuesday: { start: '09:00', end: '17:00', available: true },
    wednesday: { start: '09:00', end: '17:00', available: true },
    thursday: { start: '09:00', end: '17:00', available: true },
    friday: { start: '09:00', end: '17:00', available: true },
    saturday: { start: '09:00', end: '13:00', available: false },
    sunday: { start: '09:00', end: '13:00', available: false }
  });
  
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newBlock, setNewBlock] = useState<Omit<TimeBlock, 'id'>>({
    day: 'monday',
    startTime: '12:00',
    endTime: '13:00',
    isAvailable: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  
  // Initialize with availability data
  useEffect(() => {
    if (availability) {
      // Set working hours
      if (availability.workingHours) {
        setWorkingHours(availability.workingHours);
      }
      
      // Set time blocks
      if (availability.timeBlocks) {
        setTimeBlocks(availability.timeBlocks);
      }
    }
  }, [availability]);
  
  // Handle working hours change
  const handleWorkingHoursChange = (day: string, field: 'start' | 'end' | 'available', value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };
  
  // Handle add time block
  const handleAddTimeBlock = () => {
    // Validate
    const errors: Record<string, string> = {};
    
    if (newBlock.startTime >= newBlock.endTime) {
      errors.time = 'End time must be after start time';
    }
    
    setErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setTimeBlocks(prev => [
        ...prev,
        {
          id: `block-${Date.now()}`,
          ...newBlock
        }
      ]);
      
      setShowAddBlock(false);
      setNewBlock({
        day: 'monday',
        startTime: '12:00',
        endTime: '13:00',
        isAvailable: false
      });
    }
  };
  
  // Handle remove time block
  const handleRemoveTimeBlock = (id: string) => {
    setTimeBlocks(prev => prev.filter(block => block.id !== id));
  };
  
  // Handle save
  const handleSave = async () => {
    try {
      await updateAvailability({
        workingHours,
        timeBlocks
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };
  
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Availability"
      size="lg"
    >
      <div className="space-y-6">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Availability Updated</h3>
            <p className="text-gray-600">Your availability settings have been saved successfully.</p>
          </div>
        ) : (
          <>
            {/* Working Hours */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Regular Working Hours</h3>
              
              <div className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    <div className="w-24">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={workingHours[day]?.available || false}
                          onChange={(e) => handleWorkingHoursChange(day, 'available', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </span>
                      </label>
                    </div>
                    
                    {workingHours[day]?.available && (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="time"
                          value={workingHours[day]?.start || '09:00'}
                          onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={workingHours[day]?.end || '17:00'}
                          onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Time Blocks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Special Time Blocks</h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => setShowAddBlock(true)}
                >
                  Add Block
                </Button>
              </div>
              
              {timeBlocks.length > 0 ? (
                <div className="space-y-3">
                  {timeBlocks.map((block) => (
                    <div key={block.id} className={`p-3 rounded-lg border ${
                      block.isAvailable 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 capitalize">{block.day}</p>
                          <p className="text-sm text-gray-600">
                            {block.startTime} - {block.endTime}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {block.isAvailable 
                              ? <span className="text-green-700">Available</span> 
                              : <span className="text-red-700">Unavailable</span>
                            }
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveTimeBlock(block.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No special time blocks added</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add blocks for vacations, lunch breaks, or special availability
                  </p>
                </div>
              )}
              
              {/* Add Block Form */}
              {showAddBlock && (
                <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50 animate-slide-down">
                  <h4 className="font-medium text-blue-800 mb-3">Add Time Block</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Day
                      </label>
                      <select
                        value={newBlock.day}
                        onChange={(e) => setNewBlock(prev => ({ ...prev, day: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                      >
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Block Type
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={newBlock.isAvailable}
                            onChange={() => setNewBlock(prev => ({ ...prev, isAvailable: true }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-blue-700">Available</span>
                        </label>
                        
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!newBlock.isAvailable}
                            onChange={() => setNewBlock(prev => ({ ...prev, isAvailable: false }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-blue-700">Unavailable</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newBlock.startTime}
                        onChange={(e) => setNewBlock(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newBlock.endTime}
                        onChange={(e) => setNewBlock(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                      />
                    </div>
                  </div>
                  
                  {errors.time && (
                    <p className="text-red-500 text-sm mb-3">{errors.time}</p>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddBlock(false)}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddTimeBlock}
                    >
                      Add Block
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">About Availability Settings</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your regular working hours define when you're typically available for appointments.
                    Special time blocks can override these hours for specific times, such as lunch breaks,
                    vacations, or additional availability outside regular hours.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                onClick={handleSave}
                loading={loading}
                icon={Save}
              >
                Save Availability
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};