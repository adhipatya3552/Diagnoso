import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Phone, 
  MapPin, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  AlertTriangle, 
  MessageCircle, 
  FileText, 
  Repeat 
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Appointment } from '../../types/appointment';

interface AppointmentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit: () => void;
  onDelete: () => void;
  userRole: 'doctor' | 'patient';
}

export const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete,
  userRole
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  if (!appointment) return null;
  
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
  
  // Get appointment status color
  const getStatusColor = () => {
    switch (appointment.status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Format recurrence pattern
  const formatRecurrence = () => {
    if (!appointment.recurrence) return 'One-time appointment';
    
    const { pattern, interval, endDate, occurrences } = appointment.recurrence;
    
    let recurrenceText = `Repeats every ${interval} `;
    
    switch (pattern) {
      case 'daily':
        recurrenceText += interval === 1 ? 'day' : 'days';
        break;
      case 'weekly':
        recurrenceText += interval === 1 ? 'week' : 'weeks';
        break;
      case 'monthly':
        recurrenceText += interval === 1 ? 'month' : 'months';
        break;
    }
    
    if (endDate) {
      recurrenceText += ` until ${format(new Date(endDate), 'MMMM d, yyyy')}`;
    } else if (occurrences) {
      recurrenceText += ` for ${occurrences} occurrences`;
    }
    
    return recurrenceText;
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header with title and status */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">{appointment.title}</h3>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor()}`}>
            {appointment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        
        {/* Appointment details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Date and Time */}
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-800">
                  {format(new Date(appointment.start), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-800">
                  {format(new Date(appointment.start), 'h:mm a')} - {format(new Date(appointment.end), 'h:mm a')}
                </p>
                <p className="text-sm text-gray-500">
                  Duration: {Math.round((new Date(appointment.end).getTime() - new Date(appointment.start).getTime()) / (1000 * 60))} minutes
                </p>
              </div>
            </div>
            
            {/* Recurrence */}
            {appointment.recurrence && (
              <div className="flex items-start space-x-3">
                <Repeat className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Recurrence</p>
                  <p className="font-medium text-gray-800">
                    {formatRecurrence()}
                  </p>
                </div>
              </div>
            )}
            
            {/* Appointment Type */}
            <div className="flex items-start space-x-3">
              {getAppointmentTypeIcon()}
              <div>
                <p className="text-sm text-gray-500">Appointment Type</p>
                <p className="font-medium text-gray-800">
                  {appointment.type === 'video' ? 'Video Call' : 
                   appointment.type === 'phone' ? 'Phone Call' : 
                   'In-Person Visit'}
                </p>
                {appointment.type === 'in_person' && appointment.location && (
                  <p className="text-sm text-gray-600 mt-1">
                    Location: {appointment.location}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Participants */}
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Doctor</p>
                <p className="font-medium text-gray-800">{appointment.doctorName}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-medium text-gray-800">{appointment.patientName}</p>
              </div>
            </div>
            
            {/* Notes */}
            {appointment.notes && (
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-800">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
          {appointment.type === 'video' && appointment.status === 'scheduled' && (
            <Button
              variant="success"
              icon={Video}
            >
              Join Video Call
            </Button>
          )}
          
          <Button
            variant="outline"
            icon={MessageCircle}
          >
            Message {userRole === 'doctor' ? 'Patient' : 'Doctor'}
          </Button>
          
          {appointment.status === 'scheduled' && (
            <>
              <Button
                variant="outline"
                icon={Edit}
                onClick={onEdit}
              >
                Edit
              </Button>
              
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
        
        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800">Cancel this appointment?</h4>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone. {appointment.recurrence ? 'This will only cancel this specific occurrence, not the entire series.' : ''}
                </p>
                
                <div className="flex space-x-3 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Keep Appointment
                  </Button>
                  
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={onDelete}
                  >
                    Confirm Cancellation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};