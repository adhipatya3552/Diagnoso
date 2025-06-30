/*
  # Create chat infrastructure tables

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, foreign key to users)
      - `patient_id` (uuid, foreign key to users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_message_preview` (text)
      - `last_message_at` (timestamptz)
      - `doctor_unread_count` (integer)
      - `patient_unread_count` (integer)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to conversations)
      - `sender_id` (uuid, foreign key to users)
      - `content` (text)
      - `message_type` (text) - 'text', 'image', 'file', 'system'
      - `file_url` (text)
      - `file_type` (text)
      - `file_name` (text)
      - `file_size` (integer)
      - `created_at` (timestamptz)
      - `read_at` (timestamptz)
      - `is_deleted` (boolean)
    
    - `typing_status`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to conversations)
      - `user_id` (uuid, foreign key to users)
      - `is_typing` (boolean)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own conversations and messages
    - Add policies for doctors and patients to read/write to shared conversations

  3. Realtime
    - Enable realtime for all tables
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message_preview text,
  last_message_at timestamptz DEFAULT now(),
  doctor_unread_count integer DEFAULT 0,
  patient_unread_count integer DEFAULT 0,
  
  -- Ensure unique doctor-patient pairs
  UNIQUE(doctor_id, patient_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  file_url text,
  file_type text,
  file_name text,
  file_size integer,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  is_deleted boolean DEFAULT false
);

-- Create typing_status table
CREATE TABLE IF NOT EXISTS typing_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one typing status per user per conversation
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Conversation policies
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = doctor_id OR auth.uid() = patient_id
  );

CREATE POLICY "Users can insert conversations they are part of"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = doctor_id OR auth.uid() = patient_id
  );

CREATE POLICY "Users can update conversations they are part of"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = doctor_id OR auth.uid() = patient_id
  );

-- Message policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.doctor_id = auth.uid() OR conversations.patient_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.doctor_id = auth.uid() OR conversations.patient_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    sender_id = auth.uid()
  );

-- Typing status policies
CREATE POLICY "Users can view typing status in their conversations"
  ON typing_status
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = typing_status.conversation_id
      AND (conversations.doctor_id = auth.uid() OR conversations.patient_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own typing status"
  ON typing_status
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- Triggers for updating conversation last_message and unread counts
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  conv_record RECORD;
BEGIN
  -- Get the conversation details
  SELECT * INTO conv_record FROM conversations WHERE id = NEW.conversation_id;
  
  -- Update the conversation with the new message preview and timestamp
  UPDATE conversations
  SET 
    last_message_preview = CASE 
      WHEN NEW.message_type = 'text' THEN 
        CASE 
          WHEN length(NEW.content) > 50 THEN substring(NEW.content, 1, 50) || '...'
          ELSE NEW.content
        END
      WHEN NEW.message_type = 'image' THEN '📷 Image'
      WHEN NEW.message_type = 'file' THEN '📎 File: ' || NEW.file_name
      WHEN NEW.message_type = 'system' THEN '🔔 ' || NEW.content
      ELSE 'New message'
    END,
    last_message_at = NEW.created_at,
    updated_at = now(),
    doctor_unread_count = CASE 
      WHEN NEW.sender_id = conv_record.doctor_id THEN doctor_unread_count
      ELSE doctor_unread_count + 1
    END,
    patient_unread_count = CASE 
      WHEN NEW.sender_id = conv_record.patient_id THEN patient_unread_count
      ELSE patient_unread_count + 1
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_inserted
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();

-- Function to reset unread count when messages are read
CREATE OR REPLACE FUNCTION reset_unread_count_on_read()
RETURNS TRIGGER AS $$
DECLARE
  conv_record RECORD;
  user_role TEXT;
BEGIN
  -- Only proceed if read_at is being set (was NULL before)
  IF OLD.read_at IS NULL AND NEW.read_at IS NOT NULL THEN
    -- Get the conversation details
    SELECT * INTO conv_record FROM conversations WHERE id = NEW.conversation_id;
    
    -- Determine if the reader is doctor or patient
    SELECT role INTO user_role FROM users WHERE id = auth.uid();
    
    -- Reset the appropriate unread counter
    IF user_role = 'doctor' THEN
      UPDATE conversations
      SET doctor_unread_count = 0
      WHERE id = NEW.conversation_id;
    ELSIF user_role = 'patient' THEN
      UPDATE conversations
      SET patient_unread_count = 0
      WHERE id = NEW.conversation_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_read
  AFTER UPDATE OF read_at ON messages
  FOR EACH ROW
  EXECUTE FUNCTION reset_unread_count_on_read();

-- Update trigger for typing_status
CREATE TRIGGER update_typing_status_updated_at
  BEFORE UPDATE ON typing_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_status;