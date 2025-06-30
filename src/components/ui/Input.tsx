import React, { useState, forwardRef } from 'react';
import { DivideIcon as LucideIcon, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'underline';
  showPasswordToggle?: boolean;
  loading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  hint,
  icon: Icon,
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  showPasswordToggle = false,
  loading = false,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const hasError = !!error;
  const hasSuccess = !!success;
  const hasValue = !!props.value || !!props.defaultValue;

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const variants = {
    default: `border rounded-lg bg-white transition-all duration-300 ${
      hasError 
        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
        : hasSuccess
        ? 'border-green-500 focus:ring-green-500/50 focus:border-green-500'
        : 'border-gray-200 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300'
    }`,
    filled: `border-0 rounded-lg bg-gray-50 transition-all duration-300 ${
      hasError 
        ? 'bg-red-50 focus:ring-red-500/50' 
        : hasSuccess
        ? 'bg-green-50 focus:ring-green-500/50'
        : 'focus:ring-blue-500/50 focus:bg-white hover:bg-gray-100'
    }`,
    underline: `border-0 border-b-2 rounded-none bg-transparent transition-all duration-300 ${
      hasError 
        ? 'border-red-500 focus:border-red-500' 
        : hasSuccess
        ? 'border-green-500 focus:border-green-500'
        : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
    }`
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium transition-colors duration-300 ${
          hasError ? 'text-red-700' : hasSuccess ? 'text-green-700' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      
      <div className="relative group">
        {Icon && iconPosition === 'left' && (
          <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${iconSizes[size]} ${
            hasError ? 'text-red-500' : hasSuccess ? 'text-green-500' : isFocused ? 'text-blue-500' : 'text-gray-400'
          }`} />
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full focus:outline-none focus:ring-2 transition-all duration-300
            ${variants[variant]}
            ${sizes[size]}
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${(Icon && iconPosition === 'right') || showPasswordToggle ? 'pr-10' : ''}
            ${loading ? 'cursor-wait' : ''}
            ${className}
          `}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        
        {showPasswordToggle && !loading && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        
        {Icon && iconPosition === 'right' && !showPasswordToggle && !loading && (
          <Icon className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${iconSizes[size]} ${
            hasError ? 'text-red-500' : hasSuccess ? 'text-green-500' : isFocused ? 'text-blue-500' : 'text-gray-400'
          }`} />
        )}
        
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500 animate-pulse" />
        )}
        
        {hasSuccess && !loading && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500 animate-pulse" />
        )}
      </div>
      
      {(error || success || hint) && (
        <div className={`text-sm transition-all duration-300 ${
          error ? 'text-red-600 animate-shake' : success ? 'text-green-600' : 'text-gray-500'
        }`}>
          {error || success || hint}
        </div>
      )}
    </div>
  );
});