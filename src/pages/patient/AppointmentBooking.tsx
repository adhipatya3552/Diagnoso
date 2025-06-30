import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Stethoscope, 
  CalendarCheck, 
  AlertTriangle, 
  User, 
  FileText, 
  MessageSquare, 
  Bell, 
  CreditCard, 
  Shield, 
  ArrowRight, 
  ArrowLeft,
  Sun,
  Sunset,
  Moon,
  Video,
  Phone,
  MapPin,
  Info,
  Plus,
  Minus,
  CheckCircle,
  Send
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  getDay, 
  addDays, 
  isToday, 
  isBefore,
  parseISO,
  addMinutes
} from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  profile_photo_url?: string;
  consultation_fee: number;
  availability_hours: Record<string, { start: string; end: string; available: boolean }>;
  consultation_types: ('video' | 'phone' | 'in_person')[];
}

interface AppointmentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  duration: number;
  color: string;
  price?: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  formattedTime: string;
}

interface BookingFormData {
  doctorId: string;
  appointmentType: string;
  date: Date;
  timeSlot: string;
  reason: string;
  symptoms: string[];
  notes: string;
  consultationType: 'video' | 'phone' | 'in_person';
  insuranceInfo?: string;
  reminders: {
    email: boolean;
    sms: boolean;
    pushNotification: boolean;
  };
}

export const AppointmentBooking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  
  // State for the booking process
  const [currentStep, setCurrentStep] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string | null>(null);
  const [selectedConsultationType, setSelectedConsultationType] = useState<'video' | 'phone' | 'in_person' | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');
  
  // Form data
  const [formData, setFormData] = useState<BookingFormData>({
    doctorId: '',
    appointmentType: '',
    date: new Date(),
    timeSlot: '',
    reason: '',
    symptoms: [],
    notes: '',
    consultationType: 'video',
    reminders: {
      email: true,
      sms: true,
      pushNotification: false
    }
  });
  
  // Mock data for doctors
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      profile_photo_url: 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      consultation_fee: 150,
      availability_hours: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '09:00', end: '13:00', available: true },
        sunday: { start: '00:00', end: '00:00', available: false }
      },
      consultation_types: ['video', 'in_person']
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'General Practice',
      profile_photo_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      consultation_fee: 120,
      availability_hours: {
        monday: { start: '08:00', end: '16:00', available: true },
        tuesday: { start: '08:00', end: '16:00', available: true },
        wednesday: { start: '08:00', end: '16:00', available: true },
        thursday: { start: '08:00', end: '16:00', available: true },
        friday: { start: '08:00', end: '16:00', available: true },
        saturday: { start: '09:00', end: '12:00', available: true },
        sunday: { start: '00:00', end: '00:00', available: false }
      },
      consultation_types: ['video', 'phone', 'in_person']
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      profile_photo_url: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      consultation_fee: 140,
      availability_hours: {
        monday: { start: '10:00', end: '18:00', available: true },
        tuesday: { start: '10:00', end: '18:00', available: true },
        wednesday: { start: '10:00', end: '18:00', available: true },
        thursday: { start: '10:00', end: '18:00', available: true },
        friday: { start: '10:00', end: '18:00', available: true },
        saturday: { start: '00:00', end: '00:00', available: false },
        sunday: { start: '00:00', end: '00:00', available: false }
      },
      consultation_types: ['video', 'phone']
    }
  ];
  
  // Appointment types
  const appointmentTypes: AppointmentType[] = [
    {
      id: 'consultation',
      name: 'New Consultation',
      icon: <Stethoscope className="w-6 h-6" />,
      description: 'Initial visit to discuss your health concerns and create a treatment plan.',
      duration: 45,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'follow-up',
      name: 'Follow-up Visit',
      icon: <CalendarCheck className="w-6 h-6" />,
      description: 'Check on your progress and adjust treatment as needed.',
      duration: 30,
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'emergency',
      name: 'Urgent Care',
      icon: <AlertTriangle className="w-6 h-6" />,
      description: 'For immediate medical concerns that require prompt attention.',
      duration: 60,
      color: 'from-red-500 to-red-600'
    }
  ];
  
  // Common symptoms for selection
  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Dizziness',
    'Chest Pain', 'Shortness of Breath', 'Abdominal Pain', 'Back Pain',
    'Joint Pain', 'Muscle Aches', 'Sore Throat', 'Runny Nose'
  ];
  
  // Common reasons for visit
  const commonReasons = [
    'Annual check-up',
    'Medication review',
    'Chronic condition management',
    'New symptoms',
    'Test results review',
    'Prescription refill',
    'Second opinion',
    'Pre-surgery consultation'
  ];
  
  // Set initial doctor
  useEffect(() => {
    if (doctors.length > 0) {
      setSelectedDoctor(doctors[0]);
      setFormData(prev => ({ ...prev, doctorId: doctors[0].id }));
    }
  }, []);
  
  // Generate days for the calendar
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(start);
    
    // Add days from the previous month to fill the first row
    const prevMonthDays = [];
    for (let i = 0; i < startDay; i++) {
      prevMonthDays.unshift(addDays(start, -i - 1));
    }
    
    // Add days from the next month to complete the last row
    const lastDay = getDay(end);
    const nextMonthDays = [];
    for (let i = 1; i < 7 - lastDay; i++) {
      nextMonthDays.push(addDays(end, i));
    }
    
    return [...prevMonthDays.reverse(), ...days, ...nextMonthDays];
  };
  
  // Generate time slots for the selected date
  const getTimeSlots = (): TimeSlot[] => {
    if (!selectedDate || !selectedDoctor) return [];
    
    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase() as keyof typeof selectedDoctor.availability_hours;
    const availability = selectedDoctor.availability_hours[dayOfWeek];
    
    if (!availability.available) return [];
    
    const slots: TimeSlot[] = [];
    const startTime = availability.start.split(':').map(Number);
    const endTime = availability.end.split(':').map(Number);
    
    let currentHour = startTime[0];
    let currentMinute = startTime[1];
    
    while (currentHour < endTime[0] || (currentHour === endTime[0] && currentMinute < endTime[1])) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Format for display (12-hour format)
      const date = new Date();
      date.setHours(currentHour, currentMinute);
      const formattedTime = format(date, 'h:mm a');
      
      slots.push({
        time: timeString,
        available: true, // In a real app, check against booked appointments
        formattedTime
      });
      
      // Increment by 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    return slots;
  };
  
  // Check if a date is available for booking
  const isDateAvailable = (date: Date) => {
    if (!selectedDoctor) return false;
    
    // Check if date is in the past
    if (isBefore(date, new Date()) && !isToday(date)) return false;
    
    // Check if the doctor works on this day
    const dayOfWeek = format(date, 'EEEE').toLowerCase() as keyof typeof selectedDoctor.availability_hours;
    return selectedDoctor.availability_hours[dayOfWeek].available;
  };
  
  // Group time slots by period (morning, afternoon, evening)
  const groupedTimeSlots = () => {
    const slots = getTimeSlots();
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];
    
    slots.forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });
    
    return { morning, afternoon, evening };
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      setSelectedTimeSlot(null);
      setFormData(prev => ({ ...prev, date }));
    }
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
    setFormData(prev => ({ ...prev, timeSlot: time }));
  };
  
  // Handle appointment type selection
  const handleAppointmentTypeSelect = (typeId: string) => {
    setSelectedAppointmentType(typeId);
    setFormData(prev => ({ ...prev, appointmentType: typeId }));
  };
  
  // Handle consultation type selection
  const handleConsultationTypeSelect = (type: 'video' | 'phone' | 'in_person') => {
    setSelectedConsultationType(type);
    setFormData(prev => ({ ...prev, consultationType: type }));
  };
  
  // Handle form input changes
  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle reminder toggle
  const handleReminderToggle = (type: 'email' | 'sms' | 'pushNotification') => {
    setFormData(prev => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        [type]: !prev.reminders[type]
      }
    }));
  };
  
  // Add symptom to the list
  const handleAddSymptom = () => {
    if (symptomInput.trim() && !formData.symptoms.includes(symptomInput.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };
  
  // Remove symptom from the list
  const handleRemoveSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };
  
  // Navigate to next step
  const nextStep = () => {
    if (currentStep === 1 && (!selectedDate || !selectedTimeSlot || !selectedAppointmentType)) {
      error('Please complete all selections before proceeding');
      return;
    }
    
    if (currentStep === 2 && !formData.reason) {
      error('Please provide a reason for your visit');
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmitBooking();
    }
  };
  
  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Submit the booking
  const handleSubmitBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot || !selectedAppointmentType || !selectedConsultationType) {
      error('Please complete all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, you would save to Supabase
      // const appointmentData = {
      //   patient_id: user?.id,
      //   doctor_id: selectedDoctor.id,
      //   appointment_date: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTimeSlot}`),
      //   duration_minutes: appointmentTypes.find(t => t.id === selectedAppointmentType)?.duration || 30,
      //   status: 'scheduled',
      //   consultation_type: selectedConsultationType,
      //   notes: formData.notes,
      //   reason: formData.reason
      // };
      
      // const { data, error: apiError } = await supabase
      //   .from('appointments')
      //   .insert(appointmentData)
      //   .select()
      //   .single();
      
      // if (apiError) throw apiError;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBookingConfirmed(true);
      success('Appointment booked successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel booking process
  const handleCancelBooking = () => {
    setShowCancelModal(false);
    navigate('/patient/appointments');
  };
  
  // Get the selected appointment type
  const getSelectedAppointmentType = () => {
    return appointmentTypes.find(type => type.id === selectedAppointmentType);
  };
  
  // Calculate appointment end time
  const getAppointmentEndTime = () => {
    if (!selectedDate || !selectedTimeSlot || !selectedAppointmentType) return null;
    
    const appointmentType = appointmentTypes.find(t => t.id === selectedAppointmentType);
    if (!appointmentType) return null;
    
    const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes);
    
    const endTime = addMinutes(startTime, appointmentType.duration);
    return format(endTime, 'h:mm a');
  };
  
  // Render the calendar
  const renderCalendar = () => {
    const days = getDaysInMonth();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isAvailable = isDateAvailable(day);
            const isCurrentDay = isToday(day);
            
            return (
              <button
                key={i}
                onClick={() => handleDateSelect(day)}
                disabled={!isAvailable || !isCurrentMonth}
                className={`
                  h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300
                  ${isSelected 
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md transform scale-110' 
                    : isCurrentDay
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : isAvailable && isCurrentMonth
                        ? 'hover:bg-blue-50 text-gray-700'
                        : 'text-gray-300 cursor-not-allowed'
                  }
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render time slots
  const renderTimeSlots = () => {
    const { morning, afternoon, evening } = groupedTimeSlots();
    
    const renderSlotGroup = (title: string, icon: React.ReactNode, slots: TimeSlot[]) => {
      if (slots.length === 0) return null;
      
      return (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              {icon}
            </div>
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map(slot => (
              <button
                key={slot.time}
                onClick={() => handleTimeSlotSelect(slot.time)}
                disabled={!slot.available}
                className={`
                  py-2 px-3 rounded-lg text-center text-sm transition-all
                  ${selectedTimeSlot === slot.time
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md'
                    : slot.available
                      ? 'bg-white hover:bg-gray-50 text-gray-700'
                      : 'bg-gray-100 text-gray-400 line-through cursor-not-allowed'
                  }
                `}
              >
                {slot.formattedTime}
              </button>
            ))}
          </div>
        </div>
      );
    };
    
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a Date'}
        </h2>
        
        {selectedDate ? (
          <>
            {renderSlotGroup('Morning', <Sun className="w-4 h-4 text-orange-500" />, morning)}
            {renderSlotGroup('Afternoon', <Sunset className="w-4 h-4 text-amber-500" />, afternoon)}
            {renderSlotGroup('Evening', <Moon className="w-4 h-4 text-indigo-500" />, evening)}
            
            {morning.length === 0 && afternoon.length === 0 && evening.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No available time slots for this date</p>
                <p className="text-sm text-gray-400 mt-1">Please select another date</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Please select a date to view available time slots</p>
          </div>
        )}
      </div>
    );
  };
  
  // Render appointment types
  const renderAppointmentTypes = () => {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Appointment Type</h2>
        
        <div className="space-y-4">
          {appointmentTypes.map(type => (
            <button
              key={type.id}
              onClick={() => handleAppointmentTypeSelect(type.id)}
              className={`
                w-full p-4 rounded-xl border transition-all duration-300
                ${selectedAppointmentType === type.id
                  ? 'border-transparent bg-gradient-to-r shadow-lg transform scale-[1.02] ' + type.color + ' text-white'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <div className="flex items-start">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                  ${selectedAppointmentType === type.id
                    ? 'bg-white/20'
                    : 'bg-gradient-to-r ' + type.color + ' bg-opacity-10'
                  }
                `}>
                  {type.icon}
                </div>
                
                <div className="ml-4 text-left">
                  <h3 className="font-semibold text-lg">{type.name}</h3>
                  <p className={`text-sm ${selectedAppointmentType === type.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {type.duration} minutes
                  </p>
                  <p className={`mt-2 text-sm ${selectedAppointmentType === type.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render consultation types
  const renderConsultationTypes = () => {
    if (!selectedDoctor) return null;
    
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Consultation Type</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedDoctor.consultation_types.includes('video') && (
            <button
              onClick={() => handleConsultationTypeSelect('video')}
              className={`
                p-4 rounded-xl border transition-all duration-300
                ${selectedConsultationType === 'video'
                  ? 'border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-3
                  ${selectedConsultationType === 'video'
                    ? 'bg-white/20'
                    : 'bg-green-100'
                  }
                `}>
                  <Video className={`w-6 h-6 ${selectedConsultationType === 'video' ? 'text-white' : 'text-green-600'}`} />
                </div>
                <h3 className="font-semibold">Video Call</h3>
                <p className={`text-sm mt-1 ${selectedConsultationType === 'video' ? 'text-white/80' : 'text-gray-500'}`}>
                  Face-to-face virtual consultation
                </p>
              </div>
            </button>
          )}
          
          {selectedDoctor.consultation_types.includes('phone') && (
            <button
              onClick={() => handleConsultationTypeSelect('phone')}
              className={`
                p-4 rounded-xl border transition-all duration-300
                ${selectedConsultationType === 'phone'
                  ? 'border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-3
                  ${selectedConsultationType === 'phone'
                    ? 'bg-white/20'
                    : 'bg-blue-100'
                  }
                `}>
                  <Phone className={`w-6 h-6 ${selectedConsultationType === 'phone' ? 'text-white' : 'text-blue-600'}`} />
                </div>
                <h3 className="font-semibold">Phone Call</h3>
                <p className={`text-sm mt-1 ${selectedConsultationType === 'phone' ? 'text-white/80' : 'text-gray-500'}`}>
                  Audio-only consultation
                </p>
              </div>
            </button>
          )}
          
          {selectedDoctor.consultation_types.includes('in_person') && (
            <button
              onClick={() => handleConsultationTypeSelect('in_person')}
              className={`
                p-4 rounded-xl border transition-all duration-300
                ${selectedConsultationType === 'in_person'
                  ? 'border-transparent bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-3
                  ${selectedConsultationType === 'in_person'
                    ? 'bg-white/20'
                    : 'bg-purple-100'
                  }
                `}>
                  <MapPin className={`w-6 h-6 ${selectedConsultationType === 'in_person' ? 'text-white' : 'text-purple-600'}`} />
                </div>
                <h3 className="font-semibold">In-Person</h3>
                <p className={`text-sm mt-1 ${selectedConsultationType === 'in_person' ? 'text-white/80' : 'text-gray-500'}`}>
                  Visit the doctor's office
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // Render step 1: Date, time, and appointment type selection
  const renderStep1 = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {renderCalendar()}
          {renderTimeSlots()}
        </div>
        
        <div className="space-y-6">
          {renderAppointmentTypes()}
          {renderConsultationTypes()}
          
          {selectedDoctor && (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Selected Doctor</h2>
              
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedDoctor.profile_photo_url} 
                  alt={selectedDoctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedDoctor.name}</h3>
                  <p className="text-teal-600">{selectedDoctor.specialty}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">4.9 (127 reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate('/patient/doctors')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Change Doctor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render step 2: Appointment details
  const renderStep2 = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Appointment Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                >
                  <option value="">Select a reason</option>
                  {commonReasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                  <option value="other">Other (please specify)</option>
                </select>
              </div>
              
              {formData.reason === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify your reason
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Please describe your reason for this appointment..."
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms (optional)
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Enter symptom"
                  />
                  <button
                    onClick={handleAddSymptom}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.symptoms.map(symptom => (
                    <div 
                      key={symptom}
                      className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{symptom}</span>
                      <button onClick={() => handleRemoveSymptom(symptom)}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Common symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSymptoms.slice(0, 8).map(symptom => (
                      <button
                        key={symptom}
                        onClick={() => {
                          if (!formData.symptoms.includes(symptom)) {
                            handleInputChange('symptoms', [...formData.symptoms, symptom]);
                          }
                        }}
                        disabled={formData.symptoms.includes(symptom)}
                        className={`
                          px-3 py-1 rounded-full text-xs
                          ${formData.symptoms.includes(symptom)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors'
                          }
                        `}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Any additional information you'd like to share with the doctor..."
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Insurance Information (Optional)</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Provider & Policy Number
              </label>
              <input
                type="text"
                value={formData.insuranceInfo || ''}
                onChange={(e) => handleInputChange('insuranceInfo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g., Blue Cross Blue Shield #12345678"
              />
              <p className="text-sm text-gray-500 mt-1">
                This information helps us process your insurance claims more efficiently
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Appointment Summary</h2>
            
            {selectedDoctor && selectedDate && selectedTimeSlot && selectedAppointmentType && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <CalendarIcon className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-blue-800">Date & Time</p>
                    <p className="font-semibold text-blue-900">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="font-semibold text-blue-900">
                      {format(parseISO(`2023-01-01T${selectedTimeSlot}`), 'h:mm a')} - {getAppointmentEndTime()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-teal-50 rounded-lg">
                  <User className="w-8 h-8 text-teal-500" />
                  <div>
                    <p className="text-sm text-teal-800">Doctor</p>
                    <p className="font-semibold text-teal-900">{selectedDoctor.name}</p>
                    <p className="text-sm text-teal-700">{selectedDoctor.specialty}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                  <Stethoscope className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-purple-800">Appointment Type</p>
                    <p className="font-semibold text-purple-900">
                      {appointmentTypes.find(t => t.id === selectedAppointmentType)?.name}
                    </p>
                    <p className="text-sm text-purple-700">
                      {appointmentTypes.find(t => t.id === selectedAppointmentType)?.duration} minutes
                    </p>
                  </div>
                </div>
                
                {selectedConsultationType && (
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    {selectedConsultationType === 'video' ? (
                      <Video className="w-8 h-8 text-green-500" />
                    ) : selectedConsultationType === 'phone' ? (
                      <Phone className="w-8 h-8 text-green-500" />
                    ) : (
                      <MapPin className="w-8 h-8 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm text-green-800">Consultation Type</p>
                      <p className="font-semibold text-green-900">
                        {selectedConsultationType === 'video' ? 'Video Call' : 
                         selectedConsultationType === 'phone' ? 'Phone Call' : 
                         'In-Person Visit'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Consultation Fee</span>
                    <span className="font-semibold text-gray-800">${selectedDoctor.consultation_fee}</span>
                  </div>
                  {selectedAppointmentType === 'emergency' && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Urgent Care Fee</span>
                      <span className="font-semibold text-gray-800">$50</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-blue-600">
                      ${selectedAppointmentType === 'emergency' 
                        ? selectedDoctor.consultation_fee + 50 
                        : selectedDoctor.consultation_fee}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Appointment Reminders</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Email Reminders</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminders.email}
                    onChange={() => handleReminderToggle('email')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">SMS Reminders</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminders.sms}
                    onChange={() => handleReminderToggle('sms')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700">Push Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminders.pushNotification}
                    onChange={() => handleReminderToggle('pushNotification')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>You'll receive a reminder 24 hours before your appointment and another 1 hour before.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render step 3: Confirmation
  const renderStep3 = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Appointment Summary</h2>
            
            {selectedDoctor && selectedDate && selectedTimeSlot && selectedAppointmentType && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <CalendarIcon className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-blue-800">Date & Time</p>
                    <p className="font-semibold text-blue-900">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="font-semibold text-blue-900">
                      {format(parseISO(`2023-01-01T${selectedTimeSlot}`), 'h:mm a')} - {getAppointmentEndTime()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-teal-50 rounded-lg">
                  <User className="w-8 h-8 text-teal-500" />
                  <div>
                    <p className="text-sm text-teal-800">Doctor</p>
                    <p className="font-semibold text-teal-900">{selectedDoctor.name}</p>
                    <p className="text-sm text-teal-700">{selectedDoctor.specialty}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                  <Stethoscope className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-purple-800">Appointment Type</p>
                    <p className="font-semibold text-purple-900">
                      {appointmentTypes.find(t => t.id === selectedAppointmentType)?.name}
                    </p>
                    <p className="text-sm text-purple-700">
                      {appointmentTypes.find(t => t.id === selectedAppointmentType)?.duration} minutes
                    </p>
                  </div>
                </div>
                
                {selectedConsultationType && (
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    {selectedConsultationType === 'video' ? (
                      <Video className="w-8 h-8 text-green-500" />
                    ) : selectedConsultationType === 'phone' ? (
                      <Phone className="w-8 h-8 text-green-500" />
                    ) : (
                      <MapPin className="w-8 h-8 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm text-green-800">Consultation Type</p>
                      <p className="font-semibold text-green-900">
                        {selectedConsultationType === 'video' ? 'Video Call' : 
                         selectedConsultationType === 'phone' ? 'Phone Call' : 
                         'In-Person Visit'}
                      </p>
                    </div>
                  </div>
                )}
                
                {formData.reason && (
                  <div className="flex items-start space-x-4 p-4 bg-amber-50 rounded-lg">
                    <FileText className="w-8 h-8 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800">Reason for Visit</p>
                      <p className="font-semibold text-amber-900">{formData.reason}</p>
                      {formData.notes && (
                        <p className="text-sm text-amber-700 mt-1">{formData.notes}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {formData.symptoms.length > 0 && (
                  <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-800">Symptoms</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.symptoms.map(symptom => (
                          <span 
                            key={symptom}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Consultation Fee</span>
                    <span className="font-semibold text-gray-800">${selectedDoctor.consultation_fee}</span>
                  </div>
                  {selectedAppointmentType === 'emergency' && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Urgent Care Fee</span>
                      <span className="font-semibold text-gray-800">$50</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-blue-600">
                      ${selectedAppointmentType === 'emergency' 
                        ? selectedDoctor.consultation_fee + 50 
                        : selectedDoctor.consultation_fee}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Method</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                <input
                  type="radio"
                  id="insurance"
                  name="paymentMethod"
                  checked
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="insurance" className="flex-1">
                  <div className="font-medium text-gray-800">Insurance</div>
                  <div className="text-sm text-gray-500">
                    {formData.insuranceInfo || 'No insurance information provided'}
                  </div>
                </label>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                <input
                  type="radio"
                  id="credit-card"
                  name="paymentMethod"
                  disabled
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="credit-card" className="flex-1">
                  <div className="font-medium text-gray-800">Credit Card</div>
                  <div className="text-sm text-gray-500">Pay directly with your card</div>
                </label>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Payment will be processed after your appointment.</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Cancellation Policy</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  You can reschedule or cancel your appointment up to 24 hours before the scheduled time without any charges.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  Late cancellations (less than 24 hours before) may incur a fee of 50% of the appointment cost.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  No-shows will be charged the full appointment fee.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Terms & Conditions</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">Privacy Policy</p>
                  <p className="text-sm text-gray-600">
                    Your medical information is protected under our privacy policy and HIPAA regulations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">Medical Records</p>
                  <p className="text-sm text-gray-600">
                    By booking this appointment, you consent to the doctor accessing your medical records.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MessageSquare className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">Communication</p>
                  <p className="text-sm text-gray-600">
                    You agree to receive appointment-related communications via email, SMS, or app notifications.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={true}
                  className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the terms and conditions, privacy policy, and consent to the doctor accessing my medical records for this appointment.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render confirmation screen
  const renderConfirmation = () => {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully booked. We've sent a confirmation to your email and phone.
          </p>
          
          {selectedDoctor && selectedDate && selectedTimeSlot && selectedAppointmentType && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src={selectedDoctor.profile_photo_url} 
                  alt={selectedDoctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedDoctor.name}</h3>
                  <p className="text-teal-600">{selectedDoctor.specialty}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">
                    {format(parseISO(`2023-01-01T${selectedTimeSlot}`), 'h:mm a')} - {getAppointmentEndTime()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Stethoscope className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">
                    {appointmentTypes.find(t => t.id === selectedAppointmentType)?.name}
                  </span>
                </div>
                
                {selectedConsultationType && (
                  <div className="flex items-center space-x-3">
                    {selectedConsultationType === 'video' ? (
                      <Video className="w-5 h-5 text-blue-500" />
                    ) : selectedConsultationType === 'phone' ? (
                      <Phone className="w-5 h-5 text-blue-500" />
                    ) : (
                      <MapPin className="w-5 h-5 text-blue-500" />
                    )}
                    <span className="text-gray-700">
                      {selectedConsultationType === 'video' ? 'Video Call' : 
                       selectedConsultationType === 'phone' ? 'Phone Call' : 
                       'In-Person Visit'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              icon={CalendarIcon}
              onClick={() => navigate('/patient/appointments')}
            >
              View My Appointments
            </Button>
            
            <Button
              variant="outline"
              icon={Send}
              onClick={() => navigate(`/patient/messages/${selectedDoctor?.id}`)}
            >
              Message Doctor
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a8edea] to-[#fed6e3] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Schedule a consultation with your healthcare provider</p>
        </div>
        
        {/* Progress Bar */}
        {!bookingConfirmed && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-2">
              {['Appointment Details', 'Medical Information', 'Review & Confirm'].map((step, index) => (
                <div 
                  key={index} 
                  className={`flex items-center ${index < 2 ? 'flex-1' : ''}`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep > index + 1 
                      ? 'bg-green-500 text-white' 
                      : currentStep === index + 1 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {currentStep > index + 1 ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className={`ml-3 ${index === 2 ? '' : 'flex-1'}`}>
                    <p className={`text-sm font-medium ${
                      currentStep === index + 1 ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {step}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className={`h-1 flex-1 mx-4 rounded-full ${
                      currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Main Content */}
        {bookingConfirmed ? renderConfirmation() : (
          <>
            <div className="mb-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(true)}
                icon={X}
              >
                Cancel
              </Button>
              
              <div className="flex space-x-4">
                {currentStep > 1 && (
                  <Button
                    variant="secondary"
                    onClick={prevStep}
                    icon={ArrowLeft}
                    iconPosition="left"
                  >
                    Back
                  </Button>
                )}
                
                <Button
                  variant="primary"
                  onClick={nextStep}
                  loading={loading}
                  icon={currentStep < 3 ? ArrowRight : Check}
                >
                  {currentStep < 3 ? 'Continue' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking?"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
            >
              Continue Booking
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelBooking}
            >
              Cancel Booking
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to cancel this booking? All your information will be lost.
        </p>
      </Modal>
    </div>
  );
};