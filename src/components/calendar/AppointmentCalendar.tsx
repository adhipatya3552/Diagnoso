import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfDay,
  endOfDay,
  addDays, 
  isSameDay, 
  isSameMonth, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  getDay, 
  isToday,
  parseISO,
  addMinutes,
  setHours,
  setMinutes,
  isWithinInterval,
  isBefore,
  isAfter,
  addWeeks,
  subWeeks
} from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  User, 
  Video, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  X,
  Check,
  Filter,
  Search,
  Grid,
  List,
  LayoutList
} from 'lucide-react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { Button } from '../ui/Button';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentDetails } from './AppointmentDetails';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';
import { useAppointments } from '../../hooks/useAppointments';
import { Appointment, AppointmentType, AppointmentStatus } from '../../types/appointment';

interface AppointmentCalendarProps {
  userRole: 'doctor' | 'patient';
  userId: string;
  className?: string;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  userRole,
  userId,
  className = ''
}) => {
  const { 
    appointments, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
    checkForConflicts,
    loading 
  } = useAppointments(userRole, userId);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Modal state
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AppointmentType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Drag and drop state
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Navigate to previous period
  const prevPeriod = () => {
    switch (view) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, -1));
        break;
      default:
        break;
    }
  };
  
  // Navigate to next period
  const nextPeriod = () => {
    switch (view) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      default:
        break;
    }
  };
  
  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (view === 'month') {
      setView('day');
      setCurrentDate(date);
    }
  };
  
  // Handle time slot selection
  const handleSlotSelect = (start: Date, end: Date) => {
    setSelectedSlot({ start, end });
    setShowAppointmentForm(true);
  };
  
  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const appointment = appointments.find(app => app.id === active.id);
    if (appointment) {
      setActiveAppointment(appointment);
      setIsDragging(true);
    }
  };
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveAppointment(null);
    
    if (!over) return;
    
    // Get the appointment being dragged
    const appointment = appointments.find(app => app.id === active.id);
    if (!appointment) return;
    
    // Get the new time slot from the over id (format: "slot-YYYY-MM-DDTHH:MM")
    const overId = String(over.id);
    if (!overId.startsWith('slot-')) return;
    
    const dateTimeStr = overId.substring(5);
    const newStart = new Date(dateTimeStr);
    
    // Calculate duration of the original appointment
    const originalDuration = appointment.end.getTime() - appointment.start.getTime();
    const newEnd = new Date(newStart.getTime() + originalDuration);
    
    // Check for conflicts
    const conflicts = checkForConflicts({
      ...appointment,
      start: newStart,
      end: newEnd
    });
    
    if (conflicts.length > 0) {
      alert('This time slot conflicts with an existing appointment.');
      return;
    }
    
    // Update the appointment
    updateAppointment({
      ...appointment,
      start: newStart,
      end: newEnd
    });
  };
  
  // Handle appointment form submission
  const handleAppointmentSubmit = (appointmentData: Omit<Appointment, 'id'>) => {
    // Check for conflicts
    const conflicts = checkForConflicts(appointmentData);
    
    if (conflicts.length > 0) {
      alert('This appointment conflicts with an existing appointment.');
      return;
    }
    
    if (selectedAppointment) {
      // Update existing appointment
      updateAppointment({
        ...appointmentData,
        id: selectedAppointment.id
      });
    } else {
      // Add new appointment
      addAppointment(appointmentData);
    }
    
    setShowAppointmentForm(false);
    setSelectedAppointment(null);
    setSelectedSlot(null);
  };
  
  // Handle appointment edit
  const handleEditAppointment = () => {
    if (selectedAppointment) {
      setShowAppointmentDetails(false);
      setShowAppointmentForm(true);
    }
  };
  
  // Handle appointment delete
  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      deleteAppointment(selectedAppointment.id);
      setShowAppointmentDetails(false);
      setSelectedAppointment(null);
    }
  };
  
  // Get view title
  const getViewTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'agenda':
        return 'Upcoming Appointments';
      default:
        return '';
    }
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointment Calendar</h1>
            <p className="text-gray-600">Manage your schedule and appointments</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => {
                setSelectedAppointment(null);
                setSelectedSlot(null);
                setShowAppointmentForm(true);
              }}
              icon={Plus}
            >
              New Appointment
            </Button>
            
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-2 ${
                  view === 'month' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-2 ${
                  view === 'week' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-2 ${
                  view === 'day' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setView('agenda')}
                className={`px-3 py-2 ${
                  view === 'agenda' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Agenda
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
                placeholder="Search appointments, patients, or doctors..."
              />
            </div>
            
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as AppointmentType | 'all')}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="phone">Phone</option>
                <option value="in_person">In Person</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="all">Any Duration</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                    className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Calendar Navigation */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPeriod}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Today
              </button>
              
              <button
                onClick={nextPeriod}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800">
              {getViewTitle()}
            </h2>
            
            <div className="flex items-center space-x-2">
              {/* Additional controls can go here */}
            </div>
          </div>
        </div>
        
        {/* Calendar View */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
            {view === 'month' && (
              <MonthView
                currentDate={currentDate}
                appointments={filteredAppointments}
                onDateSelect={handleDateSelect}
                onAppointmentClick={handleAppointmentClick}
                userRole={userRole}
                userId={userId}
                isDragging={isDragging}
              />
            )}
            
            {view === 'week' && (
              <WeekView
                currentDate={currentDate}
                appointments={filteredAppointments}
                onSlotSelect={handleSlotSelect}
                onAppointmentClick={handleAppointmentClick}
                userRole={userRole}
                userId={userId}
                isDragging={isDragging}
              />
            )}
            
            {view === 'day' && (
              <DayView
                currentDate={currentDate}
                appointments={filteredAppointments}
                onSlotSelect={handleSlotSelect}
                onAppointmentClick={handleAppointmentClick}
                userRole={userRole}
                userId={userId}
                isDragging={isDragging}
              />
            )}
            
            {view === 'agenda' && (
              <AgendaView
                appointments={filteredAppointments}
                onAppointmentClick={handleAppointmentClick}
                userRole={userRole}
                userId={userId}
              />
            )}
          </div>
          
          {/* Drag overlay */}
          <DragOverlay>
            {activeAppointment && (
              <div className="p-2 bg-blue-100 border border-blue-300 rounded-lg shadow-md opacity-80 pointer-events-none">
                <p className="font-medium text-blue-800 truncate">{activeAppointment.title}</p>
                <p className="text-xs text-blue-600">
                  {format(activeAppointment.start, 'h:mm a')} - {format(activeAppointment.end, 'h:mm a')}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
      
      {/* Appointment Form Modal */}
      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={() => {
          setShowAppointmentForm(false);
          setSelectedAppointment(null);
          setSelectedSlot(null);
        }}
        onSubmit={handleAppointmentSubmit}
        appointment={selectedAppointment}
        initialSlot={selectedSlot}
        userRole={userRole}
        userId={userId}
      />
      
      {/* Appointment Details Modal */}
      <AppointmentDetails
        isOpen={showAppointmentDetails}
        onClose={() => {
          setShowAppointmentDetails(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
        userRole={userRole}
      />
    </div>
  );
};