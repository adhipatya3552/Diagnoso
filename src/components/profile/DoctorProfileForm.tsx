import React, { useState } from 'react';
import { User, Mail, Phone, Stethoscope, Award, MapPin, DollarSign, Clock, Globe, Building, Save, Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { useToast } from '../../hooks/useToast';

export interface DoctorProfileData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  
  // Professional Information
  specialty: string;
  yearsExperience: number;
  licenseNumber: string;
  bio: string;
  consultationFee: number;
  
  // Education & Certifications
  education: string[];
  certifications: string[];
  
  // Practice Information
  languages: string[];
  hospitalAffiliations: string[];
  officeAddress: string;
  
  // Availability
  availabilityHours: {
    [key: string]: { start: string; end: string; available: boolean };
  };
}

export interface DoctorProfileFormProps {
  initialData?: Partial<DoctorProfileData>;
  onSave: (data: DoctorProfileData) => Promise<void>;
  loading?: boolean;
  className?: string;
}

const specialties = [
  'Cardiology', 'Dermatology', 'Emergency Medicine', 'Family Medicine',
  'General Surgery', 'Internal Medicine', 'Neurology', 'Obstetrics & Gynecology',
  'Oncology', 'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
  'Radiology', 'Urology', 'Anesthesiology', 'Pathology', 'Physical Medicine'
];

const commonLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
];

const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const DoctorProfileForm: React.FC<DoctorProfileFormProps> = ({
  initialData = {},
  onSave,
  loading = false,
  className = ''
}) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState<DoctorProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    yearsExperience: 0,
    licenseNumber: '',
    bio: '',
    consultationFee: 0,
    education: [],
    certifications: [],
    languages: ['English'],
    hospitalAffiliations: [],
    officeAddress: '',
    availabilityHours: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '13:00', available: false },
      sunday: { start: '09:00', end: '13:00', available: false }
    },
    ...initialData
  });

  const [newEducation, setNewEducation] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAffiliation, setNewAffiliation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof DoctorProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayAdd = (field: 'education' | 'certifications' | 'languages' | 'hospitalAffiliations', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field: 'education' | 'certifications' | 'languages' | 'hospitalAffiliations', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleAvailabilityChange = (day: string, field: 'start' | 'end' | 'available', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      availabilityHours: {
        ...prev.availabilityHours,
        [day]: {
          ...prev.availabilityHours[day],
          [field]: value
        }
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.specialty) newErrors.specialty = 'Specialty is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (formData.yearsExperience < 0) newErrors.yearsExperience = 'Years of experience must be positive';
    if (formData.consultationFee < 0) newErrors.consultationFee = 'Consultation fee must be positive';

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
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Stethoscope className="w-5 h-5 text-teal-500 mr-2" />
          Professional Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Specialty *
            </label>
            <select
              value={formData.specialty}
              onChange={(e) => handleInputChange('specialty', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                errors.specialty ? 'border-red-500' : 'border-gray-200'
              }`}
              required
            >
              <option value="">Select your specialty</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            {errors.specialty && (
              <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>
            )}
          </div>
          
          <Input
            label="Years of Experience"
            type="number"
            min="0"
            value={formData.yearsExperience}
            onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
            error={errors.yearsExperience}
            icon={Award}
            required
          />
          
          <Input
            label="Medical License Number"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            error={errors.licenseNumber}
            icon={Award}
            required
          />
          
          <Input
            label="Consultation Fee (USD)"
            type="number"
            min="0"
            step="0.01"
            value={formData.consultationFee}
            onChange={(e) => handleInputChange('consultationFee', parseFloat(e.target.value) || 0)}
            error={errors.consultationFee}
            icon={DollarSign}
          />
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Tell patients about your background, expertise, and approach to care..."
          />
        </div>
      </div>

      {/* Education & Certifications */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Award className="w-5 h-5 text-purple-500 mr-2" />
          Education & Certifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education
            </label>
            <div className="space-y-2 mb-3">
              {formData.education.map((edu, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-800">{edu}</span>
                  <button
                    type="button"
                    onClick={() => handleArrayRemove('education', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newEducation}
                onChange={(e) => setNewEducation(e.target.value)}
                placeholder="Add education"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayAdd('education', newEducation);
                    setNewEducation('');
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleArrayAdd('education', newEducation);
                  setNewEducation('');
                }}
                icon={Plus}
              >
                Add
              </Button>
            </div>
          </div>
          
          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certifications
            </label>
            <div className="space-y-2 mb-3">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-800">{cert}</span>
                  <button
                    type="button"
                    onClick={() => handleArrayRemove('certifications', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Add certification"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayAdd('certifications', newCertification);
                    setNewCertification('');
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleArrayAdd('certifications', newCertification);
                  setNewCertification('');
                }}
                icon={Plus}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Building className="w-5 h-5 text-green-500 mr-2" />
          Practice Information
        </h3>
        
        <div className="space-y-6">
          <Input
            label="Office Address"
            value={formData.officeAddress}
            onChange={(e) => handleInputChange('officeAddress', e.target.value)}
            icon={MapPin}
            placeholder="Enter your practice location"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Spoken
              </label>
              <div className="space-y-2 mb-3">
                {formData.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-800">{lang}</span>
                    {formData.languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('languages', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Select language</option>
                  {commonLanguages
                    .filter(lang => !formData.languages.includes(lang))
                    .map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newLanguage) {
                      handleArrayAdd('languages', newLanguage);
                      setNewLanguage('');
                    }
                  }}
                  icon={Plus}
                >
                  Add
                </Button>
              </div>
            </div>
            
            {/* Hospital Affiliations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Affiliations
              </label>
              <div className="space-y-2 mb-3">
                {formData.hospitalAffiliations.map((hospital, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-800">{hospital}</span>
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('hospitalAffiliations', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAffiliation}
                  onChange={(e) => setNewAffiliation(e.target.value)}
                  placeholder="Add hospital affiliation"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayAdd('hospitalAffiliations', newAffiliation);
                      setNewAffiliation('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleArrayAdd('hospitalAffiliations', newAffiliation);
                    setNewAffiliation('');
                  }}
                  icon={Plus}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Hours */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Clock className="w-5 h-5 text-orange-500 mr-2" />
          Availability Hours
        </h3>
        
        <div className="space-y-4">
          {daysOfWeek.map(day => (
            <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-24">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.availabilityHours[day]?.available || false}
                    onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </span>
                </label>
              </div>
              
              {formData.availabilityHours[day]?.available && (
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={formData.availabilityHours[day]?.start || '09:00'}
                    onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={formData.availabilityHours[day]?.end || '17:00'}
                    onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              )}
            </div>
          ))}
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