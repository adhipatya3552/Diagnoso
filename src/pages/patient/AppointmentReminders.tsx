import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, CheckCheck, X, AlertTriangle, BarChart3, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { format, isBefore, isToday, addDays, differenceInDays } from 'date-fns';
import { AppointmentReminderDashboard } from '../../components/appointments/AppointmentReminderDashboard';
import { useAuth } from '../../hooks/useAuth';
import { Appointment } from '../../types/appointment';
import { useNotifications } from '../../hooks/useNotifications';

export const AppointmentReminders: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // In a real app, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('appointments')
        //   .select('*')
        //   .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`);
        
        // For demo, use mock data
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            title: 'Annual Check-up',
            patientId: 'patient1',
            patientName: 'John Smith',
            doctorId: 'doctor1',
            doctorName: 'Dr. Sarah Johnson',
            start: addDays(new Date(), 1).setHours(10, 0, 0, 0),
            end: addDays(new Date(), 1).setHours(10, 30, 0, 0),
            type: 'in_person',
            status: 'scheduled',
            location: 'Medical Center, Room 205',
            notes: 'Bring previous test results'
          },
          {
            id: '2',
            title: 'Follow-up Consultation',
            patientId: 'patient1',
            patientName: 'John Smith',
            doctorId: 'doctor1',
            doctorName: 'Dr. Sarah Johnson',
            start: addDays(new Date(), 3).setHours(14, 0, 0, 0),
            end: addDays(new Date(), 3).setHours(14, 30, 0, 0),
            type: 'video',
            status: 'scheduled'
          },
          {
            id: '3',
            title: 'Medication Review',
            patientId: 'patient1',
            patientName: 'John Smith',
            doctorId: 'doctor2',
            doctorName: 'Dr. Michael Chen',
            start: new Date().setHours(new Date().getHours() - 2, 0, 0, 0), // 2 hours ago
            end: new Date().setHours(new Date().getHours() - 1, 30, 0, 0), // 1.5 hours ago
            type: 'phone',
            status: 'scheduled'
          },
          {
            id: '4',
            title: 'Therapy Session',
            patientId: 'patient1',
            patientName: 'John Smith',
            doctorId: 'doctor3',
            doctorName: 'Dr. Emily Rodriguez',
            start: addDays(new Date(), -7).setHours(15, 0, 0, 0), // 7 days ago
            end: addDays(new Date(), -7).setHours(16, 0, 0, 0),
            type: 'in_person',
            status: 'completed',
            location: 'Therapy Center, Suite 102'
          },
          {
            id: '5',
            title: 'Cardiology Consultation',
            patientId: 'patient1',
            patientName: 'John Smith',
            doctorId: 'doctor1',
            doctorName: 'Dr. Sarah Johnson',
            start: addDays(new Date(), -14).setHours(11, 0, 0, 0), // 14 days ago
            end: addDays(new Date(), -14).setHours(11, 45, 0, 0),
            type: 'in_person',
            status: 'completed',
            location: 'Cardiology Department, Room 305'
          }
        ];
        
        setAppointments(mockAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [user]);
  
  // Handle appointment reschedule
  const handleReschedule = (appointment: Appointment) => {
    // In a real app, navigate to reschedule page or open modal
    
    // For demo, show notification
    addNotification({
      title: 'Reschedule Initiated',
      message: `You've started the process to reschedule your appointment with ${appointment.doctorName}`,
      type: 'system'
    });
  };
  
  // Handle appointment cancel
  const handleCancel = (appointment: Appointment) => {
    // In a real app, update appointment status
    
    // For demo, show notification
    addNotification({
      title: 'Appointment Cancelled',
      message: `Your appointment with ${appointment.doctorName} on ${format(new Date(appointment.start), 'MMMM d')} has been cancelled`,
      type: 'appointment'
    });
    
    // Update local state
    setAppointments(prev => 
      prev.map(a => 
        a.id === appointment.id 
          ? { ...a, status: 'cancelled' } 
          : a
      )
    );
  };
  
  // Handle appointment confirm
  const handleConfirm = (appointment: Appointment) => {
    // In a real app, mark appointment as confirmed
    
    // For demo, show notification
    addNotification({
      title: 'Appointment Confirmed',
      message: `You've confirmed your appointment with ${appointment.doctorName} on ${format(new Date(appointment.start), 'MMMM d')}`,
      type: 'appointment'
    });
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Appointment Reminders</h1>
          <p className="text-gray-600 mt-2">Manage your upcoming appointments and follow-ups</p>
        </div>
        
        <AppointmentReminderDashboard
          userRole={user.role as 'doctor' | 'patient'}
          userId={user.id}
          appointments={appointments}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
};