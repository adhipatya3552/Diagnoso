/*
  # Create notification system tables

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `message` (text)
      - `type` (text, enum: appointment, message, system)
      - `timestamp` (timestamptz)
      - `read` (boolean)
      - `link` (text, optional)
      - `actions` (jsonb, optional)
      - `priority` (text, optional)
      - `image` (text, optional)
      - `sender_id` (uuid, optional, foreign key to users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `notification_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `preferences` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own notifications and preferences

  3. Realtime
    - Enable realtime for notifications table
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('appointment', 'message', 'system')),
  timestamp timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false,
  link text,
  actions jsonb,
  priority text CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  image text,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferences jsonb NOT NULL DEFAULT '{
    "channels": {
      "inApp": true,
      "email": true,
      "sms": false,
      "push": false
    },
    "types": {
      "appointments": true,
      "messages": true,
      "reminders": true,
      "system": true
    },
    "frequency": "immediate",
    "doNotDisturb": {
      "enabled": false,
      "startTime": "22:00",
      "endTime": "07:00"
    },
    "emergencyOverride": true
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Notification preferences policies
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Triggers for updating timestamps
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS trigger AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default notification preferences for new users
CREATE TRIGGER on_user_created_notification_preferences
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- Function to create notification for appointment changes
CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS trigger AS $$
DECLARE
  notification_title text;
  notification_message text;
  notification_type text := 'appointment';
  notification_link text := '/patient/appointments';
BEGIN
  -- For new appointments
  IF TG_OP = 'INSERT' THEN
    -- Notify patient
    notification_title := 'New Appointment Scheduled';
    notification_message := 'You have a new appointment scheduled with ' || 
                           (SELECT name FROM users WHERE id = NEW.doctor_id) || 
                           ' on ' || to_char(NEW.appointment_date, 'YYYY-MM-DD') || 
                           ' at ' || to_char(NEW.appointment_date, 'HH:MI AM');
    
    INSERT INTO notifications (
      user_id, 
      title, 
      message, 
      type, 
      link, 
      sender_id
    ) VALUES (
      NEW.patient_id,
      notification_title,
      notification_message,
      notification_type,
      notification_link,
      NEW.doctor_id
    );
    
    -- Notify doctor
    notification_title := 'New Appointment Scheduled';
    notification_message := 'You have a new appointment scheduled with ' || 
                           (SELECT name FROM users WHERE id = NEW.patient_id) || 
                           ' on ' || to_char(NEW.appointment_date, 'YYYY-MM-DD') || 
                           ' at ' || to_char(NEW.appointment_date, 'HH:MI AM');
    notification_link := '/doctor/appointments';
    
    INSERT INTO notifications (
      user_id, 
      title, 
      message, 
      type, 
      link, 
      sender_id
    ) VALUES (
      NEW.doctor_id,
      notification_title,
      notification_message,
      notification_type,
      notification_link,
      NEW.patient_id
    );
  
  -- For updated appointments
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed
    IF NEW.status <> OLD.status THEN
      -- Notify patient
      notification_title := 'Appointment Status Updated';
      notification_message := 'Your appointment with ' || 
                             (SELECT name FROM users WHERE id = NEW.doctor_id) || 
                             ' has been updated to ' || NEW.status;
      
      INSERT INTO notifications (
        user_id, 
        title, 
        message, 
        type, 
        link, 
        sender_id
      ) VALUES (
        NEW.patient_id,
        notification_title,
        notification_message,
        notification_type,
        notification_link,
        NEW.doctor_id
      );
      
      -- Notify doctor
      notification_title := 'Appointment Status Updated';
      notification_message := 'Your appointment with ' || 
                             (SELECT name FROM users WHERE id = NEW.patient_id) || 
                             ' has been updated to ' || NEW.status;
      notification_link := '/doctor/appointments';
      
      INSERT INTO notifications (
        user_id, 
        title, 
        message, 
        type, 
        link, 
        sender_id
      ) VALUES (
        NEW.doctor_id,
        notification_title,
        notification_message,
        notification_type,
        notification_link,
        NEW.patient_id
      );
    
    -- If date/time changed
    ELSIF NEW.appointment_date <> OLD.appointment_date THEN
      -- Notify patient
      notification_title := 'Appointment Rescheduled';
      notification_message := 'Your appointment with ' || 
                             (SELECT name FROM users WHERE id = NEW.doctor_id) || 
                             ' has been rescheduled to ' || to_char(NEW.appointment_date, 'YYYY-MM-DD') || 
                             ' at ' || to_char(NEW.appointment_date, 'HH:MI AM');
      
      INSERT INTO notifications (
        user_id, 
        title, 
        message, 
        type, 
        link, 
        sender_id
      ) VALUES (
        NEW.patient_id,
        notification_title,
        notification_message,
        notification_type,
        notification_link,
        NEW.doctor_id
      );
      
      -- Notify doctor
      notification_title := 'Appointment Rescheduled';
      notification_message := 'Your appointment with ' || 
                             (SELECT name FROM users WHERE id = NEW.patient_id) || 
                             ' has been rescheduled to ' || to_char(NEW.appointment_date, 'YYYY-MM-DD') || 
                             ' at ' || to_char(NEW.appointment_date, 'HH:MI AM');
      notification_link := '/doctor/appointments';
      
      INSERT INTO notifications (
        user_id, 
        title, 
        message, 
        type, 
        link, 
        sender_id
      ) VALUES (
        NEW.doctor_id,
        notification_title,
        notification_message,
        notification_type,
        notification_link,
        NEW.patient_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for appointment notifications
CREATE TRIGGER appointment_notification_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION create_appointment_notification();

-- Function to create notification for new messages
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS trigger AS $$
DECLARE
  conversation_record RECORD;
  recipient_id uuid;
  sender_name text;
BEGIN
  -- Get conversation details
  SELECT * INTO conversation_record FROM conversations WHERE id = NEW.conversation_id;
  
  -- Determine recipient
  IF NEW.sender_id = conversation_record.doctor_id THEN
    recipient_id := conversation_record.patient_id;
  ELSE
    recipient_id := conversation_record.doctor_id;
  END IF;
  
  -- Get sender name
  SELECT name INTO sender_name FROM users WHERE id = NEW.sender_id;
  
  -- Create notification
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    link,
    sender_id
  ) VALUES (
    recipient_id,
    'New Message',
    sender_name || ' sent you a new message',
    'message',
    '/messages',
    NEW.sender_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message notifications
CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION create_message_notification();

-- Function to create notification for prescription changes
CREATE OR REPLACE FUNCTION create_prescription_notification()
RETURNS trigger AS $$
DECLARE
  notification_title text;
  notification_message text;
  notification_type text := 'system';
  notification_link text := '/patient/prescriptions';
  doctor_name text;
BEGIN
  -- Get doctor name
  SELECT name INTO doctor_name FROM users WHERE id = NEW.doctor_id;
  
  -- For new prescriptions
  IF TG_OP = 'INSERT' THEN
    notification_title := 'New Prescription';
    notification_message := 'Dr. ' || doctor_name || ' has prescribed new medication for you.';
    
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      link,
      sender_id
    ) VALUES (
      NEW.patient_id,
      notification_title,
      notification_message,
      notification_type,
      notification_link,
      NEW.doctor_id
    );
  
  -- For updated prescriptions
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed
    IF NEW.status <> OLD.status THEN
      notification_title := 'Prescription Status Updated';
      
      IF NEW.status = 'expired' THEN
        notification_message := 'Your prescription has expired. Please contact your doctor for a renewal if needed.';
      ELSIF NEW.status = 'completed' THEN
        notification_message := 'Your prescription has been completed. All refills have been used.';
      ELSE
        notification_message := 'Your prescription status has been updated to ' || NEW.status || '.';
      END IF;
      
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        link,
        sender_id
      ) VALUES (
        NEW.patient_id,
        notification_title,
        notification_message,
        notification_type,
        notification_link,
        NEW.doctor_id
      );
    
    -- If refills used changed
    ELSIF NEW.refills_used > OLD.refills_used THEN
      notification_title := 'Prescription Refilled';
      notification_message := 'Your prescription has been refilled. You have ' || 
                             (NEW.refills - NEW.refills_used) || ' refills remaining.';
      
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        link,
        sender_id
      ) VALUES (
        NEW.patient_id,
        notification_title,
        notification_message,
        notification_type,
        notification_link,
        NEW.doctor_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for prescription notifications
CREATE TRIGGER prescription_notification_trigger
  AFTER INSERT OR UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION create_prescription_notification();

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;