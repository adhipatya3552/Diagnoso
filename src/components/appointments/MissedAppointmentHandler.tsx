import React, { useState } from 'react';
import { AlertCircle, Calendar, Clock, User, X, Check, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Appointment } from '../../types/appointment';

interface MissedAppointmentHandlerProps {
  appointment: Appointment;
  suggestedSlots?: Array<{ start: Date; end: Date }>;
  onReschedule: (slot: { start: Date; end: Date }) => void;
  onCancel: () => void;
  onIgnore: () => void;
  className?: string;
}

export const MissedAppointmentHandler: React.FC<MissedAppointmentHandlerProps> = ({
  appointment,
  suggestedSlots = [],
  onReschedule,
  onCancel,
  onIgnore,
  className = ''
}) => {
  const [showRescheduleOptions, setShowRescheduleOptions] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  
  // Generate default suggested slots if none provided
  const getDefaultSlots = () => {
    if (suggestedSlots.length > 0) return suggestedSlots;
    
    const defaultSlots = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1); // Start tomorrow
    
    // Create 5 slots at different times
    for (let i = 0; i < 5; i++) {
      const slotDate = new Date(baseDate);
      slotDate.setDate(slotDate.getDate() + Math.floor(i / 2)); // Spread over a few days
      
      const hour = 9 + (i % 3) * 2; // 9 AM, 11 AM, 1 PM, repeat
      slotDate.setHours(hour, 0, 0, 0);
      
      const endDate = new Date(slotDate);
      endDate.setMinutes(endDate.getMinutes() + 30);
      
      defaultSlots.push({
        start: slotDate,
        end: endDate
      });
    }
    
    return defaultSlots;
  };
  
  const slots = getDefaultSlots();
  
  const handleReschedule = () => {
    if (selectedSlot) {
      onReschedule(selectedSlot);
    } else if (slots.length > 0) {
      onReschedule(slots[0]);
    }
  };
  
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-red-100 rounded-full">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-red-800 text-lg">Missed Appointment</h3>
              <p className="text-red-700 mt-1">
                You missed your appointment for {appointment.title}.
              </p>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-red-700">
                  <User className="w-4 h-4 text-red-500" />
                  <span>Doctor: {appointment.doctorName}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-red-700">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span>Date: {format(new Date(appointment.start), 'MMMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-red-700">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>Time: {format(new Date(appointment.start), 'h:mm a')}</span>
                </div>
              </div>
            </div>
          </div>
          
          {!showRescheduleOptions ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowRescheduleOptions(true)}
              >
                Reschedule
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Cancel Appointment
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onIgnore}
              >
                Ignore
              </Button>
            </div>
          ) : (
            <div className="mt-4 animate-fade-in">
              <h4 className="font-medium text-red-800 mb-2">Available time slots:</h4>
              
              <div className="space-y-2 mb-4">
                {slots.map((slot, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSlot === slot
                        ? 'bg-white border-blue-500'
                        : 'bg-white/70 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {format(slot.start, 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
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
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRescheduleOptions(false)}
                >
                  Back
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleReschedule}
                  disabled={!selectedSlot && slots.length === 0}
                >
                  Confirm Reschedule
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};