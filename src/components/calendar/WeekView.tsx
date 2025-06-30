import React from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMinutes, 
  setHours, 
  setMinutes, 
  isWithinInterval, 
  isSameDay, 
  isToday,
  isBefore,
  areIntervalsOverlapping
} from 'date-fns';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Appointment } from '../../types/appointment';

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onSlotSelect: (start: Date, end: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  userRole: 'doctor' | 'patient';
  userId: string;
  isDragging: boolean;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  appointments,
  onSlotSelect,
  onAppointmentClick,
  userRole,
  userId,
  isDragging
}) => {
  // Get days of the week
  const days = eachDayOfInterval({
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate)
  });
  
  // Generate time slots (7am to 7pm in 30-minute increments)
  const timeSlots = [];
  for (let hour = 7; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeSlots.push({ hour, minute });
    }
  }
  
  // Get appointments for a specific day and time slot
  const getAppointmentsForTimeSlot = (day: Date, hour: number, minute: number) => {
    const slotStart = setMinutes(setHours(day, hour), minute);
    const slotEnd = addMinutes(slotStart, 30);
    
    return appointments.filter(appointment => {
      const appointmentStart = new Date(appointment.start);
      const appointmentEnd = new Date(appointment.end);
      
      return areIntervalsOverlapping(
        { start: slotStart, end: slotEnd },
        { start: appointmentStart, end: appointmentEnd }
      );
    });
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
  
  // Calculate appointment position and height
  const getAppointmentStyle = (appointment: Appointment) => {
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    
    // Calculate duration in minutes
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Calculate height based on duration (30 minutes = 60px)
    const height = (durationMinutes / 30) * 60;
    
    // Calculate top position based on start time
    const startMinutesSinceMidnight = start.getHours() * 60 + start.getMinutes();
    const topOffset = ((startMinutesSinceMidnight - 7 * 60) / 30) * 60;
    
    return {
      height: `${height}px`,
      top: `${topOffset}px`
    };
  };
  
  // Draggable appointment component
  const DraggableAppointment = ({ appointment, dayIndex }: { appointment: Appointment, dayIndex: number }) => {
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
    
    const appointmentStyle = getAppointmentStyle(appointment);
    
    return (
      <div
        ref={canDrag ? setNodeRef : undefined}
        {...(canDrag ? attributes : {})}
        {...(canDrag ? listeners : {})}
        style={{
          ...appointmentStyle,
          ...(style || {}),
          position: 'absolute',
          width: 'calc(100% - 8px)',
          left: '4px',
          zIndex: 10
        }}
        className={`p-2 rounded-lg border text-xs overflow-hidden ${getAppointmentColor(appointment.type)} ${
          canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onAppointmentClick(appointment);
        }}
      >
        <p className="font-medium truncate">{appointment.title}</p>
        <p className="truncate">{format(new Date(appointment.start), 'h:mm a')} - {format(new Date(appointment.end), 'h:mm a')}</p>
        <p className="truncate">{userRole === 'doctor' ? appointment.patientName : appointment.doctorName}</p>
      </div>
    );
  };
  
  // Droppable time slot component
  const DroppableTimeSlot = ({ day, hour, minute, children }: { 
    day: Date, 
    hour: number, 
    minute: number,
    children: React.ReactNode
  }) => {
    const slotStart = setMinutes(setHours(day, hour), minute);
    const slotId = `slot-${format(slotStart, "yyyy-MM-dd'T'HH:mm:ss")}`;
    
    const { setNodeRef } = useDroppable({
      id: slotId,
      data: {
        day,
        hour,
        minute,
        start: slotStart,
        end: addMinutes(slotStart, 30)
      }
    });
    
    return (
      <div ref={setNodeRef} className="h-full">
        {children}
      </div>
    );
  };
  
  return (
    <div className="h-[calc(100vh-300px)] min-h-[600px] overflow-auto">
      <div className="relative">
        {/* Header with days */}
        <div className="sticky top-0 z-20 grid grid-cols-8 bg-white border-b border-gray-200">
          <div className="p-2 text-center text-sm font-medium text-gray-500 border-r border-gray-200">
            Time
          </div>
          {days.map((day, i) => (
            <div 
              key={i} 
              className={`p-2 text-center border-r border-gray-200 ${
                isToday(day) ? 'bg-blue-50' : ''
              }`}
            >
              <p className="font-medium text-gray-800">{format(day, 'EEE')}</p>
              <p className={`text-sm ${isToday(day) ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {format(day, 'MMM d')}
              </p>
            </div>
          ))}
        </div>
        
        {/* Time grid */}
        <div className="grid grid-cols-8">
          {/* Time labels */}
          <div className="col-span-1">
            {timeSlots.map((slot, i) => (
              <div 
                key={i} 
                className="h-[60px] border-b border-r border-gray-200 p-1 text-right pr-2"
              >
                <span className="text-xs text-gray-500">
                  {format(setMinutes(setHours(new Date(), slot.hour), slot.minute), 'h:mm a')}
                </span>
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="col-span-1 relative">
              {timeSlots.map((slot, slotIndex) => {
                const slotStart = setMinutes(setHours(day, slot.hour), slot.minute);
                const slotEnd = addMinutes(slotStart, 30);
                const isPast = isBefore(slotEnd, new Date());
                
                return (
                  <DroppableTimeSlot
                    key={slotIndex}
                    day={day}
                    hour={slot.hour}
                    minute={slot.minute}
                  >
                    <div 
                      className={`h-[60px] border-b border-r border-gray-200 ${
                        isToday(day) ? 'bg-blue-50/30' : ''
                      } ${
                        isPast && isToday(day) ? 'bg-gray-50/50' : ''
                      } hover:bg-blue-50/50 transition-colors`}
                      onClick={() => onSlotSelect(slotStart, slotEnd)}
                    >
                      {/* Slot content */}
                    </div>
                  </DroppableTimeSlot>
                );
              })}
              
              {/* Appointments */}
              {appointments
                .filter(appointment => isSameDay(new Date(appointment.start), day))
                .map(appointment => (
                  <DraggableAppointment 
                    key={appointment.id} 
                    appointment={appointment}
                    dayIndex={dayIndex}
                  />
                ))
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};