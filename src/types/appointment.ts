export type AppointmentType = 'video' | 'phone' | 'in_person';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';

export interface Recurrence {
  pattern: RecurrencePattern;
  interval: number;
  endDate?: Date;
  occurrences?: number;
}

export interface Appointment {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  start: Date;
  end: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  location?: string;
  notes?: string;
  recurrence?: Recurrence;
}