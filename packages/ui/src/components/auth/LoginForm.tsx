import React, { useState, useEffect } from 'react';
import { LoginType } from '@repo/types/setup';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';

export interface LoginFormProps {
  loginType: LoginType;
  onSubmit: (credentials: {
    mobile?: string;
    password?: string;
    otp?: string;
  }) => Promise<void>;
  onSendOtp?: (mobile: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

interface FormState {
  mobile: string;
  password: string;
  otp: string;
  showPassword: boolean;
  otpSent: boolean;
  otpTimer: number;
}

export const LoginForm = ({
  loginType,
  onSubmit,
  onSendOtp,
  isLoading = false,
  error,
  className = '',
}: LoginFormProps) => {
  const [formState, setFormState] = useState<FormState>({
    mobile: '',
    password: '',
    otp: '',
    showPassword: false,
    otpSent: false,
    otpTimer: 0,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // OTP timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (formState.otpTimer > 0) {
      interval = setInterval(() => {
        setFormState(prev => ({ ...prev, otpTimer: prev.otpTimer - 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [formState.otpTimer]);

  const updateFormState = (updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Mobile validation
    if (!formState.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formState.mobile.trim())) {
      errors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    // Password validation (for PASSWORD and PASSWORD+OTP)
    if ((loginType === 'PASSWORD' || loginType === 'PASSWORD+OTP') && !formState.password.trim()) {
      errors.password = 'Password is required';
    }

    // OTP validation (for OTP and PASSWORD+OTP when OTP is sent)
    if ((loginType === 'OTP' || (loginType === 'PASSWORD+OTP' && formState.otpSent)) && !formState.otp.trim()) {
      errors.otp = 'OTP is required';
    } else if (formState.otp && !/^\d{4,6}$/.test(formState.otp.trim())) {
      errors.otp = 'Please enter a valid OTP';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!formState.mobile.trim() || !/^[6-9]\d{9}$/.test(formState.mobile.trim())) {
      setValidationErrors({ mobile: 'Please enter a valid mobile number first' });
      return;
    }

    if (onSendOtp) {
      try {
        await onSendOtp(formState.mobile);
        updateFormState({ otpSent: true, otpTimer: 60 });
        setValidationErrors({});
      } catch (error) {
        // Error will be handled by parent component
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const credentials: { mobile?: string; password?: string; otp?: string } = {
      mobile: formState.mobile,
    };

    if (loginType === 'PASSWORD' || loginType === 'PASSWORD+OTP') {
      credentials.password = formState.password;
    }

    if (loginType === 'OTP' || (loginType === 'PASSWORD+OTP' && formState.otpSent)) {
      credentials.otp = formState.otp;
    }

    await onSubmit(credentials);
  };

  const shouldShowPasswordField = loginType === 'PASSWORD' || loginType === 'PASSWORD+OTP';
  const shouldShowOtpField = loginType === 'OTP' || (loginType === 'PASSWORD+OTP' && formState.otpSent);
  const shouldShowSendOtpButton = (loginType === 'OTP' || loginType === 'PASSWORD+OTP') && !formState.otpSent;
  const shouldShowResendOtpButton = (loginType === 'OTP' || loginType === 'PASSWORD+OTP') && formState.otpSent && formState.otpTimer === 0;

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mobile Number Field */}
      <div className="space-y-2">
        <Label htmlFor="mobile">
          Mobile Number
        </Label>
        <Input
          id="mobile"
          type="tel"
          placeholder="9876544321"
          value={formState.mobile}
          onChange={(e) => updateFormState({ mobile: e.target.value })}
          disabled={isLoading}
          className={validationErrors.mobile ? 'border-red-500' : ''}
        />
        {validationErrors.mobile && (
          <p className="text-sm text-red-500">{validationErrors.mobile}</p>
        )}
      </div>

      {/* Password Field */}
      {shouldShowPasswordField && (
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={formState.showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formState.password}
              onChange={(e) => updateFormState({ password: e.target.value })}
              disabled={isLoading}
              className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                validationErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => updateFormState({ showPassword: !formState.showPassword })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={isLoading}
            >
              <span className="text-sm">
                {formState.showPassword ? '🙈' : '👁️'}
              </span>
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-sm text-red-500">{validationErrors.password}</p>
          )}
        </div>
      )}

      {/* Send OTP Button */}
      {shouldShowSendOtpButton && (
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={isLoading || !formState.mobile}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="mr-2">⏳</span>
              Sending OTP...
            </>
          ) : (
            'Send OTP'
          )}
        </button>
      )}

      {/* OTP Field */}
      {shouldShowOtpField && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              OTP
            </label>
            {formState.otpTimer > 0 && (
              <span className="text-sm text-gray-500">
                Resend in {formState.otpTimer}s
              </span>
            )}
          </div>
          <input
            id="otp"
            type="text"
            placeholder="Enter OTP"
            value={formState.otp}
            onChange={(e) => updateFormState({ otp: e.target.value.replace(/\D/g, '') })}
            disabled={isLoading}
            maxLength={6}
            className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              validationErrors.otp ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.otp && (
            <p className="text-sm text-red-500">{validationErrors.otp}</p>
          )}
        </div>
      )}

      {/* Resend OTP Button */}
      {shouldShowResendOtpButton && (
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={isLoading}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-transparent hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Resend OTP
        </button>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <span className="mr-2">⏳</span>
            Signing in...
          </>
        ) : (
          shouldShowOtpField ? 'Verify OTP' : 'Sign In'
        )}
      </button>
    </form>
  );
};