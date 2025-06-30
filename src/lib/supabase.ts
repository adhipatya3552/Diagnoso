import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'doctor' | 'patient' | 'admin';
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  problem_description?: string;
  duration?: string;
  symptoms: string[];
  medical_history: string;
  current_medications: string[];
  allergies: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  specialty: string;
  years_experience: number;
  admin_approved: boolean;
  license_number?: string;
  education: string[];
  certifications: string[];
  bio: string;
  consultation_fee: number;
  availability_hours: Record<string, any>;
  languages_spoken: string[];
  hospital_affiliations: string[];
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  consultation_type: 'video' | 'in_person' | 'phone';
  notes: string;
  prescription: string;
  follow_up_required: boolean;
  meeting_link?: string;
  created_at: string;
  updated_at: string;
}