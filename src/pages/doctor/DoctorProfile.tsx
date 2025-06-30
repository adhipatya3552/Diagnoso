import React, { useState, useEffect } from 'react';
import { DoctorProfileForm, DoctorProfileData } from '../../components/profile/DoctorProfileForm';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useToast } from '../../hooks/useToast';

export const DoctorProfile: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [profileData, setProfileData] = useState<Partial<DoctorProfileData>>({});
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

      // Fetch doctor profile data
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (doctorError && doctorError.code !== 'PGRST116') {
        throw doctorError;
      }

      // Combine the data
      const combinedData: Partial<DoctorProfileData> = {
        firstName: userData.name?.split(' ')[0] || '',
        lastName: userData.name?.split(' ').slice(1).join(' ') || '',
        email: userData.email,
        phone: userData.phone || '',
        profilePhoto: userData.profile_photo_url,
        specialty: doctorData?.specialty || '',
        yearsExperience: doctorData?.years_experience || 0,
        licenseNumber: doctorData?.license_number || '',
        bio: doctorData?.bio || '',
        consultationFee: doctorData?.consultation_fee || 0,
        education: doctorData?.education || [],
        certifications: doctorData?.certifications || [],
        languages: doctorData?.languages_spoken || ['English'],
        hospitalAffiliations: doctorData?.hospital_affiliations || [],
        officeAddress: '', // This would come from a separate address table
        availabilityHours: doctorData?.availability_hours || {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '13:00', available: false },
          sunday: { start: '09:00', end: '13:00', available: false }
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

  const handleSave = async (data: DoctorProfileData) => {
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

      // Update or insert doctor profile
      const { error: doctorError } = await supabase
        .from('doctor_profiles')
        .upsert({
          user_id: user.id,
          specialty: data.specialty,
          years_experience: data.yearsExperience,
          license_number: data.licenseNumber,
          bio: data.bio,
          consultation_fee: data.consultationFee,
          education: data.education,
          certifications: data.certifications,
          languages_spoken: data.languages,
          hospital_affiliations: data.hospitalAffiliations,
          availability_hours: data.availabilityHours
        });

      if (doctorError) throw doctorError;

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
          <p className="text-gray-600 mt-2">Manage your professional information and credentials</p>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg">
          <span className="font-medium">
            {profileData.specialty ? 'Profile Active' : 'Complete Your Profile'}
          </span>
        </div>
      </div>

      <DoctorProfileForm
        initialData={profileData}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  );
};