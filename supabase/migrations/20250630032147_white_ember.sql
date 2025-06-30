/*
  # Calendar and Appointment Management System

  1. New Tables
    - `availability_settings` - Stores doctor working hours and time blocks
    - `appointment_series` - Manages recurring appointment patterns

  2. Changes
    - Added recurrence fields to `appointments` table
    - Added availability checking functionality
    - Added recurring appointment creation functionality

  3. Security
    - Enabled RLS on new tables
    - Added appropriate policies for data access
*/

-- Create availability_settings table
CREATE TABLE IF NOT EXISTS availability_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  working_hours jsonb DEFAULT '{}'::jsonb,
  time_blocks jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one availability setting per user
  UNIQUE(user_id)
);

-- Create appointment_series table
CREATE TABLE IF NOT EXISTS appointment_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text CHECK (pattern IN ('daily', 'weekly', 'monthly')),
  interval integer DEFAULT 1,
  end_date timestamptz,
  occurrences integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Alter appointments table to add recurrence fields
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES appointment_series(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_rule jsonb DEFAULT NULL;

-- Enable RLS on new tables
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_series ENABLE ROW LEVEL SECURITY;

-- Availability settings policies
CREATE POLICY "Users can manage their own availability"
  ON availability_settings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Appointment series policies
CREATE POLICY "Users can view appointment series they are part of"
  ON appointment_series
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.series_id = appointment_series.id
      AND (appointments.patient_id = auth.uid() OR appointments.doctor_id = auth.uid())
    )
  );

-- Update triggers for timestamps
CREATE TRIGGER update_availability_settings_updated_at
  BEFORE UPDATE ON availability_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_series_updated_at
  BEFORE UPDATE ON appointment_series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check availability before booking
CREATE OR REPLACE FUNCTION check_availability()
RETURNS trigger AS $$
DECLARE
  doctor_availability jsonb;
  day_of_week text;
  appt_start time;
  appt_end time;
  working_start time;
  working_end time;
  is_working_day boolean;
  conflicting_block jsonb;
  block_count integer;
BEGIN
  -- Get the doctor's availability settings
  SELECT working_hours INTO doctor_availability
  FROM availability_settings
  WHERE user_id = NEW.doctor_id;
  
  -- If no availability settings, allow the appointment (default to available)
  IF doctor_availability IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get day of week and format times
  day_of_week := lower(to_char(NEW.appointment_date, 'day'));
  appt_start := NEW.appointment_date::time;
  appt_end := (NEW.appointment_date + (NEW.duration_minutes || ' minutes')::interval)::time;
  
  -- Check if the day is a working day
  is_working_day := (doctor_availability->day_of_week->>'available')::boolean;
  
  IF NOT is_working_day THEN
    RAISE EXCEPTION 'Doctor is not available on this day';
  END IF;
  
  -- Check if appointment is within working hours
  working_start := (doctor_availability->day_of_week->>'start')::time;
  working_end := (doctor_availability->day_of_week->>'end')::time;
  
  IF appt_start < working_start OR appt_end > working_end THEN
    RAISE EXCEPTION 'Appointment is outside of doctor''s working hours';
  END IF;
  
  -- Check for special time blocks
  SELECT jsonb_array_length(time_blocks) INTO block_count
  FROM availability_settings
  WHERE user_id = NEW.doctor_id;
  
  IF block_count > 0 THEN
    SELECT jsonb_array_elements(time_blocks) INTO conflicting_block
    FROM availability_settings
    WHERE user_id = NEW.doctor_id
    AND (
      jsonb_array_elements(time_blocks)->>'day' = day_of_week
      AND (
        (appt_start >= (jsonb_array_elements(time_blocks)->>'startTime')::time 
         AND appt_start < (jsonb_array_elements(time_blocks)->>'endTime')::time)
        OR
        (appt_end > (jsonb_array_elements(time_blocks)->>'startTime')::time 
         AND appt_end <= (jsonb_array_elements(time_blocks)->>'endTime')::time)
        OR
        (appt_start <= (jsonb_array_elements(time_blocks)->>'startTime')::time 
         AND appt_end >= (jsonb_array_elements(time_blocks)->>'endTime')::time)
      )
    )
    LIMIT 1;
    
    IF conflicting_block IS NOT NULL AND NOT (conflicting_block->>'isAvailable')::boolean THEN
      RAISE EXCEPTION 'Doctor is not available during this time block';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check availability before booking
CREATE TRIGGER check_availability_trigger
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'scheduled')
  EXECUTE FUNCTION check_availability();

-- Function to create recurring appointments
CREATE OR REPLACE FUNCTION create_recurring_appointments()
RETURNS trigger AS $$
DECLARE
  series_id uuid;
  appointment_date_var timestamptz;
  end_date_var timestamptz;
  occurrences_var integer;
  current_occurrence integer;
  interval_value integer;
  pattern_var text;
BEGIN
  -- Only proceed if this is a recurring appointment
  IF NOT NEW.is_recurring OR NEW.recurrence_rule IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Create a new series record
  INSERT INTO appointment_series (
    pattern,
    interval,
    end_date,
    occurrences
  ) VALUES (
    NEW.recurrence_rule->>'pattern',
    (NEW.recurrence_rule->>'interval')::integer,
    CASE 
      WHEN NEW.recurrence_rule->>'endDate' IS NOT NULL 
      THEN (NEW.recurrence_rule->>'endDate')::timestamptz 
      ELSE NULL 
    END,
    CASE 
      WHEN NEW.recurrence_rule->>'occurrences' IS NOT NULL 
      THEN (NEW.recurrence_rule->>'occurrences')::integer 
      ELSE NULL 
    END
  ) RETURNING id INTO series_id;
  
  -- Update the original appointment with the series ID
  NEW.series_id = series_id;
  
  -- Get recurrence parameters
  pattern_var := NEW.recurrence_rule->>'pattern';
  interval_value := (NEW.recurrence_rule->>'interval')::integer;
  
  -- Set up for creating recurring instances
  appointment_date_var := NEW.appointment_date;
  current_occurrence := 1;
  
  -- Determine end condition
  IF NEW.recurrence_rule->>'endDate' IS NOT NULL THEN
    end_date_var := (NEW.recurrence_rule->>'endDate')::timestamptz;
    occurrences_var := NULL;
  ELSIF NEW.recurrence_rule->>'occurrences' IS NOT NULL THEN
    end_date_var := NULL;
    occurrences_var := (NEW.recurrence_rule->>'occurrences')::integer;
  ELSE
    -- Default to 10 occurrences if neither is specified
    end_date_var := NULL;
    occurrences_var := 10;
  END IF;
  
  -- Create future occurrences
  WHILE (end_date_var IS NULL OR appointment_date_var < end_date_var) AND (occurrences_var IS NULL OR current_occurrence < occurrences_var) LOOP
    -- Increment date based on pattern
    IF pattern_var = 'daily' THEN
      appointment_date_var := appointment_date_var + (interval_value || ' days')::interval;
    ELSIF pattern_var = 'weekly' THEN
      appointment_date_var := appointment_date_var + (interval_value || ' weeks')::interval;
    ELSIF pattern_var = 'monthly' THEN
      appointment_date_var := appointment_date_var + (interval_value || ' months')::interval;
    END IF;
    
    -- Create the recurring appointment
    INSERT INTO appointments (
      patient_id,
      doctor_id,
      appointment_date,
      duration_minutes,
      status,
      consultation_type,
      notes,
      prescription,
      follow_up_required,
      meeting_link,
      series_id,
      is_recurring,
      recurrence_rule
    ) VALUES (
      NEW.patient_id,
      NEW.doctor_id,
      appointment_date_var,
      NEW.duration_minutes,
      NEW.status,
      NEW.consultation_type,
      NEW.notes,
      NEW.prescription,
      NEW.follow_up_required,
      NEW.meeting_link,
      series_id,
      true,
      NULL -- Don't include recurrence rule in child appointments
    );
    
    current_occurrence := current_occurrence + 1;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create recurring appointments
CREATE TRIGGER create_recurring_appointments_trigger
  BEFORE INSERT ON appointments
  FOR EACH ROW
  WHEN (NEW.is_recurring AND NEW.recurrence_rule IS NOT NULL)
  EXECUTE FUNCTION create_recurring_appointments();