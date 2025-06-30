import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMinutes, 
  setHours, 
  setMinutes, 
  addDays, 
  addWeeks, 
  addMonths, 
  parseISO 
} from 'date-fns';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Phone, 
  MapPin, 
  AlertCircle, 
  X, 
  Check, 
  Repeat, 
  ChevronDown, 
  ChevronUp, 
  Info 
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Appointment, AppointmentType, AppointmentStatus, RecurrencePattern } from '../../types/appointment';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: Omit<Appointment, 'id'>) => void;
  appointment: Appointment | null;
  initialSlot: { start: Date, end: Date } | null;
  userRole: 'doctor' | 'patient';
  userId: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  initialSlot,
  userRole,
  userId
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<AppointmentType>('video');
  const [status, setStatus] = useState<AppointmentStatus>('scheduled');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  
  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [recurrenceEndAfter, setRecurrenceEndAfter] = useState(4);
  const [recurrenceEndType, setRecurrenceEndType] = useState<'date' | 'occurrences'>('occurrences');
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  
  // Mock data for doctors and patients
  const doctors = [
    { id: 'doctor1', name: 'Dr. Sarah Johnson' },
    { id: 'doctor2', name: 'Dr. Michael Chen' },
    { id: 'doctor3', name: 'Dr. Emily Rodriguez' }
  ];
  
  const patients = [
    { id: 'patient1', name: 'John Smith' },
    { id: 'patient2', name: 'Maria Garcia' },
    { id: 'patient3', name: 'David Wilson' }
  ];
  
  // Initialize form with appointment data or defaults
  useEffect(() => {
    if (appointment) {
      setTitle(appointment.title);
      setPatientId(appointment.patientId);
      setPatientName(appointment.patientName);
      setDoctorId(appointment.doctorId);
      setDoctorName(appointment.doctorName);
      setDate(format(new Date(appointment.start), 'yyyy-MM-dd'));
      setStartTime(format(new Date(appointment.start), 'HH:mm'));
      setEndTime(format(new Date(appointment.end), 'HH:mm'));
      setType(appointment.type);
      setStatus(appointment.status);
      setNotes(appointment.notes || '');
      setLocation(appointment.location || '');
      
      // Set recurrence data if available
      if (appointment.recurrence) {
        setIsRecurring(true);
        setRecurrencePattern(appointment.recurrence.pattern);
        setRecurrenceInterval(appointment.recurrence.interval);
        if (appointment.recurrence.endDate) {
          setRecurrenceEndType('date');
          setRecurrenceEndDate(format(new Date(appointment.recurrence.endDate), 'yyyy-MM-dd'));
        } else if (appointment.recurrence.occurrences) {
          setRecurrenceEndType('occurrences');
          setRecurrenceEndAfter(appointment.recurrence.occurrences);
        }
      } else {
        setIsRecurring(false);
      }
    } else if (initialSlot) {
      setDate(format(initialSlot.start, 'yyyy-MM-dd'));
      setStartTime(format(initialSlot.start, 'HH:mm'));
      setEndTime(format(initialSlot.end, 'HH:mm'));
      
      // Set default values based on user role
      if (userRole === 'doctor') {
        setDoctorId(userId);
        setDoctorName(doctors.find(d => d.id === userId)?.name || 'Current Doctor');
      } else {
        setPatientId(userId);
        setPatientName(patients.find(p => p.id === userId)?.name || 'Current Patient');
      }
    } else {
      // Default values for new appointment
      const now = new Date();
      const roundedMinutes = Math.ceil(now.getMinutes() / 30) * 30;
      const startDate = setMinutes(setHours(now, now.getHours() + 1), roundedMinutes % 60);
      const endDate = addMinutes(startDate, 30);
      
      setDate(format(startDate, 'yyyy-MM-dd'));
      setStartTime(format(startDate, 'HH:mm'));
      setEndTime(format(endDate, 'HH:mm'));
      setType('video');
      setStatus('scheduled');
      
      // Set default values based on user role
      if (userRole === 'doctor') {
        setDoctorId(userId);
        setDoctorName(doctors.find(d => d.id === userId)?.name || 'Current Doctor');
      } else {
        setPatientId(userId);
        setPatientName(patients.find(p => p.id === userId)?.name || 'Current Patient');
      }
    }
  }, [appointment, initialSlot, userRole, userId]);
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!patientId) {
      newErrors.patientId = 'Patient is required';
    }
    
    if (!doctorId) {
      newErrors.doctorId = 'Doctor is required';
    }
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    if (startTime && endTime) {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    
    if (type === 'in_person' && !location.trim()) {
      newErrors.location = 'Location is required for in-person appointments';
    }
    
    if (isRecurring) {
      if (recurrenceEndType === 'date' && !recurrenceEndDate) {
        newErrors.recurrenceEndDate = 'End date is required for recurring appointments';
      }
      
      if (recurrenceEndType === 'occurrences' && (!recurrenceEndAfter || recurrenceEndAfter < 1)) {
        newErrors.recurrenceEndAfter = 'Number of occurrences must be at least 1';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    
    // Create recurrence object if appointment is recurring
    const recurrence = isRecurring ? {
      pattern: recurrencePattern,
      interval: recurrenceInterval,
      ...(recurrenceEndType === 'date' 
        ? { endDate: new Date(recurrenceEndDate) } 
        : { occurrences: recurrenceEndAfter }
      )
    } : undefined;
    
    const appointmentData: Omit<Appointment, 'id'> = {
      title,
      patientId,
      patientName,
      doctorId,
      doctorName,
      start,
      end,
      type,
      status,
      notes,
      location,
      recurrence
    };
    
    onSubmit(appointmentData);
  };
  
  // Generate recurrence preview
  const getRecurrencePreview = (): string[] => {
    if (!isRecurring) return [];
    
    const start = new Date(`${date}T${startTime}`);
    const preview: string[] = [];
    const maxPreview = 5;
    
    let currentDate = start;
    let count = 0;
    
    while (preview.length < maxPreview) {
      // Skip the first date (original appointment)
      if (count > 0) {
        preview.push(format(currentDate, 'EEEE, MMMM d, yyyy'));
      }
      
      count++;
      
      // Calculate next occurrence based on pattern
      switch (recurrencePattern) {
        case 'daily':
          currentDate = addDays(currentDate, recurrenceInterval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, recurrenceInterval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, recurrenceInterval);
          break;
      }
      
      // Check if we've reached the end date
      if (recurrenceEndType === 'date' && recurrenceEndDate) {
        if (currentDate > new Date(recurrenceEndDate)) break;
      }
      
      // Check if we've reached the max occurrences
      if (recurrenceEndType === 'occurrences' && count >= recurrenceEndAfter) break;
    }
    
    return preview;
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={appointment ? 'Edit Appointment' : 'New Appointment'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Conflict Warning */}
        {showConflictWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-shake">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Potential Scheduling Conflict</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This time slot may conflict with an existing appointment. Please check your schedule or choose a different time.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Follow-up Consultation"
            error={errors.title}
          />
        </div>
        
        {/* Participants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient
            </label>
            <select
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                const selectedPatient = patients.find(p => p.id === e.target.value);
                if (selectedPatient) {
                  setPatientName(selectedPatient.name);
                }
              }}
              disabled={userRole === 'patient'}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.patientId ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
              }`}
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
            {errors.patientId && (
              <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor
            </label>
            <select
              value={doctorId}
              onChange={(e) => {
                setDoctorId(e.target.value);
                const selectedDoctor = doctors.find(d => d.id === e.target.value);
                if (selectedDoctor) {
                  setDoctorName(selectedDoctor.name);
                }
              }}
              disabled={userRole === 'doctor'}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.doctorId ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
              }`}
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
              ))}
            </select>
            {errors.doctorId && (
              <p className="text-red-500 text-sm mt-1">{errors.doctorId}</p>
            )}
          </div>
        </div>
        
        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.date ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
                }`}
              />
            </div>
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.startTime ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
                }`}
              />
            </div>
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.endTime ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
                }`}
              />
            </div>
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
            )}
          </div>
        </div>
        
        {/* Appointment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className={`flex items-center justify-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${
              type === 'video' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="appointmentType"
                value="video"
                checked={type === 'video'}
                onChange={() => setType('video')}
                className="sr-only"
              />
              <Video className={`w-5 h-5 ${type === 'video' ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Video Call</span>
            </label>
            
            <label className={`flex items-center justify-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${
              type === 'phone' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="appointmentType"
                value="phone"
                checked={type === 'phone'}
                onChange={() => setType('phone')}
                className="sr-only"
              />
              <Phone className={`w-5 h-5 ${type === 'phone' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>Phone Call</span>
            </label>
            
            <label className={`flex items-center justify-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all ${
              type === 'in_person' 
                ? 'bg-purple-50 border-purple-200 text-purple-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="appointmentType"
                value="in_person"
                checked={type === 'in_person'}
                onChange={() => setType('in_person')}
                className="sr-only"
              />
              <MapPin className={`w-5 h-5 ${type === 'in_person' ? 'text-purple-600' : 'text-gray-400'}`} />
              <span>In Person</span>
            </label>
          </div>
        </div>
        
        {/* Location (for in-person appointments) */}
        {type === 'in_person' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location details"
              error={errors.location}
            />
          </div>
        )}
        
        {/* Status */}
        {appointment && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        )}
        
        {/* Recurrence Options */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Recurring Appointment</span>
            </label>
            
            {isRecurring && (
              <button
                type="button"
                onClick={() => setShowRecurrenceOptions(!showRecurrenceOptions)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {showRecurrenceOptions ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          
          {isRecurring && showRecurrenceOptions && (
            <div className="mt-4 space-y-4 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat Every
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                      className="w-16 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    
                    <select
                      value={recurrencePattern}
                      onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="daily">Day(s)</option>
                      <option value="weekly">Week(s)</option>
                      <option value="monthly">Month(s)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ends
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recurrenceEndType"
                        checked={recurrenceEndType === 'occurrences'}
                        onChange={() => setRecurrenceEndType('occurrences')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">After</span>
                        <input
                          type="number"
                          min="1"
                          value={recurrenceEndAfter}
                          onChange={(e) => setRecurrenceEndAfter(parseInt(e.target.value) || 1)}
                          disabled={recurrenceEndType !== 'occurrences'}
                          className="w-16 px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-100"
                        />
                        <span className="text-sm text-gray-700">occurrences</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recurrenceEndType"
                        checked={recurrenceEndType === 'date'}
                        onChange={() => setRecurrenceEndType('date')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">On</span>
                        <input
                          type="date"
                          value={recurrenceEndDate}
                          onChange={(e) => setRecurrenceEndDate(e.target.value)}
                          disabled={recurrenceEndType !== 'date'}
                          className="px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-100"
                        />
                      </div>
                    </label>
                    
                    {errors.recurrenceEndDate && recurrenceEndType === 'date' && (
                      <p className="text-red-500 text-sm">{errors.recurrenceEndDate}</p>
                    )}
                    
                    {errors.recurrenceEndAfter && recurrenceEndType === 'occurrences' && (
                      <p className="text-red-500 text-sm">{errors.recurrenceEndAfter}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Recurrence Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Recurrence Preview</h4>
                    <p className="text-xs text-blue-700">
                      This appointment will repeat every {recurrenceInterval} {recurrencePattern}(s) 
                      {recurrenceEndType === 'occurrences' 
                        ? ` for ${recurrenceEndAfter} occurrences` 
                        : recurrenceEndDate 
                          ? ` until ${format(new Date(recurrenceEndDate), 'MMMM d, yyyy')}` 
                          : ''
                      }
                    </p>
                    
                    {getRecurrencePreview().length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-blue-800">Next occurrences:</p>
                        <ul className="mt-1 space-y-1">
                          {getRecurrencePreview().map((dateStr, index) => (
                            <li key={index} className="text-xs text-blue-700 flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>{dateStr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Add any additional notes or instructions..."
          />
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
            onClick={handleSubmit}
            icon={appointment ? undefined : Plus}
          >
            {appointment ? 'Update Appointment' : 'Create Appointment'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};