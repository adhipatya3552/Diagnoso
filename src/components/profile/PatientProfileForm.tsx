import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Heart, Pill, Shield, AlertCircle, Save, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { useToast } from '../../hooks/useToast';

export interface PatientProfileData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: string;
  height: string;
  weight: string;
  profilePhoto?: string;
  
  // Health Information
  problemDescription: string;
  duration: string;
  symptoms: string[];
  medicalHistory: string;
  currentMedications: string[];
  allergies: string[];
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Insurance Information
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  
  // Preferences
  preferredLanguage: string;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
}

export interface PatientProfileFormProps {
  initialData?: Partial<PatientProfileData>;
  onSave: (data: PatientProfileData) => Promise<void>;
  loading?: boolean;
  className?: string;
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const relations = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];
const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese'];

const commonSymptoms = [
  'Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Dizziness',
  'Chest Pain', 'Shortness of Breath', 'Abdominal Pain', 'Back Pain',
  'Joint Pain', 'Muscle Aches', 'Sore Throat', 'Runny Nose'
];

const commonMedications = [
  'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Lisinopril', 'Metformin',
  'Atorvastatin', 'Omeprazole', 'Levothyroxine', 'Amlodipine', 'Metoprolol'
];

const commonAllergies = [
  'Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Latex',
  'Peanuts', 'Tree nuts', 'Shellfish', 'Eggs', 'Milk', 'Soy'
];

export const PatientProfileForm: React.FC<PatientProfileFormProps> = ({
  initialData = {},
  onSave,
  loading = false,
  className = ''
}) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState<PatientProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bloodType: '',
    height: '',
    weight: '',
    problemDescription: '',
    duration: '',
    symptoms: [],
    medicalHistory: '',
    currentMedications: [],
    allergies: [],
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Spouse',
    preferredLanguage: 'English',
    communicationPreferences: {
      email: true,
      sms: true,
      phone: false
    },
    ...initialData
  });

  const [newSymptom, setNewSymptom] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PatientProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayAdd = (field: 'symptoms' | 'currentMedications' | 'allergies', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field: 'symptoms' | 'currentMedications' | 'allergies', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleCommunicationPreferenceChange = (type: 'email' | 'sms' | 'phone', value: boolean) => {
    setFormData(prev => ({
      ...prev,
      communicationPreferences: {
        ...prev.communicationPreferences,
        [type]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      error('Please fix the errors in the form');
      return;
    }

    try {
      await onSave(formData);
      success('Profile updated successfully!');
    } catch (err) {
      error('Failed to update profile. Please try again.');
    }
  };

  const handlePhotoChange = (file: File, croppedDataUrl: string) => {
    setFormData(prev => ({ ...prev, profilePhoto: croppedDataUrl }));
  };

  const handlePhotoRemove = () => {
    setFormData(prev => ({ ...prev, profilePhoto: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-8 ${className}`}>
      {/* Profile Photo */}
      <div className="text-center">
        <ProfilePhotoUpload
          currentPhoto={formData.profilePhoto}
          onPhotoChange={handlePhotoChange}
          onPhotoRemove={handlePhotoRemove}
          size="xl"
          className="mx-auto"
        />
        <p className="text-sm text-gray-600 mt-2">
          Click to upload or change your profile photo
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <User className="w-5 h-5 text-blue-500 mr-2" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
            icon={User}
            required
          />
          
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
            icon={User}
            required
          />
          
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            icon={Mail}
            required
          />
          
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            icon={Phone}
            required
          />
          
          <Input
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
            icon={Calendar}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Type
            </label>
            <select
              value={formData.bloodType}
              onChange={(e) => handleInputChange('bloodType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">Select blood type</option>
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <Input
            label="Height"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            placeholder={`e.g., 5'10" or 178 cm`}
          />
          
          <Input
            label="Weight"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            placeholder="e.g., 165 lbs or 75 kg"
          />
        </div>
      </div>

      {/* Health Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Heart className="w-5 h-5 text-red-500 mr-2" />
          Health Information
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Health Concern
            </label>
            <textarea
              value={formData.problemDescription}
              onChange={(e) => handleInputChange('problemDescription', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Describe your current health concerns or symptoms..."
            />
          </div>
          
          <Input
            label="Duration of Symptoms"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            placeholder="e.g., 2 weeks, 1 month"
          />
          
          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Symptoms
            </label>
            <div className="space-y-2 mb-3">
              {formData.symptoms.map((symptom, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-800">{symptom}</span>
                  <button
                    type="button"
                    onClick={() => handleArrayRemove('symptoms', index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <select
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Select or add symptom</option>
                {commonSymptoms
                  .filter(symptom => !formData.symptoms.includes(symptom))
                  .map(symptom => (
                    <option key={symptom} value={symptom}>{symptom}</option>
                  ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (newSymptom) {
                    handleArrayAdd('symptoms', newSymptom);
                    setNewSymptom('');
                  }
                }}
                icon={Plus}
              >
                Add
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical History
            </label>
            <textarea
              value={formData.medicalHistory}
              onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Previous medical conditions, surgeries, hospitalizations, etc."
            />
          </div>
        </div>
      </div>

      {/* Medications & Allergies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Medications */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Pill className="w-5 h-5 text-purple-500 mr-2" />
            Current Medications
          </h3>
          
          <div className="space-y-2 mb-4">
            {formData.currentMedications.map((medication, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-purple-800">{medication}</span>
                <button
                  type="button"
                  onClick={() => handleArrayRemove('currentMedications', index)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <select
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">Select or add medication</option>
              {commonMedications
                .filter(med => !formData.currentMedications.includes(med))
                .map(medication => (
                  <option key={medication} value={medication}>{medication}</option>
                ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (newMedication) {
                  handleArrayAdd('currentMedications', newMedication);
                  setNewMedication('');
                }
              }}
              icon={Plus}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 text-red-500 mr-2" />
            Allergies
          </h3>
          
          <div className="space-y-2 mb-4">
            {formData.allergies.map((allergy, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-red-800">{allergy}</span>
                <button
                  type="button"
                  onClick={() => handleArrayRemove('allergies', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <select
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="">Select or add allergy</option>
              {commonAllergies
                .filter(allergy => !formData.allergies.includes(allergy))
                .map(allergy => (
                  <option key={allergy} value={allergy}>{allergy}</option>
                ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (newAllergy) {
                  handleArrayAdd('allergies', newAllergy);
                  setNewAllergy('');
                }
              }}
              icon={Plus}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-red-800 mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          Emergency Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Contact Name"
            value={formData.emergencyContactName}
            onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
            error={errors.emergencyContactName}
            required
          />
          
          <Input
            label="Contact Phone"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
            error={errors.emergencyContactPhone}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-red-700 mb-2">
              Relationship *
            </label>
            <select
              value={formData.emergencyContactRelation}
              onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
              className="w-full px-4 py-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            >
              {relations.map(relation => (
                <option key={relation} value={relation}>{relation}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Insurance Information (Optional)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Insurance Provider"
            value={formData.insuranceProvider || ''}
            onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
            placeholder="e.g., Blue Cross Blue Shield"
          />
          
          <Input
            label="Policy Number"
            value={formData.insurancePolicyNumber || ''}
            onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
            placeholder="Enter your policy number"
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Communication Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Language
            </label>
            <select
              value={formData.preferredLanguage}
              onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {languages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you like to receive notifications?
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.communicationPreferences.email}
                  onChange={(e) => handleCommunicationPreferenceChange('email', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.communicationPreferences.sms}
                  onChange={(e) => handleCommunicationPreferenceChange('sms', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">SMS notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.communicationPreferences.phone}
                  onChange={(e) => handleCommunicationPreferenceChange('phone', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Phone calls</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={Save}
        >
          Save Profile
        </Button>
      </div>
    </form>
  );
};