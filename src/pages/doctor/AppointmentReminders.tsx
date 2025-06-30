import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, CheckCheck, X, AlertTriangle, BarChart3, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { format, isBefore, isToday, addDays, differenceInDays } from 'date-fns';
import { AppointmentReminderDashboard } from '../../components/appointments/AppointmentReminderDashboard';
import { useAuth } from '../../hooks/useAuth';
import { Appointment } from '../../types/appointment';
import { useNotifications } from '../../hooks/useNotifications';
import { Button } from '../../components/ui/Button';

export const AppointmentReminders: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
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
        //   .eq('doctor_id', user.id);
        
        // For demo, use mock data
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            title: 'Annual Check-up',
            patientId: 'patient1',
            patientName: 'John Smith',
            doctorId: user.id,
            doctorName: user.name,
            start: addDays(new Date(), 1).setHours(10, 0, 0, 0),
            end: addDays(new Date(), 1).setHours(10, 30, 0, 0),
            type: 'in_person',
            status: 'scheduled',
            location: 'Medical Center, Room 205',
            notes: 'Patient has history of hypertension'
          },
          {
            id: '2',
            title: 'Follow-up Consultation',
            patientId: 'patient2',
            patientName: 'Maria Garcia',
            doctorId: user.id,
            doctorName: user.name,
            start: addDays(new Date(), 2).setHours(14, 0, 0, 0),
            end: addDays(new Date(), 2).setHours(14, 30, 0, 0),
            type: 'video',
            status: 'scheduled'
          },
          {
            id: '3',
            title: 'Medication Review',
            patientId: 'patient3',
            patientName: 'David Wilson',
            doctorId: user.id,
            doctorName: user.name,
            start: new Date().setHours(new Date().getHours() - 2, 0, 0, 0), // 2 hours ago
            end: new Date().setHours(new Date().getHours() - 1, 30, 0, 0), // 1.5 hours ago
            type: 'phone',
            status: 'scheduled'
          },
          {
            id: '4',
            title: 'Therapy Session',
            patientId: 'patient4',
            patientName: 'Emily Johnson',
            doctorId: user.id,
            doctorName: user.name,
            start: addDays(new Date(), -7).setHours(15, 0, 0, 0), // 7 days ago
            end: addDays(new Date(), -7).setHours(16, 0, 0, 0),
            type: 'in_person',
            status: 'completed',
            location: 'Therapy Center, Suite 102'
          },
          {
            id: '5',
            title: 'Cardiology Consultation',
            patientId: 'patient5',
            patientName: 'Robert Brown',
            doctorId: user.id,
            doctorName: user.name,
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
      title: 'Appointment Rescheduled',
      message: `The appointment with ${appointment.patientName} has been rescheduled`,
      type: 'system'
    });
  };
  
  // Handle appointment cancel
  const handleCancel = (appointment: Appointment) => {
    // In a real app, update appointment status
    
    // For demo, show notification
    addNotification({
      title: 'Appointment Cancelled',
      message: `The appointment with ${appointment.patientName} on ${format(new Date(appointment.start), 'MMMM d')} has been cancelled`,
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
      message: `The appointment with ${appointment.patientName} on ${format(new Date(appointment.start), 'MMMM d')} has been confirmed`,
      type: 'appointment'
    });
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Appointment Management</h1>
            <p className="text-gray-600 mt-2">Manage reminders, follow-ups, and waitlist</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
              icon={BarChart3}
            >
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Button>
            
            <Button
              variant="primary"
              onClick={() => window.location.href = '/doctor/calendar'}
              icon={Calendar}
            >
              View Calendar
            </Button>
          </div>
        </div>
        
        {/* Analytics */}
        {showAnalytics && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
                Appointment Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">Confirmation Rate</h3>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-blue-900">87%</p>
                    <div className="flex items-center text-green-600">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">+3%</span>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">Attendance Rate</h3>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-green-900">92%</p>
                    <div className="flex items-center text-green-600">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">+5%</span>
                    </div>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h3 className="font-medium text-red-800 mb-2">No-Show Rate</h3>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-red-900">8%</p>
                    <div className="flex items-center text-green-600">
                      <ArrowDown className="w-4 h-4 mr-1" />
                      <span className="text-sm">-2%</span>
                    </div>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-medium text-purple-800 mb-2">Waitlist Conversion</h3>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-purple-900">65%</p>
                    <div className="flex items-center text-red-600">
                      <ArrowDown className="w-4 h-4 mr-1" />
                      <span className="text-sm">-3%</span>
                    </div>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Reminder Effectiveness</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">24-hour reminder</span>
                        <span className="text-sm font-medium text-gray-800">95%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">2-hour reminder</span>
                        <span className="text-sm font-medium text-gray-800">98%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">SMS reminders</span>
                        <span className="text-sm font-medium text-gray-800">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Email reminders</span>
                        <span className="text-sm font-medium text-gray-800">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Appointment Distribution</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Video calls</span>
                        <span className="text-sm font-medium text-gray-800">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">In-person visits</span>
                        <span className="text-sm font-medium text-gray-800">35%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Phone calls</span>
                        <span className="text-sm font-medium text-gray-800">20%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Reschedule rate</span>
                        <span className="text-sm font-medium text-gray-800">12%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <AppointmentReminderDashboard
          userRole="doctor"
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