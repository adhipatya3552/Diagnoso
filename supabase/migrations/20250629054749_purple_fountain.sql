/*
  # Create doctor profiles table

  1. New Tables
    - `doctor_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `specialty` (text, medical specialty)
      - `years_experience` (integer)
      - `admin_approved` (boolean, default false)
      - `license_number` (text)
      - `education` (text array)
      - `certifications` (text array)
      - `bio` (text)
      - `consultation_fee` (decimal)
      - `availability_hours` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `doctor_profiles` table
    - Add policy for doctors to manage their own profiles
    - Add policy for patients to read approved doctor profiles
    - Add policy for admins to manage all doctor profiles

  3. Triggers
    - Auto-create doctor profile when user role is doctor
    - Update timestamp trigger
*/

CREATE TABLE IF NOT EXISTS doctor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  specialty text NOT NULL,
  years_experience integer DEFAULT 0,
  admin_approved boolean DEFAULT false,
  license_number text,
  education text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  bio text DEFAULT '',
  consultation_fee decimal(10,2) DEFAULT 0.00,
  availability_hours jsonb DEFAULT '{}',
  languages_spoken text[] DEFAULT '{"English"}',
  hospital_affiliations text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Doctors can manage their own profiles
CREATE POLICY "Doctors can manage own profile"
  ON doctor_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.id = doctor_profiles.user_id
      AND users.role = 'doctor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.id = doctor_profiles.user_id
      AND users.role = 'doctor'
    )
  );

-- Patients can read approved doctor profiles
CREATE POLICY "Patients can read approved doctor profiles"
  ON doctor_profiles
  FOR SELECT
  TO authenticated
  USING (
    admin_approved = true AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'patient'
    )
  );

-- Admins can manage all doctor profiles (you'll need to add admin role later)
CREATE POLICY "Admins can manage all doctor profiles"
  ON doctor_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Trigger to update updated_at on doctor_profiles table
CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create doctor profile when user role is doctor
CREATE OR REPLACE FUNCTION create_doctor_profile()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'doctor' THEN
    INSERT INTO doctor_profiles (user_id, specialty)
    VALUES (NEW.id, 'General Practice')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create doctor profile on user creation/update
CREATE TRIGGER on_user_role_doctor
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW EXECUTE FUNCTION create_doctor_profile();