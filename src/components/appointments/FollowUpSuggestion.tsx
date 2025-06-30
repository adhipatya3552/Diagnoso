import React, { useState } from 'react';
import { Calendar, Clock, User, AlertCircle, Check, X, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { Button } from '../ui/Button';
import { Appointment } from '../../types/appointment';

interface FollowUpSuggestionProps {
  previousAppointment: Appointment;
  suggestedTimeframe: 'days' | 'weeks' | 'months';
  suggestedInterval: number;
  reason?: string;
  onAccept: (date: Date) => void;
  onDecline: () => void;
  className?: string;
}

export const FollowUpSuggestion: React.FC<FollowUpSuggestionProps> = ({
  previousAppointment,
  suggestedTimeframe,
  suggestedInterval,
  reason,
  onAccept,
  onDecline,
  className = ''
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Calculate suggested follow-up date
  const calculateSuggestedDate = () => {
    const baseDate = new Date(previousAppointment.end);
    
    switch (suggestedTimeframe) {
      case 'days':
        return addDays(baseDate, suggestedInterval);
      case 'weeks':
        return addWeeks(baseDate, suggestedInterval);
      case 'months':
        return addMonths(baseDate, suggestedInterval);
      default:
        return addWeeks(baseDate, 2); // Default to 2 weeks
    }
  };
  
  const suggestedDate = calculateSuggestedDate();
  
  // Generate suggested time slots
  const generateTimeSlots = () => {
    const slots = [];
    const baseDate = selectedDate || suggestedDate;
    
    // Start at 9 AM
    const startHour = 9;
    
    // Generate slots every 30 minutes from 9 AM to 4:30 PM
    for (let hour = startHour; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotDate = new Date(baseDate);
        slotDate.setHours(hour, minute, 0, 0);
        slots.push(slotDate);
      }
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  const handleAccept = (date: Date) => {
    onAccept(date);
  };
  
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-blue-800 text-lg">Follow-Up Recommendation</h3>
              <p className="text-blue-700 mt-1">
                Based on your recent appointment, we recommend scheduling a follow-up
                {suggestedInterval === 1 
                  ? ` in ${suggestedInterval} ${suggestedTimeframe.slice(0, -1)}`
                  : ` in ${suggestedInterval} ${suggestedTimeframe}`
                }.
              </p>
              
              {reason && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg text-sm text-blue-700">
                  <p className="font-medium">Reason for follow-up:</p>
                  <p>{reason}</p>
                </div>
              )}
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <User className="w-4 h-4 text-blue-500" />
                  <span>Previous appointment with: {previousAppointment.doctorName}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Previous date: {format(new Date(previousAppointment.start), 'MMMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Suggested follow-up: {format(suggestedDate, 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
          
          {!showDatePicker ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowDatePicker(true)}
                icon={CalendarIcon}
              >
                Schedule Follow-Up
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onDecline}
                icon={X}
              >
                Decline
              </Button>
            </div>
          ) : (
            <div className="mt-4 animate-fade-in">
              <h4 className="font-medium text-blue-800 mb-2">Select a date and time:</h4>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-blue-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(suggestedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-blue-700 mb-1">Time</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.slice(0, 8).map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleAccept(slot)}
                      className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-blue-800 hover:bg-blue-100 transition-colors"
                    >
                      {format(slot, 'h:mm a')}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDatePicker(false)}
                >
                  Back
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAccept(selectedDate || suggestedDate)}
                  disabled={!selectedDate && !suggestedDate}
                >
                  See More Times
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};