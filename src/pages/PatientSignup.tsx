import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Heart, 
  Upload, 
  Camera, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ArrowLeft, 
  ArrowRight,
  Calendar,
  Clock,
  Search,
  Plus,
  AlertCircle,
  FileText,
  Shield,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  
  // Health Info
  problemDescription: string;
  duration: string;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  symptoms: string[];
  medicalHistory: string;
  currentMedications: string[];
  allergies: string[];
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Profile
  profilePhoto: File | null;
  
  // Terms
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const commonSymptoms = [
  'Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Dizziness',
  'Chest Pain', 'Shortness of Breath', 'Abdominal Pain', 'Back Pain',
  'Joint Pain', 'Muscle Aches', 'Sore Throat', 'Runny Nose',
  'Loss of Appetite', 'Sleep Problems', 'Anxiety', 'Depression'
];

const commonMedications = [
  'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Lisinopril', 'Metformin',
  'Atorvastatin', 'Omeprazole', 'Levothyroxine', 'Amlodipine', 'Metoprolol'
];

const commonAllergies = [
  'Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Latex',
  'Peanuts', 'Tree nuts', 'Shellfish', 'Eggs', 'Milk', 'Soy',
  'Pollen', 'Dust mites', 'Pet dander', 'Mold'
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

export const PatientSignup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [medicationSearch, setMedicationSearch] = useState('');
  const [allergySearch, setAllergySearch] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    problemDescription: '',
    duration: '',
    durationUnit: 'days',
    symptoms: [],
    medicalHistory: '',
    currentMedications: [],
    allergies: [],
    emergencyContactName: '',
    emergencyContactPhone: '',
    profilePhoto: null,
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;
      
      case 2:
        if (!formData.problemDescription.trim()) newErrors.problemDescription = 'Problem description is required';
        if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
        break;
      
      case 3:
        if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
        if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
        if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms of service';
        if (!formData.acceptPrivacy) newErrors.acceptPrivacy = 'You must accept the privacy policy';
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
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-green-500'];
    
    return {
      strength: (strength / 5) * 100,
      label: labels[strength - 1] || 'Very Weak',
      color: colors[strength - 1] || 'bg-red-500'
    };
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, profilePhoto: 'File size must be less than 5MB' }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Invalid file type. Use JPG, PNG, or WebP' }));
      return;
    }

    setFormData(prev => ({ ...prev, profilePhoto: file }));

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 100);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const addSymptom = (symptom: string) => {
    if (!formData.symptoms.includes(symptom)) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom]
      }));
    }
    setSymptomSearch('');
  };

  const removeSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const addMedication = (medication: string) => {
    if (!formData.currentMedications.includes(medication)) {
      setFormData(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, medication]
      }));
    }
    setMedicationSearch('');
  };

  const removeMedication = (medication: string) => {
    setFormData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter(m => m !== medication)
    }));
  };

  const addAllergy = (allergy: string) => {
    if (!formData.allergies.includes(allergy)) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy]
      }));
    }
    setAllergySearch('');
  };

  const removeAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: `${formData.firstName} ${formData.lastName}`,
            role: 'patient',
            phone: `${formData.countryCode}${formData.phone}`,
            email: formData.email
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
            role: 'patient'
          });

        if (userError) throw userError;

        // Upload profile photo if provided
        let profilePhotoUrl = null;
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

        // Update user with profile photo URL if uploaded
        if (profilePhotoUrl) {
          await supabase
            .from('users')
            .update({ profile_photo_url: profilePhotoUrl })
            .eq('id', authData.user.id);
        }

        // Create patient profile
        const { error: profileError } = await supabase
          .from('patient_profiles')
          .insert({
            user_id: authData.user.id,
            problem_description: formData.problemDescription,
            duration: `${formData.duration} ${formData.durationUnit}`,
            symptoms: formData.symptoms,
            medical_history: formData.medicalHistory,
            current_medications: formData.currentMedications,
            allergies: formData.allergies,
            emergency_contact_name: formData.emergencyContactName,
            emergency_contact_phone: formData.emergencyContactPhone
          });

        if (profileError) throw profileError;

        // Show success animation and redirect
        setTimeout(() => {
          navigate('/auth?success=signup');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

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
                errors.firstName ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-emerald-500/50'
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
                errors.lastName ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-emerald-500/50'
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
              errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-emerald-500/50'
            }`}
            placeholder="Enter your email address"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="flex space-x-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="flex items-center space-x-2 px-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                      className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 text-left"
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
                  errors.phone ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-emerald-500/50'
                }`}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.dateOfBirth ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-emerald-500/50'
              }`}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.dateOfBirth}</p>
          )}
        </div>
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
                errors.password ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-emerald-500/50'
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
                <span className={`font-medium ${passwordStrength.strength >= 80 ? 'text-green-600' : passwordStrength.strength >= 60 ? 'text-emerald-600' : 'text-red-600'}`}>
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
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-emerald-500/50'
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Health Information</h2>
        <p className="text-gray-600">Help us understand your health concerns</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What brings you to Diagnosa today?</label>
        <textarea
          value={formData.problemDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, problemDescription: e.target.value }))}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            errors.problemDescription ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-emerald-500/50'
          }`}
          placeholder="Describe your symptoms, concerns, or the reason for seeking medical care. Be as detailed as possible to help doctors understand your situation."
        />
        <p className="text-sm text-gray-500 mt-1">{formData.problemDescription.length}/1000 characters</p>
        {errors.problemDescription && (
          <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.problemDescription}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How long have you been experiencing this?</label>
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.duration ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-emerald-500/50'
              }`}
              placeholder="Enter duration"
            />
          </div>
          <select
            value={formData.durationUnit}
            onChange={(e) => setFormData(prev => ({ ...prev, durationUnit: e.target.value as any }))}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
        {errors.duration && (
          <p className="text-red-500 text-sm mt-1 animate-pulse">{errors.duration}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Symptoms</label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={symptomSearch}
            onChange={(e) => setSymptomSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Search symptoms or type your own"
          />
        </div>
        
        {symptomSearch && (
          <div className="mb-3 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
            {commonSymptoms
              .filter(symptom => symptom.toLowerCase().includes(symptomSearch.toLowerCase()))
              .map(symptom => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => addSymptom(symptom)}
                  className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors"
                >
                  {symptom}
                </button>
              ))}
            {symptomSearch && !commonSymptoms.some(s => s.toLowerCase().includes(symptomSearch.toLowerCase())) && (
              <button
                type="button"
                onClick={() => addSymptom(symptomSearch)}
                className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add "{symptomSearch}"</span>
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {formData.symptoms.map(symptom => (
            <span
              key={symptom}
              className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{symptom}</span>
              <button
                type="button"
                onClick={() => removeSymptom(symptom)}
                className="text-emerald-600 hover:text-emerald-800"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Medical History (Optional)</label>
        <textarea
          value={formData.medicalHistory}
          onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          placeholder="Previous medical conditions, surgeries, hospitalizations, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications (Optional)</label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={medicationSearch}
            onChange={(e) => setMedicationSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Search medications or type your own"
          />
        </div>
        
        {medicationSearch && (
          <div className="mb-3 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
            {commonMedications
              .filter(med => med.toLowerCase().includes(medicationSearch.toLowerCase()))
              .map(medication => (
                <button
                  key={medication}
                  type="button"
                  onClick={() => addMedication(medication)}
                  className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors"
                >
                  {medication}
                </button>
              ))}
            {medicationSearch && !commonMedications.some(m => m.toLowerCase().includes(medicationSearch.toLowerCase())) && (
              <button
                type="button"
                onClick={() => addMedication(medicationSearch)}
                className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add "{medicationSearch}"</span>
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {formData.currentMedications.map(medication => (
            <span
              key={medication}
              className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{medication}</span>
              <button
                type="button"
                onClick={() => removeMedication(medication)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Allergies (Optional)</label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={allergySearch}
            onChange={(e) => setAllergySearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Search allergies or type your own"
          />
        </div>
        
        {allergySearch && (
          <div className="mb-3 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
            {commonAllergies
              .filter(allergy => allergy.toLowerCase().includes(allergySearch.toLowerCase()))
              .map(allergy => (
                <button
                  key={allergy}
                  type="button"
                  onClick={() => addAllergy(allergy)}
                  className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors"
                >
                  {allergy}
                </button>
              ))}
            {allergySearch && !commonAllergies.some(a => a.toLowerCase().includes(allergySearch.toLowerCase())) && (
              <button
                type="button"
                onClick={() => addAllergy(allergySearch)}
                className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add "{allergySearch}"</span>
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {formData.allergies.map(allergy => (
            <span
              key={allergy}
              className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{allergy}</span>
              <button
                type="button"
                onClick={() => removeAllergy(allergy)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600">Add emergency contact and finalize your account</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all overflow-hidden"
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
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="text-white text-sm">{uploadProgress}%</div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 mb-2">Emergency Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.emergencyContactName ? 'border-red-500 focus:ring-red-500/50' : 'border-red-200 focus:ring-red-500/50'
                  }`}
                  placeholder="Emergency contact full name"
                />
                {errors.emergencyContactName && (
                  <p className="text-red-600 text-sm mt-1">{errors.emergencyContactName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.emergencyContactPhone ? 'border-red-500 focus:ring-red-500/50' : 'border-red-200 focus:ring-red-500/50'
                  }`}
                  placeholder="Emergency contact phone number"
                />
                {errors.emergencyContactPhone && (
                  <p className="text-red-600 text-sm mt-1">{errors.emergencyContactPhone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
            className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700">
            I agree to the{' '}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-emerald-600 hover:text-emerald-800 underline"
            >
              Terms of Service
            </button>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-red-500 text-sm animate-pulse">{errors.acceptTerms}</p>
        )}

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="acceptPrivacy"
            checked={formData.acceptPrivacy}
            onChange={(e) => setFormData(prev => ({ ...prev, acceptPrivacy: e.target.checked }))}
            className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="acceptPrivacy" className="text-sm text-gray-700">
            I agree to the{' '}
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="text-emerald-600 hover:text-emerald-800 underline"
            >
              Privacy Policy
            </button>
          </label>
        </div>
        {errors.acceptPrivacy && (
          <p className="text-red-500 text-sm animate-pulse">{errors.acceptPrivacy}</p>
        )}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-emerald-800 mb-1">Ready to Connect!</h4>
            <p className="text-sm text-emerald-700">
              Your account will be created and you can immediately start finding doctors and booking appointments.
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
    { number: 2, title: 'Health Details', component: renderStep2 },
    { number: 3, title: 'Complete Profile', component: renderStep3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep >= step.number
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-2 mx-4 rounded-full transition-all ${
                      currentStep > step.number ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              {steps.map((step) => (
                <span key={step.number} className={currentStep >= step.number ? 'text-emerald-600 font-medium' : ''}>
                  {step.title}
                </span>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Join Diagnosa as a Patient</h1>
                  <p className="text-emerald-100">Get connected with healthcare professionals</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {steps[currentStep - 1].component()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center p-6 bg-gray-50 border-t">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      <span>Create My Account</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Terms of Service</h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <p>By using Diagnosa, you agree to these terms...</p>
                {/* Add actual terms content here */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Privacy Policy</h3>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <p>Your privacy is important to us...</p>
                {/* Add actual privacy policy content here */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};