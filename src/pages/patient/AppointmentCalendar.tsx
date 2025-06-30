import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Video, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  FileText, 
  MoreHorizontal, 
  Filter, 
  Search, 
  Plus, 
  Check, 
  X, 
  AlertTriangle,
  ArrowRight,
  Calendar as CalendarCheck
} from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addWeeks, 
  subWeeks, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  isSameMonth, 
  getDay, 
  addDays, 
  parseISO, 
  isToday, 
  isBefore,
  addHours,
  setHours,
  setMinutes,
  isWithinInterval
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';

interface Appointment {
  id: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    profile_photo_url?: string;
  };
  date: string; // ISO string
  duration: number; // in minutes
  type: 'video' | 'phone' | 'in_person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'video' | 'phone' | 'in_person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  doctor: {
    id: string;
    name: string;
    specialty: string;
    profile_photo_url?: string;
  };
  reason: string;
  notes?: string;
}

export const AppointmentCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock appointments data
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      doctor: {
        id: '1',
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        profile_photo_url: 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
      duration: 30,
      type: 'video',
      status: 'scheduled',
      reason: 'Follow-up consultation',
      notes: 'Please have your recent test results ready'
    },
    {
      id: '2',
      doctor: {
        id: '2',
        name: 'Dr. Michael Chen',
        specialty: 'General Practice',
        profile_photo_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
      duration: 45,
      type: 'in_person',
      status: 'scheduled',
      reason: 'Annual physical examination',
      notes: 'Fasting required - no food 12 hours before'
    },
    {
      id: '3',
      doctor: {
        id: '3',
        name: 'Dr. Emily Rodriguez',
        specialty: 'Dermatology',
        profile_photo_url: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
      duration: 30,
      type: 'phone',
      status: 'completed',
      reason: 'Skin condition follow-up'
    }
  ];
  
  // Load appointments and convert to calendar events
  useEffect(() => {
    // In a real app, fetch from Supabase
    // const fetchAppointments = async () => {
    //   const { data, error } = await supabase
    //     .from('appointments')
    //     .select(`
    //       id,
    //       appointment_date,
    //       duration_minutes,
    //       consultation_type,
    //       status,
    //       reason,
    //       notes,
    //       doctor:doctor_id(id, name, specialty, profile_photo_url)
    //     `)
    //     .eq('patient_id', user?.id);
    //   
    //   if (error) {
    //     console.error('Error fetching appointments:', error);
    //     return;
    //   }
    //   
    //   setAppointments(data || []);
    // };
    
    // For demo, use mock data
    setAppointments(mockAppointments);
  }, []);
  
  // Convert appointments to calendar events
  useEffect(() => {
    const calendarEvents = appointments.map(appointment => {
      const startDate = new Date(appointment.date);
      const endDate = new Date(startDate.getTime() + appointment.duration * 60000);
      
      return {
        id: appointment.id,
        title: `${appointment.doctor.name} - ${appointment.reason}`,
        start: startDate,
        end: endDate,
        type: appointment.type,
        status: appointment.status,
        doctor: appointment.doctor,
        reason: appointment.reason,
        notes: appointment.notes
      };
    });
    
    setEvents(calendarEvents);
  }, [appointments]);
  
  // Filter events based on search and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Get days for month view
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
  
  // Get days for week view
  const getDaysInWeek = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  };
  
  // Get hours for week view
  const getHoursInDay = () => {
    const hours = [];
    for (let i = 8; i <= 18; i++) {
      hours.push(i);
    }
    return hours;
  };
  
  // Check if a date has events
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.start, date));
  };
  
  // Check if an hour slot has events
  const getEventsForHourSlot = (date: Date, hour: number) => {
    const startTime = setHours(setMinutes(new Date(date), 0), hour);
    const endTime = setHours(setMinutes(new Date(date), 59), hour);
    
    return filteredEvents.filter(event => 
      isWithinInterval(event.start, { start: startTime, end: endTime }) ||
      isWithinInterval(event.end, { start: startTime, end: endTime }) ||
      (isBefore(event.start, startTime) && isBefore(endTime, event.end))
    );
  };
  
  // Handle date navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    }
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };
  
  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    if (!selectedEvent) return;
    
    try {
      // In a real app, update in Supabase
      // const { error } = await supabase
      //   .from('appointments')
      //   .update({ status: 'cancelled' })
      //   .eq('id', selectedEvent.id);
      
      // if (error) throw error;
      
      // Update local state
      setAppointments(prev => 
        prev.map(app => 
          app.id === selectedEvent.id 
            ? { ...app, status: 'cancelled' } 
            : app
        )
      );
      
      setShowCancelModal(false);
      setShowEventModal(false);
      success('Appointment cancelled successfully');
    } catch (err: any) {
      error(err.message || 'Failed to cancel appointment');
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
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
  
  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in_person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };
  
  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-green-600 bg-green-50';
      case 'phone':
        return 'text-blue-600 bg-blue-50';
      case 'in_person':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  // Render month view
  const renderMonthView = () => {
    const days = getDaysInMonth();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
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
            const isCurrentDay = isToday(day);
            const dayEvents = getEventsForDate(day);
            const isPastDay = isBefore(day, new Date()) && !isToday(day);
            
            return (
              <div
                key={i}
                className={`
                  min-h-24 p-1 border rounded-lg transition-all duration-300
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : isCurrentDay
                      ? 'border-blue-300 bg-blue-50'
                      : isCurrentMonth
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                        : 'border-gray-100 bg-gray-50/50 text-gray-400'
                  }
                  ${isPastDay ? 'opacity-60' : ''}
                `}
                onClick={() => handleDateSelect(day)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`
                    text-sm font-medium p-1 rounded-full w-6 h-6 flex items-center justify-center
                    ${isCurrentDay ? 'bg-blue-500 text-white' : 'text-gray-700'}
                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      className={`
                        w-full text-left px-1.5 py-1 rounded text-xs font-medium truncate
                        ${event.status === 'cancelled' ? 'bg-red-100 text-red-800 line-through' : 
                          event.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          'bg-blue-100 text-blue-800'}
                      `}
                    >
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(event.type)}
                        <span className="truncate">{format(event.start, 'h:mm a')}</span>
                      </div>
                      <div className="truncate">{event.doctor.name}</div>
                    </button>
                  ))}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-center text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render week view
  const renderWeekView = () => {
    const days = getDaysInWeek();
    const hours = getHoursInDay();
    
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-center text-sm font-medium text-gray-500">
              Hour
            </div>
            {days.map(day => (
              <div 
                key={day.toString()} 
                className={`
                  text-center p-2 rounded-lg
                  ${isToday(day) ? 'bg-blue-100 text-blue-800' : 'text-gray-700'}
                `}
              >
                <div className="font-medium">{format(day, 'EEE')}</div>
                <div className={`text-sm ${isToday(day) ? 'text-blue-800' : 'text-gray-500'}`}>
                  {format(day, 'MMM d')}
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-1">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 gap-2">
                <div className="text-right pr-2 py-2 text-sm text-gray-500">
                  {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                </div>
                
                {days.map(day => {
                  const events = getEventsForHourSlot(day, hour);
                  const isCurrentHour = isToday(day) && new Date().getHours() === hour;
                  
                  return (
                    <div 
                      key={day.toString()} 
                      className={`
                        border rounded-lg p-1 min-h-16 transition-all
                        ${isCurrentHour ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'}
                      `}
                    >
                      {events.map(event => (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`
                            w-full text-left p-1.5 rounded text-xs font-medium mb-1
                            ${event.status === 'cancelled' ? 'bg-red-100 text-red-800 line-through' : 
                              event.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              'bg-blue-100 text-blue-800'}
                          `}
                        >
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(event.type)}
                            <span>{format(event.start, 'h:mm a')}</span>
                          </div>
                          <div className="truncate">{event.doctor.name}</div>
                          <div className="truncate text-xs opacity-80">{event.reason}</div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render selected date events
  const renderSelectedDateEvents = () => {
    if (!selectedDate) return null;
    
    const events = getEventsForDate(selectedDate);
    
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map(event => (
              <div 
                key={event.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${getTypeColor(event.type)}`}>
                      {getTypeIcon(event.type)}
                    </div>
                    <span className="font-medium text-gray-800">
                      {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                    </span>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(event.status)}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 mb-2">
                  {event.doctor.profile_photo_url ? (
                    <img 
                      src={event.doctor.profile_photo_url} 
                      alt={event.doctor.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-800">{event.doctor.name}</h3>
                    <p className="text-sm text-teal-600">{event.doctor.specialty}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm">{event.reason}</p>
                
                {event.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <p>{event.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments scheduled for this day</p>
            <Button 
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => navigate('/patient/appointment-booking')}
              icon={Plus}
            >
              Book Appointment
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a8edea] to-[#fed6e3] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointment Calendar</h1>
            <p className="text-gray-600">Manage your upcoming and past appointments</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="primary"
              onClick={() => navigate('/patient/appointment-booking')}
              icon={Plus}
            >
              Book Appointment
            </Button>
            
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 ${
                  view === 'month' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 ${
                  view === 'week' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Search appointments, doctors, or reasons..."
              />
            </div>
            
            <div className="flex space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
              
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Calendar Navigation */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-800">
              {view === 'month' 
                ? format(currentDate, 'MMMM yyyy')
                : `Week of ${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
              }
            </h2>
            
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Calendar View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {view === 'month' ? renderMonthView() : renderWeekView()}
          </div>
          
          <div>
            {renderSelectedDateEvents()}
          </div>
        </div>
      </div>
      
      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title="Appointment Details"
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedEvent.doctor.profile_photo_url ? (
                  <img 
                    src={selectedEvent.doctor.profile_photo_url} 
                    alt={selectedEvent.doctor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedEvent.doctor.name}</h3>
                  <p className="text-teal-600">{selectedEvent.doctor.specialty}</p>
                </div>
              </div>
              
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedEvent.status)}`}>
                {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium text-gray-800">
                    {format(selectedEvent.start, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="font-medium text-gray-800">
                    {format(selectedEvent.start, 'h:mm a')} - {format(selectedEvent.end, 'h:mm a')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Reason for Visit</p>
                  <p className="font-medium text-gray-800">{selectedEvent.reason}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {selectedEvent.type === 'video' ? (
                  <Video className="w-5 h-5 text-gray-500" />
                ) : selectedEvent.type === 'phone' ? (
                  <Phone className="w-5 h-5 text-gray-500" />
                ) : (
                  <MapPin className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Consultation Type</p>
                  <p className="font-medium text-gray-800">
                    {selectedEvent.type === 'video' ? 'Video Call' : 
                     selectedEvent.type === 'phone' ? 'Phone Call' : 
                     'In-Person Visit'}
                  </p>
                </div>
              </div>
              
              {selectedEvent.notes && (
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium text-gray-800">{selectedEvent.notes}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              {selectedEvent.status === 'scheduled' && (
                <>
                  {selectedEvent.type === 'video' && isSameDay(selectedEvent.start, new Date()) && (
                    <Button
                      variant="success"
                      icon={Video}
                      onClick={() => {
                        setShowEventModal(false);
                        // In a real app, navigate to video call page
                        success('Joining video call...');
                      }}
                    >
                      Join Call
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    icon={CalendarCheck}
                    onClick={() => {
                      setShowEventModal(false);
                      navigate('/patient/appointment-booking');
                    }}
                  >
                    Reschedule
                  </Button>
                  
                  <Button
                    variant="danger"
                    icon={X}
                    onClick={() => {
                      setShowCancelModal(true);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
              
              {selectedEvent.status === 'completed' && (
                <Button
                  variant="primary"
                  icon={FileText}
                  onClick={() => {
                    setShowEventModal(false);
                    // In a real app, navigate to medical records
                    navigate('/patient/records');
                  }}
                >
                  View Medical Record
                </Button>
              )}
              
              <Button
                variant="secondary"
                icon={MessageSquare}
                onClick={() => {
                  setShowEventModal(false);
                  // In a real app, navigate to messages with this doctor
                  navigate(`/patient/messages/${selectedEvent.doctor.id}`);
                }}
              >
                Message Doctor
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment?"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelAppointment}
            >
              Cancel Appointment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-gray-700">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
          </div>
          
          {selectedEvent && isBefore(new Date(), addHours(selectedEvent.start, 24)) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Cancelling with less than 24 hours notice may incur a cancellation fee.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};