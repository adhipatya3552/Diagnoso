/*
  # Create appointments table for doctor-patient consultations

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to users)
      - `doctor_id` (uuid, foreign key to users)
      - `appointment_date` (timestamptz)
      - `duration_minutes` (integer, default 30)
      - `status` (text, enum: scheduled, completed, cancelled, no_show)
      - `consultation_type` (text, enum: video, in_person, phone)
      - `notes` (text)
      - `prescription` (text)
      - `follow_up_required` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `appointments` table
    - Patients can manage their own appointments
    - Doctors can manage appointments where they are the doctor
    - Both parties can read their shared appointments

  3. Indexes
    - Index on patient_id and doctor_id for faster queries
    - Index on appointment_date for scheduling queries
*/

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  consultation_type text DEFAULT 'video' CHECK (consultation_type IN ('video', 'in_person', 'phone')),
  notes text DEFAULT '',
  prescription text DEFAULT '',
  follow_up_required boolean DEFAULT false,
  meeting_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure appointment is in the future when created
  CONSTRAINT future_appointment CHECK (appointment_date > created_at)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own appointments
CREATE POLICY "Patients can manage own appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'patient'
    )
  )
  WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'patient'
    )
  );

-- Doctors can manage appointments where they are the doctor
CREATE POLICY "Doctors can manage their appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  )
  WITH CHECK (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  );

-- Trigger to update updated_at on appointments table
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate appointment booking
CREATE OR REPLACE FUNCTION validate_appointment_booking()
RETURNS trigger AS $$
BEGIN
  -- Check if doctor exists and is approved
  IF NOT EXISTS (
    SELECT 1 FROM users u
    JOIN doctor_profiles dp ON u.id = dp.user_id
    WHERE u.id = NEW.doctor_id 
    AND u.role = 'doctor' 
    AND dp.admin_approved = true
  ) THEN
    RAISE EXCEPTION 'Doctor not found or not approved';
  END IF;
  
  -- Check if patient exists
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = NEW.patient_id 
    AND role = 'patient'
  ) THEN
    RAISE EXCEPTION 'Patient not found';
  END IF;
  
  -- Check for scheduling conflicts (same doctor, overlapping time)
  IF EXISTS (
    SELECT 1 FROM appointments 
    WHERE doctor_id = NEW.doctor_id 
    AND status = 'scheduled'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      (NEW.appointment_date, NEW.appointment_date + (NEW.duration_minutes || ' minutes')::interval) 
      OVERLAPS 
      (appointment_date, appointment_date + (duration_minutes || ' minutes')::interval)
    )
  ) THEN
    RAISE EXCEPTION 'Doctor is not available at this time';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate appointment booking
CREATE TRIGGER validate_appointment_booking_trigger
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION validate_appointment_booking();