import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, CheckCheck, X, AlertTriangle, BarChart3, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { format, isBefore, isToday, addDays, differenceInDays } from 'date-fns';
import { Button } from '../ui/Button';
import { AppointmentReminder } from './AppointmentReminder';
import { FollowUpSuggestion } from './FollowUpSuggestion';
import { MissedAppointmentHandler } from './MissedAppointmentHandler';
import { WaitlistManager } from './WaitlistManager';
import { Appointment } from '../../types/appointment';
import { useNotifications } from '../../hooks/useNotifications';

interface AppointmentReminderDashboardProps {
  userRole: 'doctor' | 'patient';
  userId: string;
  appointments: Appointment[];
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onConfirm?: (appointment: Appointment) => void;
  className?: string;
}

export const AppointmentReminderDashboard: React.FC<AppointmentReminderDashboardProps> = ({
  userRole,
  userId,
  appointments,
  onReschedule,
  onCancel,
  onConfirm,
  className = ''
}) => {
  const { addNotification } = useNotifications();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [missedAppointments, setMissedAppointments] = useState<Appointment[]>([]);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<Array<{
    appointment: Appointment;
    timeframe: 'days' | 'weeks' | 'months';
    interval: number;
    reason?: string;
  }>>([]);
  const [reminderStats, setReminderStats] = useState({
    totalReminders: 0,
    sentToday: 0,
    confirmationRate: 0,
    noShowRate: 0
  });
  
  // Process appointments
  useEffect(() => {
    const now = new Date();
    
    // Filter upcoming appointments (in the next 7 days)
    const upcoming = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start);
      return (
        appointment.status === 'scheduled' &&
        isAfter(appointmentDate, now) &&
        differenceInDays(appointmentDate, now) <= 7
      );
    });
    
    // Sort by date (closest first)
    upcoming.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    setUpcomingAppointments(upcoming);
    
    // Filter missed appointments (in the past 3 days, status not updated)
    const missed = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start);
      return (
        appointment.status === 'scheduled' &&
        isBefore(appointmentDate, now) &&
        differenceInDays(now, appointmentDate) <= 3
      );
    });
    
    setMissedAppointments(missed);
    
    // Generate follow-up suggestions
    const completedAppointments = appointments.filter(appointment => 
      appointment.status === 'completed' && 
      differenceInDays(now, new Date(appointment.end)) <= 30 // Within the last 30 days
    );
    
    // For demo, create follow-up suggestions for some completed appointments
    const suggestions = completedAppointments.slice(0, 2).map(appointment => {
      // Randomly assign timeframe and interval
      const timeframes: Array<'days' | 'weeks' | 'months'> = ['days', 'weeks', 'months'];
      const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
      
      let interval: number;
      switch (timeframe) {
        case 'days':
          interval = Math.floor(Math.random() * 6) + 2; // 2-7 days
          break;
        case 'weeks':
          interval = Math.floor(Math.random() * 3) + 1; // 1-3 weeks
          break;
        case 'months':
          interval = Math.floor(Math.random() * 2) + 1; // 1-2 months
          break;
        default:
          interval = 2; // Default to 2 weeks
          break;
      }
      
      return {
        appointment,
        timeframe,
        interval,
        reason: 'Follow-up to monitor progress and adjust treatment as needed.'
      };
    });
    
    setFollowUpSuggestions(suggestions);
    
    // Calculate stats
    setReminderStats({
      totalReminders: appointments.length,
      sentToday: Math.floor(Math.random() * 10) + 5, // Random number for demo
      confirmationRate: Math.floor(Math.random() * 30) + 70, // 70-99%
      noShowRate: Math.floor(Math.random() * 10) + 1 // 1-10%
    });
  }, [appointments]);
  
  // Handle follow-up acceptance
  const handleFollowUpAccept = (appointment: Appointment, date: Date) => {
    // In a real app, create a new appointment
    
    // For demo, show notification
    addNotification({
      title: 'Follow-Up Scheduled',
      message: `A follow-up appointment with ${appointment.doctorName} has been scheduled for ${format(date, 'MMMM d, yyyy')}`,
      type: 'appointment',
      link: '/patient/appointments'
    });
    
    // Remove from suggestions
    setFollowUpSuggestions(prev => 
      prev.filter(suggestion => suggestion.appointment.id !== appointment.id)
    );
  };
  
  // Handle follow-up decline
  const handleFollowUpDecline = (appointment: Appointment) => {
    // In a real app, mark suggestion as declined
    
    // For demo, remove from suggestions
    setFollowUpSuggestions(prev => 
      prev.filter(suggestion => suggestion.appointment.id !== appointment.id)
    );
  };
  
  // Handle missed appointment reschedule
  const handleMissedReschedule = (appointment: Appointment, slot: { start: Date; end: Date }) => {
    // In a real app, create a new appointment and update the missed one
    
    // For demo, show notification and remove from missed
    addNotification({
      title: 'Appointment Rescheduled',
      message: `Your missed appointment has been rescheduled for ${format(slot.start, 'MMMM d')} at ${format(slot.start, 'h:mm a')}`,
      type: 'appointment',
      link: '/patient/appointments'
    });
    
    setMissedAppointments(prev => 
      prev.filter(a => a.id !== appointment.id)
    );
  };
  
  // Handle missed appointment cancel
  const handleMissedCancel = (appointment: Appointment) => {
    // In a real app, update appointment status
    
    // For demo, remove from missed
    setMissedAppointments(prev => 
      prev.filter(a => a.id !== appointment.id)
    );
  };
  
  // Handle missed appointment ignore
  const handleMissedIgnore = (appointment: Appointment) => {
    // In a real app, mark as acknowledged
    
    // For demo, remove from missed
    setMissedAppointments(prev => 
      prev.filter(a => a.id !== appointment.id)
    );
  };
  
  // Check if date is after now
  const isAfter = (date: Date, compareDate: Date) => {
    return date.getTime() > compareDate.getTime();
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats (for doctors only) */}
      {userRole === 'doctor' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reminders</p>
                <p className="text-2xl font-bold text-gray-800">{reminderStats.totalReminders}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sent Today</p>
                <p className="text-2xl font-bold text-gray-800">{reminderStats.sentToday}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Confirmation Rate</p>
                <p className="text-2xl font-bold text-gray-800">{reminderStats.confirmationRate}%</p>
              </div>
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-teal-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">No-Show Rate</p>
                <p className="text-2xl font-bold text-gray-800">{reminderStats.noShowRate}%</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
            Upcoming Appointments
          </h2>
          
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <AppointmentReminder
                key={appointment.id}
                appointment={appointment}
                onReschedule={onReschedule ? () => onReschedule(appointment) : undefined}
                onCancel={onCancel ? () => onCancel(appointment) : undefined}
                onConfirm={onConfirm ? () => onConfirm(appointment) : undefined}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Missed Appointments */}
      {missedAppointments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Missed Appointments
          </h2>
          
          <div className="space-y-4">
            {missedAppointments.map(appointment => (
              <MissedAppointmentHandler
                key={appointment.id}
                appointment={appointment}
                onReschedule={(slot) => handleMissedReschedule(appointment, slot)}
                onCancel={() => handleMissedCancel(appointment)}
                onIgnore={() => handleMissedIgnore(appointment)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Follow-Up Suggestions */}
      {followUpSuggestions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 text-green-500 mr-2" />
            Recommended Follow-Ups
          </h2>
          
          <div className="space-y-4">
            {followUpSuggestions.map((suggestion, index) => (
              <FollowUpSuggestion
                key={index}
                previousAppointment={suggestion.appointment}
                suggestedTimeframe={suggestion.timeframe}
                suggestedInterval={suggestion.interval}
                reason={suggestion.reason}
                onAccept={(date) => handleFollowUpAccept(suggestion.appointment, date)}
                onDecline={() => handleFollowUpDecline(suggestion.appointment)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Waitlist Manager (for doctors only) */}
      {userRole === 'doctor' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 text-purple-500 mr-2" />
            Waitlist Management
          </h2>
          
          <WaitlistManager doctorId={userId} />
        </div>
      )}
    </div>
  );
};