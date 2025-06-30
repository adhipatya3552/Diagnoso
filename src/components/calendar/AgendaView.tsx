import React from 'react';
import { format, isToday, isTomorrow, isPast, isFuture, addDays } from 'date-fns';
import { Video, Phone, MapPin, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { Appointment } from '../../types/appointment';

interface AgendaViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  userRole: 'doctor' | 'patient';
  userId: string;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  appointments,
  onAppointmentClick,
  userRole,
  userId
}) => {
  // Group appointments by date
  const groupedAppointments: Record<string, Appointment[]> = {};
  
  // Sort appointments by date and time
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  
  // Group appointments by date
  sortedAppointments.forEach(appointment => {
    const dateKey = format(new Date(appointment.start), 'yyyy-MM-dd');
    if (!groupedAppointments[dateKey]) {
      groupedAppointments[dateKey] = [];
    }
    groupedAppointments[dateKey].push(appointment);
  });
  
  // Get appointment type icon
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-green-600" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'in_person':
        return <MapPin className="w-4 h-4 text-purple-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
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
  
  // Format date for display
  const formatDateHeading = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  };
  
  // Separate past and future appointments
  const pastDates = Object.keys(groupedAppointments)
    .filter(dateKey => isPast(new Date(dateKey)) && !isToday(new Date(dateKey)))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Most recent first
  
  const futureDates = Object.keys(groupedAppointments)
    .filter(dateKey => isFuture(new Date(dateKey)) || isToday(new Date(dateKey)))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // Chronological
  
  return (
    <div className="p-6 h-[calc(100vh-300px)] min-h-[600px] overflow-auto">
      {/* Upcoming Appointments */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h3>
        
        {futureDates.length > 0 ? (
          <div className="space-y-6">
            {futureDates.map(dateKey => (
              <div key={dateKey}>
                <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                  {formatDateHeading(dateKey)}
                </h4>
                
                <div className="space-y-3">
                  {groupedAppointments[dateKey].map(appointment => (
                    <div
                      key={appointment.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => onAppointmentClick(appointment)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            appointment.type === 'video' ? 'bg-green-100' :
                            appointment.type === 'phone' ? 'bg-blue-100' :
                            'bg-purple-100'
                          }`}>
                            {getAppointmentTypeIcon(appointment.type)}
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-800">{appointment.title}</h5>
                            <p className="text-sm text-gray-600">
                              {userRole === 'doctor' ? appointment.patientName : appointment.doctorName}
                            </p>
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {format(new Date(appointment.start), 'h:mm a')} - {format(new Date(appointment.end), 'h:mm a')}
                              </div>
                              
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {userRole === 'doctor' ? 'Patient' : 'Doctor'}: {userRole === 'doctor' ? appointment.patientName : appointment.doctorName}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        )}
      </div>
      
      {/* Past Appointments */}
      {pastDates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Past Appointments</h3>
          
          <div className="space-y-6">
            {pastDates.slice(0, 3).map(dateKey => (
              <div key={dateKey}>
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                </h4>
                
                <div className="space-y-3">
                  {groupedAppointments[dateKey].map(appointment => (
                    <div
                      key={appointment.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer opacity-80"
                      onClick={() => onAppointmentClick(appointment)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            appointment.type === 'video' ? 'bg-green-100' :
                            appointment.type === 'phone' ? 'bg-blue-100' :
                            'bg-purple-100'
                          }`}>
                            {getAppointmentTypeIcon(appointment.type)}
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-800">{appointment.title}</h5>
                            <p className="text-sm text-gray-600">
                              {userRole === 'doctor' ? appointment.patientName : appointment.doctorName}
                            </p>
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {format(new Date(appointment.start), 'h:mm a')} - {format(new Date(appointment.end), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {pastDates.length > 3 && (
              <div className="text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View more past appointments
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {pastDates.length === 0 && futureDates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Appointments Found</h3>
          <p className="text-gray-600 mb-6">
            You don't have any appointments scheduled. Create a new appointment to get started.
          </p>
        </div>
      )}
    </div>
  );
};