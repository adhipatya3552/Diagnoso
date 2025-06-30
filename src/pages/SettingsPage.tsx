import React from 'react';
import { SettingsPage as SettingsComponent, SettingsData } from '../components/profile/SettingsPage';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';

export const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { success, error } = useToast();

  const handleSave = async (data: Partial<SettingsData>) => {
    if (!user) return;

    try {
      // Here you would save the settings to your database
      // For now, we'll just simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving settings:', data);
      // You could save to a user_settings table or update user preferences
    } catch (err: any) {
      console.error('Error saving settings:', err);
      throw err;
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // Delete user data from your tables first
      const { error: profileError } = await supabase
        .from(user.role === 'doctor' ? 'doctor_profiles' : 'patient_profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (userError) throw userError;

      // Delete from auth.users (this should cascade)
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) throw authError;

      // Sign out the user
      await signOut();
    } catch (err: any) {
      console.error('Error deleting account:', err);
      throw err;
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      // Fetch all user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: profileData } = await supabase
        .from(user.role === 'doctor' ? 'doctor_profiles' : 'patient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('*')
        .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`);

      // Create export data
      const exportData = {
        user: userData,
        profile: profileData,
        appointments: appointmentData,
        exportDate: new Date().toISOString()
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnosa-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error exporting data:', err);
      throw err;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-500">Please log in to access settings.</p>
      </div>
    );
  }

  return (
    <SettingsComponent
      userRole={user.role}
      onSave={handleSave}
      onDeleteAccount={handleDeleteAccount}
      onExportData={handleExportData}
    />
  );
};