import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, X, Shield, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<ResetPasswordData>({
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Check for valid reset token
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      navigate('/auth', { 
        state: { error: 'Invalid or expired reset link. Please request a new one.' }
      });
    }
  }, [searchParams, navigate]);

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

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
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
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/auth', { 
          state: { success: 'Password reset successfully! Please sign in with your new password.' }
        });
      }, 3000);

    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600 animate-scale-in" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your password has been updated successfully. You will be redirected to the login page shortly.
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
            <span className="text-sm">Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 flex items-center justify-center p-4 font-['Inter',sans-serif]">
      <div className="w-full max-w-md">
        {/* Glass Morphism Container */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-white/80">Create a new secure password for your account</p>
          </div>

          {/* Reset Form */}
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

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium">New Password</label>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  errors.password ? 'text-red-400' : 'text-white/50 group-focus-within:text-white/80'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                    errors.password 
                      ? 'border-red-500/50 focus:ring-red-500/50 animate-shake' 
                      : 'border-white/20 focus:ring-white/30 focus:border-white/40 hover:border-white/30'
                  }`}
                  placeholder="Enter your new password"
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/70">Password strength</span>
                    <span className={`font-medium ${
                      passwordStrength.strength >= 80 ? 'text-green-300' : 
                      passwordStrength.strength >= 60 ? 'text-blue-300' : 
                      'text-red-300'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-red-300 text-sm animate-fade-in">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium">Confirm New Password</label>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  errors.confirmPassword ? 'text-red-400' : 'text-white/50 group-focus-within:text-white/80'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                    errors.confirmPassword 
                      ? 'border-red-500/50 focus:ring-red-500/50 animate-shake' 
                      : 'border-white/20 focus:ring-white/30 focus:border-white/40 hover:border-white/30'
                  }`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors duration-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 transform transition-transform duration-300" />
                  ) : (
                    <Eye className="w-5 h-5 transform transition-transform duration-300" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="flex items-center space-x-2 text-sm">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 text-green-300" />
                      <span className="text-green-300">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-300" />
                      <span className="text-red-300">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
              
              {errors.confirmPassword && (
                <p className="text-red-300 text-sm animate-fade-in">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Security Requirements */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="text-white font-medium mb-2 text-sm">Password Requirements:</h4>
              <ul className="space-y-1 text-xs text-white/70">
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${formData.password.length >= 8 ? 'bg-green-400' : 'bg-white/30'}`} />
                  <span>At least 8 characters</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-400' : 'bg-white/30'}`} />
                  <span>One uppercase letter</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-400' : 'bg-white/30'}`} />
                  <span>One lowercase letter</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-400' : 'bg-white/30'}`} />
                  <span>One number</span>
                </li>
              </ul>
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Reset Password</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="text-white/70 text-sm hover:text-white transition-colors duration-300 relative group"
              >
                Back to Login
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};