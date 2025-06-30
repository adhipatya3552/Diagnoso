import React, { useState } from 'react';
import { AppointmentCalendar } from '../../components/calendar/AppointmentCalendar';
import { AvailabilityManager } from '../../components/calendar/AvailabilityManager';
import { Button } from '../../components/ui/Button';
import { Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AppointmentCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [showAvailabilityManager, setShowAvailabilityManager] = useState(false);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Appointment Calendar</h1>
        
        {user.role === 'doctor' && (
          <Button
            variant="outline"
            onClick={() => setShowAvailabilityManager(true)}
            icon={Clock}
          >
            Manage Availability
          </Button>
        )}
      </div>
      
      <AppointmentCalendar 
        userRole={user.role as 'doctor' | 'patient'} 
        userId={user.id} 
      />
      
      <AvailabilityManager
        isOpen={showAvailabilityManager}
        onClose={() => setShowAvailabilityManager(false)}
        userId={user.id}
        userRole={user.role as 'doctor' | 'patient'}
      />
    </div>
  );
};