import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { Appointment } from '../types/appointment';
import { areIntervalsOverlapping } from 'date-fns';

export const useAppointments = (userRole: 'doctor' | 'patient', userId: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('appointments')
        //   .select(`
        //     *,
        //     patient:patient_id(id, name, email, profile_photo_url),
        //     doctor:doctor_id(id, name, email, profile_photo_url)
        //   `)
        //   .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`);
        
        // For demo, use mock data
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            title: 'Annual Check-up',
            patientId: 'patient1',
            patientName: 'John Smith',
            doctorId: 'doctor1',
            doctorName: 'Dr. Sarah Johnson',
            start: new Date(2025, 0, 15, 10, 0),
            end: new Date(2025, 0, 15, 10, 30),
            type: 'in_person',
            status: 'scheduled',
            location: 'Medical Center, Room 205',
            notes: 'Bring previous test results'
          },
          {
            id: '2',
            title: 'Follow-up Consultation',
            patientId: 'patient2',
            patientName: 'Maria Garcia',
            doctorId: 'doctor1',
            doctorName: 'Dr. Sarah Johnson',
            start: new Date(2025, 0, 16, 14, 0),
            end: new Date(2025, 0, 16, 14, 30),
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
            start: new Date(2025, 0, 18, 11, 0),
            end: new Date(2025, 0, 18, 11, 30),
            type: 'phone',
            status: 'scheduled'
          },
          {
            id: '4',
            title: 'Therapy Session',
            patientId: 'patient3',
            patientName: 'David Wilson',
            doctorId: 'doctor3',
            doctorName: 'Dr. Emily Rodriguez',
            start: new Date(2025, 0, 20, 15, 0),
            end: new Date(2025, 0, 20, 16, 0),
            type: 'in_person',
            status: 'scheduled',
            location: 'Therapy Center, Suite 102',
            recurrence: {
              pattern: 'weekly',
              interval: 1,
              occurrences: 8
            }
          }
        ];
        
        // Filter appointments based on user role
        const filteredAppointments = mockAppointments.filter(appointment => {
          if (userRole === 'doctor') {
            return appointment.doctorId === userId;
          } else {
            return appointment.patientId === userId;
          }
        });
        
        setAppointments(filteredAppointments);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching appointments:', err);
        setError(err.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [userRole, userId]);
  
  // Add appointment
  const addAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      const newAppointment: Appointment = {
        id: uuidv4(),
        ...appointmentData
      };
      
      // In a real app, save to Supabase
      // const { data, error } = await supabase
      //   .from('appointments')
      //   .insert([newAppointment])
      //   .select();
      
      // For demo, update local state
      setAppointments(prev => [...prev, newAppointment]);
      
      // If this is a recurring appointment, generate the series
      if (newAppointment.recurrence) {
        // This would be handled by a database trigger in a real app
        console.log('Recurring appointment created:', newAppointment.recurrence);
      }
      
      return newAppointment;
    } catch (err: any) {
      console.error('Error adding appointment:', err);
      throw err;
    }
  };
  
  // Update appointment
  const updateAppointment = async (updatedAppointment: Appointment) => {
    try {
      // In a real app, update in Supabase
      // const { data, error } = await supabase
      //   .from('appointments')
      //   .update(updatedAppointment)
      //   .eq('id', updatedAppointment.id)
      //   .select();
      
      // For demo, update local state
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === updatedAppointment.id ? updatedAppointment : appointment
        )
      );
      
      return updatedAppointment;
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      throw err;
    }
  };
  
  // Delete appointment
  const deleteAppointment = async (id: string) => {
    try {
      // In a real app, delete from Supabase
      // const { error } = await supabase
      //   .from('appointments')
      //   .delete()
      //   .eq('id', id);
      
      // For demo, update local state
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      
      return true;
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      throw err;
    }
  };
  
  // Check for conflicts
  const checkForConflicts = (appointment: Omit<Appointment, 'id'> & { id?: string }) => {
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    
    return appointments.filter(existingAppointment => {
      // Skip the appointment being updated
      if (appointment.id && existingAppointment.id === appointment.id) {
        return false;
      }
      
      // Skip non-scheduled appointments
      if (existingAppointment.status !== 'scheduled') {
        return false;
      }
      
      // For doctors, check if they have another appointment at the same time
      if (userRole === 'doctor' && existingAppointment.doctorId === userId) {
        return areIntervalsOverlapping(
          { start, end },
          { 
            start: new Date(existingAppointment.start), 
            end: new Date(existingAppointment.end) 
          }
        );
      }
      
      // For patients, check if they have another appointment at the same time
      if (userRole === 'patient' && existingAppointment.patientId === userId) {
        return areIntervalsOverlapping(
          { start, end },
          { 
            start: new Date(existingAppointment.start), 
            end: new Date(existingAppointment.end) 
          }
        );
      }
      
      return false;
    });
  };
  
  return {
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    checkForConflicts
  };
};