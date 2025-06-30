import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Stethoscope, 
  Upload, 
  Camera, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ArrowLeft, 
  ArrowRight,
  FileText,
  Award,
  MapPin,
  Clock,
  ChevronDown,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Professional Info
  specialty: string;
  yearsExperience: number;
  licenseNumber: string;
  practiceLocation: string;
  
  // Step 3: Documents
  medicalCertificate: File | null;
  licenseDocument: File | null;
  
  // Step 4: Profile
  profilePhoto: File | null;
  bio: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const specialties = [
  'Cardiology', 'Dermatology', 'Emergency Medicine', 'Family Medicine',
  'General Surgery', 'Internal Medicine', 'Neurology', 'Obstetrics & Gynecology',
  'Oncology', 'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
  'Radiology', 'Urology', 'Anesthesiology', 'Pathology', 'Physical Medicine'
];

const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
];

export const DoctorSignup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    password: '',
    confirmPassword: '',
    specialty: '',
    yearsExperience: 1,
    licenseNumber: '',
    practiceLocation: '',
    medicalCertificate: null,
    licenseDocument: null,
    profilePhoto: null,
    bio: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;
      
      case 2:
        if (!formData.specialty) newErrors.specialty = 'Specialty is required';
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        if (!formData.practiceLocation.trim()) newErrors.practiceLocation = 'Practice location is required';
        break;
      
      case 3:
        if (!formData.medicalCertificate) newErrors.medicalCertificate = 'Medical certificate is required';
        if (!formData.licenseDocument) newErrors.licenseDocument = 'License document is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength: (strength / 5) * 100,
      label: labels[strength - 1] || 'Very Weak',
      color: colors[strength - 1] || 'bg-red-500'
    };
  };

  const handleFileUpload = useCallback(async (file: File, type: 'certificate' | 'license' | 'photo') => {
    if (!file) return;

    const maxSize = type === 'photo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for photos, 10MB for documents
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [type]: `File size must be less than ${type === 'photo' ? '5MB' : '10MB'}` }));
      return;
    }

    const allowedTypes = type === 'photo' 
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [type]: `Invalid file type. ${type === 'photo' ? 'Use JPG, PNG, or WebP' : 'Use PDF, JPG, or PNG'}` }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [type === 'certificate' ? 'medicalCertificate' : type === 'license' ? 'licenseDocument' : 'profilePhoto']: file
    }));

    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = (prev[type] || 0) + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return { ...prev, [type]: 100 };
        }
        return { ...prev, [type]: newProgress };
      });
    }, 100);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, type: 'certificate' | 'license' | 'photo') => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: `${formData.firstName} ${formData.lastName}`,
            role: 'doctor',
            phone: `${formData.countryCode}${formData.phone}`
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user record in users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            phone: `${formData.countryCode}${formData.phone}`,
            role: 'doctor'
          });

        if (userError) throw userError;

        // Upload files to Supabase Storage
        const uploads = [];
        let profilePhotoUrl = null;
        
        if (formData.medicalCertificate) {
          const fileExt = formData.medicalCertificate.name.split('.').pop();
          const fileName = `${authData.user.id}/medical-certificate.${fileExt}`;
          uploads.push(
            supabase.storage
              .from('doctor-credentials')
              .upload(fileName, formData.medicalCertificate)
          );
        }
        
        if (formData.licenseDocument) {
          const fileExt = formData.licenseDocument.name.split('.').pop();
          const fileName = `${authData.user.id}/license.${fileExt}`;
          uploads.push(
            supabase.storage
              .from('doctor-credentials')
              .upload(fileName, formData.licenseDocument)
          );
        }
        
        if (formData.profilePhoto) {
          const fileExt = formData.profilePhoto.name.split('.').pop();
          const fileName = `${authData.user.id}/profile.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, formData.profilePhoto);
            
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-photos')
              .getPublicUrl(fileName);
            profilePhotoUrl = publicUrl;
          }
        }

        await Promise.all(uploads);

        // Update user with profile photo URL if uploaded
        if (profilePhotoUrl) {
          await supabase
            .from('users')
            .update({ profile_photo_url: profilePhotoUrl })
            .eq('id', authData.user.id);
        }

        // Create doctor profile
        const { error: profileError } = await supabase
          .from('doctor_profiles')
          .insert({
            user_id: authData.user.id,
            specialty: formData.specialty,
            years_experience: formData.yearsExperience,
            license_number: formData.licenseNumber,
            bio: formData.bio,
            admin_approved: false
          });

        if (profileError) throw profileError;

        navigate('/auth?success=signup');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  const passwordStrength = getPasswordStrength(formData.password);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Personal Information</h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.firstName ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
              }`}
              placeholder="Enter your first name"
            />
          </div>
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.lastName ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
              }`}
              placeholder="Enter your last name"
            />
          </div>
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
            }`}
            placeholder="Enter your email address"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <div className="flex space-x-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="flex items-center space-x-2 px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <span>{countryCodes.find(c => c.code === formData.countryCode)?.flag}</span>
              <span className="text-sm">{formData.countryCode}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showCountryDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {countryCodes.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, countryCode: country.code }));
                      setShowCountryDropdown(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-blue-50 transition-colors"
                  >
                    <span>{country.flag}</span>
                    <span className="text-sm">{country.code}</span>
                    <span className="text-sm text-gray-500">{country.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex-1 relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.phone ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
              }`}
              placeholder="Enter your phone number"
            />
          </div>
        </div>
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.phone}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.password ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
              }`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Password strength</span>
                <span className={`font-medium ${passwordStrength.strength >= 80 ? 'text-green-600' : passwordStrength.strength >= 60 ? 'text-blue-600' : 'text-red-600'}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
              }`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.confirmPassword}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Professional Information</h2>
        <p className="text-gray-600">Tell us about your medical practice</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Medical Specialty</label>
        <div className="relative">
          <div className="relative">
            <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={specialtySearch || formData.specialty}
              onChange={(e) => {
                setSpecialtySearch(e.target.value);
                setShowSpecialtyDropdown(true);
              }}
              onFocus={() => setShowSpecialtyDropdown(true)}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.specialty ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
              }`}
              placeholder="Search and select your specialty"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          {showSpecialtyDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {filteredSpecialties.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, specialty }));
                    setSpecialtySearch('');
                    setShowSpecialtyDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  {specialty}
                </button>
              ))}
              {filteredSpecialties.length === 0 && (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No specialties found
                </div>
              )}
            </div>
          )}
        </div>
        {errors.specialty && (
          <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.specialty}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of Experience: {formData.yearsExperience} years
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="range"
            min="1"
            max="50"
            value={formData.yearsExperience}
            onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) }))}
            className="w-full pl-10 pr-4 py-3 appearance-none bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(formData.yearsExperience / 50) * 100}%, #E5E7EB ${(formData.yearsExperience / 50) * 100}%, #E5E7EB 100%)`
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Medical License Number</label>
        <div className="relative">
          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.licenseNumber ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
            }`}
            placeholder="Enter your medical license number"
          />
        </div>
        {errors.licenseNumber && (
          <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.licenseNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Practice Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.practiceLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, practiceLocation: e.target.value }))}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.practiceLocation ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
            }`}
            placeholder="City, State/Country"
          />
        </div>
        {errors.practiceLocation && (
          <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.practiceLocation}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Verification</h2>
        <p className="text-gray-600">Upload your medical credentials for verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Medical Certificate</label>
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'certificate')}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 ${
              errors.medicalCertificate ? 'border-red-300 bg-red-50/50' : 'border-gray-300'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.medicalCertificate ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-green-500 mx-auto" />
                <p className="text-sm font-medium text-gray-800">{formData.medicalCertificate.name}</p>
                <p className="text-xs text-gray-500">
                  {(formData.medicalCertificate.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadProgress.certificate !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.certificate}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-sm font-medium text-gray-600">Drop your medical certificate here</p>
                <p className="text-xs text-gray-500">or click to browse (PDF, JPG, PNG - max 10MB)</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'certificate')}
            className="hidden"
          />
          {errors.medicalCertificate && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.medicalCertificate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Document</label>
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'license')}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 ${
              errors.licenseDocument ? 'border-red-300 bg-red-50/50' : 'border-gray-300'
            }`}
            onClick={() => licenseInputRef.current?.click()}
          >
            {formData.licenseDocument ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-green-500 mx-auto" />
                <p className="text-sm font-medium text-gray-800">{formData.licenseDocument.name}</p>
                <p className="text-xs text-gray-500">
                  {(formData.licenseDocument.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadProgress.license !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.license}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-sm font-medium text-gray-600">Drop your license document here</p>
                <p className="text-xs text-gray-500">or click to browse (PDF, JPG, PNG - max 10MB)</p>
              </div>
            )}
          </div>
          <input
            ref={licenseInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'license')}
            className="hidden"
          />
          {errors.licenseDocument && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.licenseDocument}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Document Requirements</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Medical degree certificate or diploma</li>
              <li>• Valid medical license from your jurisdiction</li>
              <li>• Documents must be clear and legible</li>
              <li>• Accepted formats: PDF, JPG, PNG (max 10MB each)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600">Add a photo and bio to help patients connect with you</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'photo')}
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all overflow-hidden"
            onClick={() => photoInputRef.current?.click()}
          >
            {formData.profilePhoto ? (
              <img
                src={URL.createObjectURL(formData.profilePhoto)}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Add Photo</p>
              </div>
            )}
          </div>
          {uploadProgress.photo !== undefined && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="text-white text-sm">{uploadProgress.photo}%</div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'photo')}
        className="hidden"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          placeholder="Tell patients about your background, expertise, and approach to care. This helps them understand your qualifications and feel comfortable choosing you as their doctor."
        />
        <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-green-800 mb-1">Almost Done!</h4>
            <p className="text-sm text-green-700">
              Your account will be created and submitted for admin approval. You'll receive an email notification once approved.
            </p>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        </div>
      )}
    </div>
  );

  const steps = [
    { number: 1, title: 'Personal Info', component: renderStep1 },
    { number: 2, title: 'Professional', component: renderStep2 },
    { number: 3, title: 'Documents', component: renderStep3 },
    { number: 4, title: 'Profile', component: renderStep4 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-teal-600 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep >= step.number
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/20 text-white/70'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 transition-all ${
                      currentStep > step.number ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-white/80">
              {steps.map((step) => (
                <span key={step.number} className={currentStep >= step.number ? 'text-white font-medium' : ''}>
                  {step.title}
                </span>
              ))}
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Join as a Doctor</h1>
              <p className="text-white/80">Create your professional account on Diagnosa</p>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-xl p-6">
              {steps[currentStep - 1].component()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => navigate('/')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all bg-white/20 text-white hover:bg-white/30`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-white/90 transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Complete Registration</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Medical Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center mb-8 mx-auto backdrop-blur-sm border border-white/20">
            <Stethoscope className="w-32 h-32 text-white/80" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Welcome to Diagnosa</h2>
          <p className="text-xl text-white/80 mb-6">Join thousands of healthcare professionals</p>
          <div className="space-y-4 text-left max-w-md">
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>Connect with patients worldwide</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>Secure, HIPAA-compliant platform</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>Flexible scheduling and telemedicine</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>Professional verification process</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};