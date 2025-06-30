/*
  # Create appointment reminder system tables

  1. New Tables
    - `appointment_reminders`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, foreign key to appointments)
      - `user_id` (uuid, foreign key to users)
      - `reminder_type` (text) - '24h', '2h', 'custom'
      - `send_at` (timestamptz)
      - `sent` (boolean)
      - `sent_at` (timestamptz)
      - `acknowledged` (boolean)
      - `acknowledged_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `follow_up_suggestions`
      - `id` (uuid, primary key)
      - `previous_appointment_id` (uuid, foreign key to appointments)
      - `patient_id` (uuid, foreign key to users)
      - `doctor_id` (uuid, foreign key to users)
      - `suggested_timeframe` (text) - 'days', 'weeks', 'months'
      - `suggested_interval` (integer)
      - `reason` (text)
      - `status` (text) - 'pending', 'accepted', 'declined', 'expired'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `waitlist_entries`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key to users)
      - `doctor_id` (uuid, foreign key to users)
      - `requested_date` (timestamptz)
      - `priority` (text) - 'low', 'medium', 'high', 'urgent'
      - `status` (text) - 'waiting', 'notified', 'booked', 'expired'
      - `notes` (text)
      - `preferred_time_of_day` (text) - 'morning', 'afternoon', 'evening', 'any'
      - `preferred_days` (text[])
      - `notified_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own reminders
    - Add policies for doctors to manage waitlist entries

  3. Functions
    - Create functions for automatic reminder generation
    - Create functions for follow-up suggestion generation
    - Create functions for waitlist management
*/

-- Create appointment_reminders table
CREATE TABLE IF NOT EXISTS appointment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reminder_type text NOT NULL CHECK (reminder_type IN ('24h', '2h', 'custom')),
  send_at timestamptz NOT NULL,
  sent boolean DEFAULT false,
  sent_at timestamptz,
  acknowledged boolean DEFAULT false,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create follow_up_suggestions table
CREATE TABLE IF NOT EXISTS follow_up_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  previous_appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  suggested_timeframe text NOT NULL CHECK (suggested_timeframe IN ('days', 'weeks', 'months')),
  suggested_interval integer NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create waitlist_entries table
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  requested_date timestamptz,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'booked', 'expired')),
  notes text,
  preferred_time_of_day text CHECK (preferred_time_of_day IN ('morning', 'afternoon', 'evening', 'any')),
  preferred_days text[],
  notified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Appointment reminders policies
CREATE POLICY "Users can view their own reminders"
  ON appointment_reminders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own reminders"
  ON appointment_reminders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Follow-up suggestions policies
CREATE POLICY "Patients can view their follow-up suggestions"
  ON follow_up_suggestions
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Patients can update their follow-up suggestions"
  ON follow_up_suggestions
  FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view follow-up suggestions they created"
  ON follow_up_suggestions
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create follow-up suggestions"
  ON follow_up_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  );

-- Waitlist entries policies
CREATE POLICY "Patients can view their waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view and manage their waitlist"
  ON waitlist_entries
  FOR ALL
  TO authenticated
  USING (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  );

CREATE POLICY "Patients can create waitlist entries"
  ON waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'patient'
    )
  );

-- Triggers for updating timestamps
CREATE TRIGGER update_appointment_reminders_updated_at
  BEFORE UPDATE ON appointment_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_up_suggestions_updated_at
  BEFORE UPDATE ON follow_up_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlist_entries_updated_at
  BEFORE UPDATE ON waitlist_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create reminders for new appointments
CREATE OR REPLACE FUNCTION create_appointment_reminders()
RETURNS trigger AS $$
DECLARE
  reminder_24h_time timestamptz;
  reminder_2h_time timestamptz;
BEGIN
  -- Only create reminders for scheduled appointments
  IF NEW.status <> 'scheduled' THEN
    RETURN NEW;
  END IF;
  
  -- Calculate reminder times
  reminder_24h_time := NEW.appointment_date - interval '24 hours';
  reminder_2h_time := NEW.appointment_date - interval '2 hours';
  
  -- Create 24-hour reminder for patient
  INSERT INTO appointment_reminders (
    appointment_id,
    user_id,
    reminder_type,
    send_at
  ) VALUES (
    NEW.id,
    NEW.patient_id,
    '24h',
    reminder_24h_time
  );
  
  -- Create 2-hour reminder for patient
  INSERT INTO appointment_reminders (
    appointment_id,
    user_id,
    reminder_type,
    send_at
  ) VALUES (
    NEW.id,
    NEW.patient_id,
    '2h',
    reminder_2h_time
  );
  
  -- Create 24-hour reminder for doctor
  INSERT INTO appointment_reminders (
    appointment_id,
    user_id,
    reminder_type,
    send_at
  ) VALUES (
    NEW.id,
    NEW.doctor_id,
    '24h',
    reminder_24h_time
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create reminders for new appointments
CREATE TRIGGER create_appointment_reminders_trigger
  AFTER INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION create_appointment_reminders();

-- Function to automatically create follow-up suggestions for completed appointments
CREATE OR REPLACE FUNCTION create_follow_up_suggestion()
RETURNS trigger AS $$
BEGIN
  -- Only create follow-up suggestions for completed appointments
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    -- Check if follow-up is required
    IF NEW.follow_up_required THEN
      INSERT INTO follow_up_suggestions (
        previous_appointment_id,
        patient_id,
        doctor_id,
        suggested_timeframe,
        suggested_interval,
        reason
      ) VALUES (
        NEW.id,
        NEW.patient_id,
        NEW.doctor_id,
        'weeks', -- Default to weeks
        2,       -- Default to 2 weeks
        'Follow-up recommended by doctor'
      );
      
      -- Create notification for patient
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        link
      ) VALUES (
        NEW.patient_id,
        'Follow-Up Recommended',
        'Your doctor recommends scheduling a follow-up appointment',
        'appointment',
        '/patient/reminders'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create follow-up suggestions for completed appointments
CREATE TRIGGER create_follow_up_suggestion_trigger
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW EXECUTE FUNCTION create_follow_up_suggestion();

-- Function to handle missed appointments
CREATE OR REPLACE FUNCTION handle_missed_appointment()
RETURNS trigger AS $$
BEGIN
  -- Check if appointment was missed (status changed to no_show)
  IF NEW.status = 'no_show' AND (OLD.status IS NULL OR OLD.status <> 'no_show') THEN
    -- Create notification for patient
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      link,
      priority
    ) VALUES (
      NEW.patient_id,
      'Missed Appointment',
      'You missed your appointment with ' || (SELECT name FROM users WHERE id = NEW.doctor_id) || '. Please reschedule.',
      'appointment',
      '/patient/reminders',
      'high'
    );
    
    -- Create notification for doctor
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      link
    ) VALUES (
      NEW.doctor_id,
      'Patient No-Show',
      (SELECT name FROM users WHERE id = NEW.patient_id) || ' missed their appointment',
      'appointment',
      '/doctor/reminders'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle missed appointments
CREATE TRIGGER handle_missed_appointment_trigger
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW EXECUTE FUNCTION handle_missed_appointment();

-- Function to send reminders (would be called by a cron job in a real app)
CREATE OR REPLACE FUNCTION send_pending_reminders()
RETURNS void AS $$
DECLARE
  reminder_record RECORD;
  user_record RECORD;
  appointment_record RECORD;
  notification_title text;
  notification_message text;
  notification_link text;
BEGIN
  -- Find reminders that need to be sent
  FOR reminder_record IN
    SELECT * FROM appointment_reminders
    WHERE sent = false AND send_at <= now()
  LOOP
    -- Get user and appointment details
    SELECT * INTO user_record FROM users WHERE id = reminder_record.user_id;
    SELECT * INTO appointment_record FROM appointments WHERE id = reminder_record.appointment_id;
    
    -- Skip if appointment is not scheduled anymore
    IF appointment_record.status <> 'scheduled' THEN
      CONTINUE;
    END IF;
    
    -- Set notification details based on user role
    IF user_record.role = 'patient' THEN
      notification_title := 'Appointment Reminder';
      notification_message := 'You have an appointment with ' || 
                             (SELECT name FROM users WHERE id = appointment_record.doctor_id) || 
                             ' on ' || to_char(appointment_record.appointment_date, 'YYYY-MM-DD') || 
                             ' at ' || to_char(appointment_record.appointment_date, 'HH:MI AM');
      notification_link := '/patient/appointments';
    ELSE -- doctor
      notification_title := 'Appointment Reminder';
      notification_message := 'You have an appointment with ' || 
                             (SELECT name FROM users WHERE id = appointment_record.patient_id) || 
                             ' on ' || to_char(appointment_record.appointment_date, 'YYYY-MM-DD') || 
                             ' at ' || to_char(appointment_record.appointment_date, 'HH:MI AM');
      notification_link := '/doctor/appointments';
    END IF;
    
    -- Create notification
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      link,
      priority
    ) VALUES (
      reminder_record.user_id,
      notification_title,
      notification_message,
      'appointment',
      notification_link,
      CASE WHEN reminder_record.reminder_type = '2h' THEN 'high' ELSE 'normal' END
    );
    
    -- Mark reminder as sent
    UPDATE appointment_reminders
    SET sent = true, sent_at = now()
    WHERE id = reminder_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE appointment_reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE follow_up_suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE waitlist_entries;