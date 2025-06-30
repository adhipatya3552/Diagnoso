/*
  # Create storage bucket for chat attachments

  1. Storage Bucket
    - `chat-attachments` - For files shared in chat conversations

  2. Storage Policies
    - Users can upload files to their own folders
    - Users can view files in conversations they're part of
    - Files are organized by conversation_id/user_id/filename
*/

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('chat-attachments', 'chat-attachments', true, 20971520, ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ])
ON CONFLICT (id) DO NOTHING;

-- Users can upload files to their own folders
CREATE POLICY "Users can upload their own chat attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-attachments' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Users can update their own files
CREATE POLICY "Users can update their own chat attachments"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'chat-attachments' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Users can delete their own files
CREATE POLICY "Users can delete their own chat attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-attachments' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Users can view files in conversations they're part of
CREATE POLICY "Users can view chat attachments in their conversations"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-attachments' AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = (storage.foldername(name))[1]::uuid
      AND (conversations.doctor_id = auth.uid() OR conversations.patient_id = auth.uid())
    )
  );