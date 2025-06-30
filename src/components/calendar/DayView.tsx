import React from 'react';
import { 
  format, 
  addMinutes, 
  setHours, 
  setMinutes, 
  isWithinInterval, 
  isBefore,
  areIntervalsOverlapping
} from 'date-fns';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Appointment } from '../../types/appointment';

interface DayViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onSlotSelect: (start: Date, end: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  userRole: 'doctor' | 'patient';
  userId: string;
  isDragging: boolean;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  appointments,
  onSlotSelect,
  onAppointmentClick,
  userRole,
  userId,
  isDragging
}) => {
  // Generate time slots (7am to 7pm in 15-minute increments)
  const timeSlots = [];
  for (let hour = 7; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      timeSlots.push({ hour, minute });
    }
  }
  
  // Get appointments for a specific time slot
  const getAppointmentsForTimeSlot = (hour: number, minute: number) => {
    const slotStart = setMinutes(setHours(currentDate, hour), minute);
    const slotEnd = addMinutes(slotStart, 15);
    
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
  
  // Calculate appointment position and height
  const getAppointmentStyle = (appointment: Appointment) => {
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    
    // Calculate duration in minutes
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Calculate height based on duration (15 minutes = 30px)
    const height = (durationMinutes / 15) * 30;
    
    // Calculate top position based on start time
    const startMinutesSinceMidnight = start.getHours() * 60 + start.getMinutes();
    const topOffset = ((startMinutesSinceMidnight - 7 * 60) / 15) * 30;
    
    return {
      height: `${height}px`,
      top: `${topOffset}px`
    };
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
          width: 'calc(100% - 16px)',
          left: '8px',
          zIndex: 10
        }}
        className={`p-3 rounded-lg border ${getAppointmentColor(appointment.type)} ${
          canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onAppointmentClick(appointment);
        }}
      >
        <p className="font-medium">{appointment.title}</p>
        <p className="text-sm">{format(new Date(appointment.start), 'h:mm a')} - {format(new Date(appointment.end), 'h:mm a')}</p>
        <p className="text-sm">{userRole === 'doctor' ? appointment.patientName : appointment.doctorName}</p>
      </div>
    );
  };
  
  // Droppable time slot component
  const DroppableTimeSlot = ({ hour, minute, children }: { 
    hour: number, 
    minute: number,
    children: React.ReactNode
  }) => {
    const slotStart = setMinutes(setHours(currentDate, hour), minute);
    const slotId = `slot-${format(slotStart, "yyyy-MM-dd'T'HH:mm:ss")}`;
    
    const { setNodeRef } = useDroppable({
      id: slotId,
      data: {
        hour,
        minute,
        start: slotStart,
        end: addMinutes(slotStart, 15)
      }
    });
    
    return (
      <div ref={setNodeRef} className="h-full">
        {children}
      </div>
    );
  };
  
  // Group appointments to handle overlapping
  const appointmentsForDay = appointments.filter(appointment => 
    format(new Date(appointment.start), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  );
  
  return (
    <div className="h-[calc(100vh-300px)] min-h-[600px] overflow-auto">
      <div className="relative">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-800">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        
        {/* Time grid */}
        <div className="grid grid-cols-[80px_1fr]">
          {/* Time labels */}
          <div className="col-span-1">
            {timeSlots.map((slot, i) => (
              <div 
                key={i} 
                className="h-[30px] border-b border-r border-gray-200 p-1 text-right pr-2"
              >
                {slot.minute === 0 && (
                  <span className="text-xs text-gray-500">
                    {format(setMinutes(setHours(new Date(), slot.hour), slot.minute), 'h:mm a')}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Appointment column */}
          <div className="col-span-1 relative">
            {timeSlots.map((slot, i) => {
              const slotStart = setMinutes(setHours(currentDate, slot.hour), slot.minute);
              const slotEnd = addMinutes(slotStart, 15);
              const isPast = isBefore(slotEnd, new Date());
              
              return (
                <DroppableTimeSlot
                  key={i}
                  hour={slot.hour}
                  minute={slot.minute}
                >
                  <div 
                    className={`h-[30px] border-b border-gray-200 ${
                      slot.minute % 60 === 0 ? 'border-t border-gray-300 bg-gray-50/50' : ''
                    } ${
                      isPast ? 'bg-gray-50/30' : ''
                    } hover:bg-blue-50/50 transition-colors`}
                    onClick={() => onSlotSelect(slotStart, addMinutes(slotStart, 30))}
                  >
                    {/* Slot content */}
                  </div>
                </DroppableTimeSlot>
              );
            })}
            
            {/* Appointments */}
            {appointmentsForDay.map(appointment => (
              <DraggableAppointment 
                key={appointment.id} 
                appointment={appointment}
              />
            ))}
            
            {/* Current time indicator */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
              style={{
                top: `${((new Date().getHours() - 7) * 60 + new Date().getMinutes()) / 15 * 30}px`
              }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full -mt-1.5 -ml-1.5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};