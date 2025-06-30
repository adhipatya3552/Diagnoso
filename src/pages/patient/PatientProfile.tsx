import React, { useState, useEffect } from 'react';
import { PatientProfileForm, PatientProfileData } from '../../components/profile/PatientProfileForm';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useToast } from '../../hooks/useToast';

export const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [profileData, setProfileData] = useState<Partial<PatientProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Fetch patient profile data
      const { data: patientData, error: patientError } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (patientError && patientError.code !== 'PGRST116') {
        throw patientError;
      }

      // Combine the data
      const combinedData: Partial<PatientProfileData> = {
        firstName: userData.name?.split(' ')[0] || '',
        lastName: userData.name?.split(' ').slice(1).join(' ') || '',
        email: userData.email,
        phone: userData.phone || '',
        profilePhoto: userData.profile_photo_url,
        dateOfBirth: '', // This would need to be added to the users table or patient_profiles
        bloodType: '',
        height: '',
        weight: '',
        problemDescription: patientData?.problem_description || '',
        duration: patientData?.duration || '',
        symptoms: patientData?.symptoms || [],
        medicalHistory: patientData?.medical_history || '',
        currentMedications: patientData?.current_medications || [],
        allergies: patientData?.allergies || [],
        emergencyContactName: patientData?.emergency_contact_name || '',
        emergencyContactPhone: patientData?.emergency_contact_phone || '',
        emergencyContactRelation: 'Spouse',
        preferredLanguage: 'English',
        communicationPreferences: {
          email: true,
          sms: true,
          phone: false
        }
      };

      setProfileData(combinedData);
    } catch (err: any) {
      error('Failed to load profile data');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: PatientProfileData) => {
    if (!user) return;

    setSaving(true);
    try {
      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          profile_photo_url: data.profilePhoto
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update or insert patient profile
      const { error: patientError } = await supabase
        .from('patient_profiles')
        .upsert({
          user_id: user.id,
          problem_description: data.problemDescription,
          duration: data.duration,
          symptoms: data.symptoms,
          medical_history: data.medicalHistory,
          current_medications: data.currentMedications,
          allergies: data.allergies,
          emergency_contact_name: data.emergencyContactName,
          emergency_contact_phone: data.emergencyContactPhone
        });

      if (patientError) throw patientError;

      success('Profile updated successfully!');
      
      // Refresh the profile data
      await fetchProfileData();
    } catch (err: any) {
      error('Failed to update profile');
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <LoadingSkeleton variant="circular" width={160} height={160} className="mx-auto mb-4" />
          <LoadingSkeleton variant="text" width="200px" className="mx-auto" />
        </div>
        
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <LoadingSkeleton variant="text" width="200px" className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <LoadingSkeleton variant="text" width="100px" className="mb-2" />
                    <LoadingSkeleton variant="rectangular" height="48px" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal and health information</p>
        </div>
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg">
          <span className="font-medium">
            {profileData.problemDescription ? 'Profile Complete' : 'Complete Your Profile'}
          </span>
        </div>
      </div>

      <PatientProfileForm
        initialData={profileData}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  );
};