import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  X, 
  Stethoscope, 
  Heart, 
  Pill, 
  Cross,
  ChevronDown,
  Send,
  Timer,
  Shield,
  Zap,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface LoginFormData {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
}

interface ForgotPasswordData {
  email: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  
  const [isEmailMode, setIsEmailMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resetTimer, setResetTimer] = useState(0);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<LoginFormData>({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });

  const [forgotData, setForgotData] = useState<ForgotPasswordData>({
    email: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [forgotErrors, setForgotErrors] = useState<ValidationErrors>({});

  // Floating medical icons animation
  const [floatingIcons, setFloatingIcons] = useState([
    { icon: Stethoscope, x: 15, y: 20, rotation: 0, speed: 0.5 },
    { icon: Heart, x: 85, y: 30, rotation: 45, speed: 0.7 },
    { icon: Pill, x: 20, y: 75, rotation: 90, speed: 0.6 },
    { icon: Cross, x: 80, y: 80, rotation: 135, speed: 0.4 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingIcons(prev => prev.map(icon => ({
        ...icon,
        rotation: icon.rotation + icon.speed
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Reset timer countdown
  useEffect(() => {
    if (resetTimer > 0) {
      const interval = setInterval(() => {
        setResetTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resetTimer]);

  // Auto-focus inputs when switching modes
  useEffect(() => {
    if (isEmailMode && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (!isEmailMode && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, [isEmailMode]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = isEmailMode ? 'Email is required' : 'Phone number is required';
    } else if (isEmailMode && !/\S+@\S+\.\S+/.test(formData.emailOrPhone)) {
      newErrors.emailOrPhone = 'Please enter a valid email address';
    } else if (!isEmailMode && !/^\d{10,15}$/.test(formData.emailOrPhone.replace(/\D/g, ''))) {
      newErrors.emailOrPhone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!forgotData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(forgotData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setForgotErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { error } = await signIn(formData.emailOrPhone, formData.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ 
            submit: 'Invalid email/phone or password. Please check your credentials and try again.' 
          });
        } else {
          setErrors({ submit: error.message });
        }
        
        const form = e.currentTarget as HTMLFormElement;
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
        return;
      }

      // Success animation
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-success');
      
      const from = location.state?.from?.pathname || '/dashboard';
      setTimeout(() => navigate(from), 1000);
      
    } catch (error: any) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForgotForm()) return;

    setForgotLoading(true);
    setForgotErrors({});

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setForgotSuccess(true);
      setResetTimer(60);
      
    } catch (error: any) {
      setForgotErrors({ submit: error.message });
    } finally {
      setForgotLoading(false);
    }
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, emailOrPhone: formatted }));
  };

  const toggleInputMode = () => {
    setIsEmailMode(!isEmailMode);
    setFormData(prev => ({ ...prev, emailOrPhone: '' }));
    setErrors({});
  };

  return (
    <div className="min-h-screen flex font-['Inter',sans-serif]">
      {/* Left Side - Form */}
      <div className="flex-1 lg:w-3/5 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600">
          {/* Animated particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
          
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />
          </div>
        </div>

        {/* Form Container */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <div className="w-full max-w-md">
            {/* Glass morphism container */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                  <Cross className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-white/80">Sign in to your Diagnosa account</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Global Error */}
                {errors.submit && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <X className="w-4 h-4 flex-shrink-0" />
                      <span>{errors.submit}</span>
                    </div>
                  </div>
                )}

                {/* Email/Phone Toggle */}
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-white/10 rounded-full p-1 backdrop-blur-sm border border-white/20">
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => !isEmailMode && toggleInputMode()}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          isEmailMode 
                            ? 'bg-white text-blue-600 shadow-lg' 
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        <Mail className={`w-4 h-4 transition-transform duration-300 ${isEmailMode ? 'rotate-0' : 'rotate-180'}`} />
                        <span>Email</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => isEmailMode && toggleInputMode()}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          !isEmailMode 
                            ? 'bg-white text-blue-600 shadow-lg' 
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        <Phone className={`w-4 h-4 transition-transform duration-300 ${!isEmailMode ? 'rotate-0' : 'rotate-180'}`} />
                        <span>Phone</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email/Phone Input */}
                <div className="space-y-2">
                  <label className="block text-white/80 text-sm font-medium">
                    {isEmailMode ? 'Email Address' : 'Phone Number'}
                  </label>
                  
                  {isEmailMode ? (
                    <div className="relative group">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        errors.emailOrPhone ? 'text-red-400' : 'text-white/50 group-focus-within:text-white/80'
                      }`} />
                      <input
                        ref={emailInputRef}
                        type="email"
                        value={formData.emailOrPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, emailOrPhone: e.target.value }))}
                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                          errors.emailOrPhone 
                            ? 'border-red-500/50 focus:ring-red-500/50' 
                            : 'border-white/20 focus:ring-white/30 focus:border-white/40 hover:border-white/30'
                        }`}
                        placeholder="Enter your email address"
                      />
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="flex items-center space-x-2 px-3 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all backdrop-blur-sm"
                        >
                          <span>{countryCodes.find(c => c.code === selectedCountryCode)?.flag}</span>
                          <span className="text-sm text-white">{selectedCountryCode}</span>
                          <ChevronDown className="w-4 h-4 text-white/70" />
                        </button>
                        
                        {showCountryDropdown && (
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                            {countryCodes.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountryCode(country.code);
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-blue-50 text-left transition-colors"
                              >
                                <span>{country.flag}</span>
                                <span className="text-sm text-gray-800">{country.code}</span>
                                <span className="text-sm text-gray-500">{country.country}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 relative group">
                        <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                          errors.emailOrPhone ? 'text-red-400' : 'text-white/50 group-focus-within:text-white/80'
                        }`} />
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          value={formData.emailOrPhone}
                          onChange={handlePhoneChange}
                          className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                            errors.emailOrPhone 
                              ? 'border-red-500/50 focus:ring-red-500/50' 
                              : 'border-white/20 focus:ring-white/30 focus:border-white/40 hover:border-white/30'
                          }`}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  )}
                  
                  {errors.emailOrPhone && (
                    <p className="text-red-300 text-sm animate-fade-in">{errors.emailOrPhone}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-white/80 text-sm font-medium">Password</label>
                  <div className="relative group">
                    <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      errors.password ? 'text-red-400' : 'text-white/50 group-focus-within:text-white/80'
                    }`} />
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                        errors.password 
                          ? 'border-red-500/50 focus:ring-red-500/50' 
                          : 'border-white/20 focus:ring-white/30 focus:border-white/40 hover:border-white/30'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors duration-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 transform transition-transform duration-300" />
                      ) : (
                        <Eye className="w-5 h-5 transform transition-transform duration-300" />
                      )}
                    </button>
                  </div>
                  
                  {errors.password && (
                    <p className="text-red-300 text-sm animate-fade-in">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                        formData.rememberMe 
                          ? 'bg-white border-white' 
                          : 'border-white/30 group-hover:border-white/50'
                      }`}>
                        {formData.rememberMe && (
                          <Check className="w-3 h-3 text-blue-600 absolute top-0.5 left-0.5 animate-scale-in" />
                        )}
                      </div>
                    </div>
                    <span className="text-white/80 text-sm group-hover:text-white transition-colors">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-white/80 text-sm hover:text-white transition-colors duration-300 relative group"
                  >
                    Forgot Password?
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  )}
                </button>

                {/* Social Login */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-white/60">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group"
                  >
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">G</span>
                    </div>
                    <span className="text-white/80 text-sm group-hover:text-white">Google</span>
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group"
                  >
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-800">🍎</span>
                    </div>
                    <span className="text-white/80 text-sm group-hover:text-white">Apple</span>
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-white/70">
                    Don't have an account?{' '}
                    <Link 
                      to="/" 
                      className="text-white font-medium hover:text-blue-200 transition-colors duration-300 relative group"
                    >
                      Sign up here
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-200 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Medical Illustration */}
      <div className="hidden lg:flex lg:w-2/5 bg-slate-900 relative overflow-hidden">
        {/* Floating Medical Icons */}
        {floatingIcons.map((iconData, index) => {
          const IconComponent = iconData.icon;
          return (
            <div
              key={index}
              className="absolute text-white/20 transition-all duration-1000 ease-in-out"
              style={{
                left: `${iconData.x}%`,
                top: `${iconData.y}%`,
                transform: `rotate(${iconData.rotation}deg)`
              }}
            >
              <IconComponent className="w-12 h-12" />
            </div>
          );
        })}

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-full p-12">
          <div className="text-center text-white max-w-md">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-8 mx-auto backdrop-blur-sm border border-white/20">
              <Stethoscope className="w-16 h-16 text-white/80" />
            </div>
            
            <h2 className="text-4xl font-bold mb-6">Secure Healthcare Platform</h2>
            <p className="text-xl text-white/80 mb-8">
              Connect with healthcare professionals worldwide through our HIPAA-compliant platform
            </p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-white/90">End-to-end encryption</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-white/90">Instant consultations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-white/90">Trusted by millions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl max-w-md w-full shadow-2xl animate-slide-down">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Reset Password</h3>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccess(false);
                    setForgotData({ email: '' });
                    setForgotErrors({});
                    setResetTimer(0);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6 transform transition-transform duration-300 hover:rotate-90" />
                </button>
              </div>

              {!forgotSuccess ? (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <p className="text-gray-600 mb-4">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    
                    <div className="relative group">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        forgotErrors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
                      }`} />
                      <input
                        type="email"
                        value={forgotData.email}
                        onChange={(e) => setForgotData({ email: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                          forgotErrors.email 
                            ? 'border-red-500 focus:ring-red-500/50' 
                            : 'border-gray-200 focus:ring-blue-500/50 focus:border-blue-500'
                        }`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    {forgotErrors.email && (
                      <p className="text-red-500 text-sm mt-1 animate-fade-in">{forgotErrors.email}</p>
                    )}
                    
                    {forgotErrors.submit && (
                      <p className="text-red-500 text-sm mt-1 animate-fade-in">{forgotErrors.submit}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || resetTimer > 0}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                  >
                    {forgotLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : resetTimer > 0 ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Timer className="w-5 h-5" />
                        <span>Resend in {resetTimer}s</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        <span>Send Reset Link</span>
                      </div>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                      <Send className="w-6 h-6 text-white animate-fly" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</h4>
                    <p className="text-gray-600">
                      We've sent a password reset link to <strong>{forgotData.email}</strong>
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      Didn't receive the email? Check your spam folder or try again in {resetTimer} seconds.
                    </p>
                  </div>
                  
                  {resetTimer > 0 && (
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <div className="w-8 h-8 relative">
                        <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
                        <div 
                          className="absolute inset-0 border-2 border-blue-500 rounded-full transition-all duration-1000"
                          style={{
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + (50 * (60 - resetTimer) / 60)}% 0%, ${50 + (50 * (60 - resetTimer) / 60)}% 100%, 50% 100%)`
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium">{resetTimer}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};