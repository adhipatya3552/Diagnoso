/*
  # Create patient profiles table

  1. New Tables
    - `patient_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `problem_description` (text) - description of medical problem
      - `duration` (text) - how long they've had the problem
      - `symptoms` (text array) - list of symptoms
      - `medical_history` (text) - relevant medical history
      - `current_medications` (text array) - current medications
      - `allergies` (text array) - known allergies
      - `emergency_contact_name` (text) - emergency contact name
      - `emergency_contact_phone` (text) - emergency contact phone
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `patient_profiles` table
    - Patients can manage their own profiles
    - Doctors can read patient profiles (for consultations)
*/

CREATE TABLE IF NOT EXISTS patient_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  problem_description text,
  duration text,
  symptoms text[] DEFAULT '{}',
  medical_history text DEFAULT '',
  current_medications text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own profiles
CREATE POLICY "Patients can manage own profile"
  ON patient_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.id = patient_profiles.user_id
      AND users.role = 'patient'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.id = patient_profiles.user_id
      AND users.role = 'patient'
    )
  );

-- Doctors can read patient profiles (for consultations)
CREATE POLICY "Doctors can read patient profiles"
  ON patient_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  );

-- Trigger to update updated_at on patient_profiles table
CREATE TRIGGER update_patient_profiles_updated_at
  BEFORE UPDATE ON patient_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create patient profile when user role is patient
CREATE OR REPLACE FUNCTION create_patient_profile()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'patient' THEN
    INSERT INTO patient_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create patient profile on user creation/update
CREATE TRIGGER on_user_role_patient
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW EXECUTE FUNCTION create_patient_profile();