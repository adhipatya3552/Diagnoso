import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Check, X, Bell, User, Video, Phone, MapPin } from 'lucide-react';
import { format, addHours, isBefore, isAfter, differenceInHours } from 'date-fns';
import { Button } from '../ui/Button';
import { Appointment } from '../../types/appointment';
import { useNotifications } from '../../hooks/useNotifications';

interface AppointmentReminderProps {
  appointment: Appointment;
  onReschedule?: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  className?: string;
}

export const AppointmentReminder: React.FC<AppointmentReminderProps> = ({
  appointment,
  onReschedule,
  onCancel,
  onConfirm,
  className = ''
}) => {
  const { addNotification } = useNotifications();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [reminderSent, setReminderSent] = useState<boolean>(false);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high'>('low');
  
  // Calculate time remaining and urgency level
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const appointmentTime = new Date(appointment.start);
      
      if (isBefore(appointmentTime, now)) {
        setTimeRemaining('Appointment has passed');
        return;
      }
      
      const hoursRemaining = differenceInHours(appointmentTime, now);
      
      if (hoursRemaining < 1) {
        const minutesRemaining = Math.floor((appointmentTime.getTime() - now.getTime()) / (1000 * 60));
        setTimeRemaining(`${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`);
        setUrgencyLevel('high');
      } else if (hoursRemaining < 24) {
        setTimeRemaining(`${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`);
        setUrgencyLevel(hoursRemaining < 3 ? 'high' : 'medium');
      } else {
        const daysRemaining = Math.floor(hoursRemaining / 24);
        setTimeRemaining(`${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`);
        setUrgencyLevel('low');
      }
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [appointment]);
  
  // Send automatic reminders based on time remaining
  useEffect(() => {
    const sendReminder = async () => {
      if (reminderSent) return;
      
      const now = new Date();
      const appointmentTime = new Date(appointment.start);
      const hoursRemaining = differenceInHours(appointmentTime, now);
      
      // Send reminder 24 hours before appointment
      if (hoursRemaining <= 24 && hoursRemaining > 23) {
        addNotification({
          title: '24-Hour Appointment Reminder',
          message: `Your appointment with ${appointment.doctorName} is tomorrow at ${format(appointmentTime, 'h:mm a')}`,
          type: 'appointment',
          link: '/patient/appointments',
          priority: 'normal',
          actions: [
            { label: 'View Details', variant: 'primary' },
            { label: 'Reschedule', variant: 'secondary' }
          ]
        });
        setReminderSent(true);
      }
      
      // Send reminder 2 hours before appointment
      if (hoursRemaining <= 2 && hoursRemaining > 1) {
        addNotification({
          title: '2-Hour Appointment Reminder',
          message: `Your appointment with ${appointment.doctorName} is in 2 hours at ${format(appointmentTime, 'h:mm a')}`,
          type: 'appointment',
          link: '/patient/appointments',
          priority: 'high',
          actions: [
            { label: 'View Details', variant: 'primary' },
            { label: 'Get Directions', variant: 'secondary' }
          ]
        });
        setReminderSent(true);
      }
    };
    
    if (appointment.status === 'scheduled') {
      sendReminder();
    }
  }, [appointment, timeRemaining, reminderSent, addNotification]);
  
  // Get appointment type icon
  const getAppointmentTypeIcon = () => {
    switch (appointment.type) {
      case 'video':
        return <Video className="w-5 h-5 text-green-600" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-blue-600" />;
      case 'in_person':
        return <MapPin className="w-5 h-5 text-purple-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };
  
  // Get urgency color
  const getUrgencyColor = () => {
    switch (urgencyLevel) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className={`rounded-lg border ${getUrgencyColor()} p-4 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-full ${
          urgencyLevel === 'high' ? 'bg-red-100' :
          urgencyLevel === 'medium' ? 'bg-yellow-100' :
          'bg-blue-100'
        }`}>
          <Bell className={`w-6 h-6 ${
            urgencyLevel === 'high' ? 'text-red-600' :
            urgencyLevel === 'medium' ? 'text-yellow-600' :
            'text-blue-600'
          }`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">Upcoming Appointment</h3>
              <p className="text-gray-600 mt-1">{appointment.title}</p>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{appointment.doctorName}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{format(new Date(appointment.start), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{format(new Date(appointment.start), 'h:mm a')} - {format(new Date(appointment.end), 'h:mm a')}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {getAppointmentTypeIcon()}
                  <span>
                    {appointment.type === 'video' ? 'Video Call' : 
                     appointment.type === 'phone' ? 'Phone Call' : 
                     'In-Person Visit'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
              urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {timeRemaining} remaining
            </div>
          </div>
          
          {appointment.notes && (
            <div className="mt-3 p-3 bg-white/50 rounded-lg text-sm text-gray-700">
              <p className="font-medium">Notes:</p>
              <p>{appointment.notes}</p>
            </div>
          )}
          
          <div className="mt-4 flex flex-wrap gap-2">
            {onConfirm && (
              <Button
                variant="primary"
                size="sm"
                icon={Check}
                onClick={onConfirm}
              >
                Confirm
              </Button>
            )}
            
            {onReschedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReschedule}
              >
                Reschedule
              </Button>
            )}
            
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                icon={X}
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            
            {appointment.type === 'video' && urgencyLevel === 'high' && (
              <Button
                variant="success"
                size="sm"
                icon={Video}
              >
                Join Call
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};