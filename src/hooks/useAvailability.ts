import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TimeBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Availability {
  workingHours: Record<string, { start: string; end: string; available: boolean }>;
  timeBlocks: TimeBlock[];
}

export const useAvailability = (userId: string) => {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch availability
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('doctor_profiles')
        //   .select('availability_hours, time_blocks')
        //   .eq('user_id', userId)
        //   .single();
        
        // For demo, use mock data
        const mockAvailability: Availability = {
          workingHours: {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '09:00', end: '13:00', available: false },
            sunday: { start: '09:00', end: '13:00', available: false }
          },
          timeBlocks: [
            {
              id: 'block-1',
              day: 'monday',
              startTime: '12:00',
              endTime: '13:00',
              isAvailable: false
            },
            {
              id: 'block-2',
              day: 'wednesday',
              startTime: '14:00',
              endTime: '16:00',
              isAvailable: false
            }
          ]
        };
        
        setAvailability(mockAvailability);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching availability:', err);
        setError(err.message || 'Failed to fetch availability');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [userId]);
  
  // Update availability
  const updateAvailability = async (updatedAvailability: Availability) => {
    setLoading(true);
    try {
      // In a real app, update in Supabase
      // const { data, error } = await supabase
      //   .from('doctor_profiles')
      //   .update({
      //     availability_hours: updatedAvailability.workingHours,
      //     time_blocks: updatedAvailability.timeBlocks
      //   })
      //   .eq('user_id', userId)
      //   .select();
      
      // For demo, update local state
      setAvailability(updatedAvailability);
      
      return true;
    } catch (err: any) {
      console.error('Error updating availability:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Check if a time slot is available
  const isTimeSlotAvailable = (day: string, startTime: string, endTime: string): boolean => {
    if (!availability) return false;
    
    // Check if the day is generally available
    const dayOfWeek = day.toLowerCase();
    if (!availability.workingHours[dayOfWeek]?.available) {
      return false;
    }
    
    // Check if the time is within working hours
    const workingStart = availability.workingHours[dayOfWeek].start;
    const workingEnd = availability.workingHours[dayOfWeek].end;
    
    if (startTime < workingStart || endTime > workingEnd) {
      return false;
    }
    
    // Check if there are any time blocks that make this slot unavailable
    const conflictingBlock = availability.timeBlocks.find(block => {
      if (block.day !== dayOfWeek) return false;
      
      // Check if the time ranges overlap
      return (
        (startTime >= block.startTime && startTime < block.endTime) ||
        (endTime > block.startTime && endTime <= block.endTime) ||
        (startTime <= block.startTime && endTime >= block.endTime)
      );
    });
    
    if (conflictingBlock) {
      return conflictingBlock.isAvailable;
    }
    
    return true;
  };
  
  return {
    availability,
    loading,
    error,
    updateAvailability,
    isTimeSlotAvailable
  };
};