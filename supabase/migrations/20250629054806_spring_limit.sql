/*
  # Create storage buckets for file uploads

  1. Storage Buckets
    - `profile-photos` - For user profile pictures
    - `medical-documents` - For patient medical documents
    - `doctor-credentials` - For doctor licenses and certifications

  2. Storage Policies
    - Users can upload/update their own profile photos
    - Patients can upload their medical documents
    - Doctors can upload their credentials
    - Appropriate read permissions for each bucket
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('medical-documents', 'medical-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('doctor-credentials', 'doctor-credentials', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Profile photos policies
CREATE POLICY "Users can upload their own profile photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Profile photos are publicly readable"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');

-- Medical documents policies
CREATE POLICY "Patients can upload their medical documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'medical-documents' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'patient'
    )
  );

CREATE POLICY "Patients can manage their medical documents"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'medical-documents' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'patient'
    )
  );

CREATE POLICY "Doctors can read medical documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'medical-documents' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  );

-- Doctor credentials policies
CREATE POLICY "Doctors can upload their credentials"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'doctor-credentials' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  );

CREATE POLICY "Doctors can manage their credentials"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'doctor-credentials' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'doctor'
    )
  );

CREATE POLICY "Admins can read doctor credentials"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'doctor-credentials' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );