/*
  # Create prescription system tables

  1. New Tables
    - `prescriptions`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to users)
      - `doctor_id` (uuid, foreign key to users)
      - `prescription_date` (timestamptz)
      - `expiry_date` (timestamptz)
      - `medications` (jsonb) - array of medication objects
      - `notes` (text)
      - `refills` (integer)
      - `refills_used` (integer)
      - `status` (text) - active, expired, cancelled, completed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `prescription_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `medications` (jsonb) - array of medication objects
      - `category` (text)
      - `is_starred` (boolean)
      - `usage_count` (integer)
      - `last_used` (timestamptz)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for doctors to manage prescriptions
    - Add policies for patients to view their prescriptions
    - Add policies for doctors to manage their templates
*/

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  prescription_date timestamptz NOT NULL DEFAULT now(),
  expiry_date timestamptz NOT NULL,
  medications jsonb NOT NULL DEFAULT '[]',
  notes text,
  refills integer DEFAULT 0,
  refills_used integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prescription_templates table
CREATE TABLE IF NOT EXISTS prescription_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  medications jsonb NOT NULL DEFAULT '[]',
  category text,
  is_starred boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  last_used timestamptz,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_templates ENABLE ROW LEVEL SECURITY;

-- Prescriptions policies
-- Doctors can manage prescriptions they created
CREATE POLICY "Doctors can manage their prescriptions"
  ON prescriptions
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

-- Patients can view their prescriptions
CREATE POLICY "Patients can view their prescriptions"
  ON prescriptions
  FOR SELECT
  TO authenticated
  USING (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'patient'
    )
  );

-- Prescription templates policies
-- Doctors can manage their own templates
CREATE POLICY "Doctors can manage their templates"
  ON prescription_templates
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  )
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  );

-- Doctors can view system templates
CREATE POLICY "Doctors can view system templates"
  ON prescription_templates
  FOR SELECT
  TO authenticated
  USING (
    created_by != auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  );

-- Triggers for updating timestamps
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescription_templates_updated_at
  BEFORE UPDATE ON prescription_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check and update prescription status based on expiry date
CREATE OR REPLACE FUNCTION update_prescription_status()
RETURNS trigger AS $$
BEGIN
  -- Check if prescription has expired
  IF NEW.expiry_date < NOW() AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  
  -- Check if all refills have been used
  IF NEW.refills > 0 AND NEW.refills_used >= NEW.refills AND NEW.status = 'active' THEN
    NEW.status := 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update prescription status
CREATE TRIGGER update_prescription_status_trigger
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_prescription_status();

-- Trigger to check expiry date on insert
CREATE TRIGGER check_prescription_expiry_trigger
  BEFORE INSERT ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_prescription_status();