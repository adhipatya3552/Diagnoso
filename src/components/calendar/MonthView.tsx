import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addDays, 
  getDay, 
  isAfter, 
  isBefore 
} from 'date-fns';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Appointment } from '../../types/appointment';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  userRole: 'doctor' | 'patient';
  userId: string;
  isDragging: boolean;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  appointments,
  onDateSelect,
  onAppointmentClick,
  userRole,
  userId,
  isDragging
}) => {
  // Get days for the month view (including days from prev/next months to fill the grid)
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  };
  
  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.start), date)
    );
  };
  
  // Get appointment color based on type
  const getAppointmentColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'phone':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_person':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get appointment status color
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
  
  // Draggable appointment component
  const DraggableAppointment = ({ appointment }: { appointment: Appointment }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: appointment.id,
      data: {
        appointment
      }
    });
    
    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
    
    // Only allow dragging for scheduled appointments and if user is the doctor or the appointment owner
    const canDrag = appointment.status === 'scheduled' && 
      (userRole === 'doctor' || (userRole === 'patient' && appointment.patientId === userId));
    
    return (
      <div
        ref={canDrag ? setNodeRef : undefined}
        {...(canDrag ? attributes : {})}
        {...(canDrag ? listeners : {})}
        style={style}
        className={`px-2 py-1 rounded-lg text-xs mb-1 truncate border ${getAppointmentColor(appointment.type)} ${
          canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onAppointmentClick(appointment);
        }}
      >
        {format(new Date(appointment.start), 'h:mm a')} - {appointment.title}
      </div>
    );
  };
  
  // Droppable date cell component
  const DroppableCell = ({ date, children }: { date: Date, children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({
      id: `slot-${format(date, 'yyyy-MM-dd')}T09:00:00`,
      data: {
        date
      }
    });
    
    return (
      <div ref={setNodeRef} className="h-full">
        {children}
      </div>
    );
  };
  
  const days = getDaysInMonth();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {dayNames.map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 grid-rows-6 gap-px bg-gray-200 h-[calc(100%-40px)]">
        {days.map((day, i) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, currentDate);
          const isCurrentDay = isToday(day);
          const isPastDay = isBefore(day, new Date()) && !isToday(day);
          
          return (
            <DroppableCell key={i} date={day}>
              <div
                className={`h-full min-h-24 p-1 bg-white transition-all duration-300 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 z-10' 
                    : isCurrentDay
                      ? 'ring-2 ring-blue-200'
                      : ''
                } ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${
                  isPastDay ? 'bg-gray-50/80' : ''
                }`}
                onClick={() => onDateSelect(day)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`
                    text-sm font-medium p-1 rounded-full w-6 h-6 flex items-center justify-center
                    ${isCurrentDay ? 'bg-blue-500 text-white' : 'text-gray-700'}
                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  {dayAppointments.length > 0 && (
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-[calc(100%-24px)]">
                  {dayAppointments.slice(0, 3).map(appointment => (
                    <DraggableAppointment key={appointment.id} appointment={appointment} />
                  ))}
                  
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-center text-gray-500">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </DroppableCell>
          );
        })}
      </div>
    </div>
  );
};