import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Smartphone, RefreshCw, Mail, AlertCircle } from 'lucide-react';
import { notificationAPI } from '../api/NotificationAPI';
import { StepComponentProps } from './WorkflowStepComponentLoader';


export const MobileEmailOTP: React.FC<StepComponentProps> = ({
  data : applicationData = {},
  onBack = () => {},
  handleSubmitSuccess
}) => {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [verificationType, setVerificationType] = useState<'mobile' | 'email'>('mobile');
  const [fullName, setFullName] = useState(applicationData.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(applicationData.mobileNumber || '');
  const [email, setEmail] = useState(applicationData.email || '');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mobileVerifiedAt, setMobileVerifiedAt] = useState<string | null>(null);
  const [emailVerifiedAt, setEmailVerifiedAt] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effect for OTP resend
  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [step, timer]);

  // Clear errors when step changes
  useEffect(() => {
    setError(null);
  }, [step]);

  const validateInputs = () => {
    if (!fullName.trim()) {
      return 'Full name is required';
    }
    
    if (verificationType === 'mobile') {
      if (!mobileNumber.trim() || mobileNumber.length !== 10) {
        return 'Please enter a valid 10-digit mobile number';
      }
    } else {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Please enter a valid email address';
      }
    }
    
    return null;
  };

  const handleSendOTP = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
    
      // Send OTP using the notification API
      const response = await notificationAPI.sendOtp({
        notificationType: verificationType,
        name:fullName,
        type: "APPLICATION_FLOW",
        mobile: verificationType === 'mobile' ? mobileNumber : undefined,
        email: verificationType === 'email' ? email : undefined,
        template:verificationType === 'mobile' ? "OTP_APPLICATION_REGISTRATION":"EMAIL_OTP_VERIFICATION"
      });

      if (response.status === 200 || response.status === 201) {
        // Store reference ID if provided
        if (response.data?.reference_id) {
          setReferenceId(response.data.reference_id);
        }

        // Move to OTP verification step
        setStep('otp');
        setTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '']);
      } else {
        throw new Error(response.error || response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (otps: string[] = otp) => {
    const finalOtp = otps.join('');
    console.log("OtpValue", finalOtp)
      if (finalOtp.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Verifying OTP:', {
        finalOtp,
        verificationType,
        fullName,
        mobile: verificationType === 'mobile' ? mobileNumber : undefined,
        email: verificationType === 'email' ? email : undefined
      });

      // Verify OTP using the notification API
      const response = await notificationAPI.verifyOtp({
        notificationType: verificationType,
        type: "APPLICATION_FLOW",
        name: fullName,
        mobile: verificationType === 'mobile' ? mobileNumber : undefined,
        email: verificationType === 'email' ? email : undefined,
        template: verificationType === 'mobile' ? "OTP_APPLICATION_REGISTRATION" : "EMAIL_OTP_VERIFICATION",
        otp: finalOtp,
      });

      console.log('Verify OTP Response:', response);
      
      if (response.status === 200) {
        // Check if verification was successful based on the OtpVerifyResponse interface
      
          console.log('OTP verification successful, calling onVerified callback');
          
          // Set verification timestamps
          const currentTimestamp = new Date().toISOString();
          if (verificationType === 'mobile') {
            setMobileVerifiedAt(currentTimestamp);
          } else {
            setEmailVerifiedAt(currentTimestamp);
          }

          // Display success message
          setSuccessMessage('OTP verified successfully!');
          
          // Prepare and send the application data payload
          const applicationDataPayload = {
            application: {
              ...applicationData?.application,
              contact_person: fullName || "",
              mobile: mobileNumber?.toString() || "",
              email: email || "",
              apply_capacity: "PERSON",
              data: {
                mobile_verified_at: verificationType === 'mobile' ? currentTimestamp : mobileVerifiedAt,
                email_verified_at: verificationType === 'email' ? currentTimestamp : emailVerifiedAt,
              },
              status: 1,
            }
          };

          console.log("applicationDataPayload", applicationDataPayload)
          // Call handleFormSubmitSuccess if available
          if (handleSubmitSuccess) {
            handleSubmitSuccess({
              data: applicationDataPayload,
              isValidForm: true,
              optional: true
            });
          }

          // On successful verification, call the onVerified callback
          return;
       
      } else {
        throw new Error(response.error || response.message || `Verification failed with status ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      setError(error.message || 'Failed to verify OTP. Please try again.');
      // Reset OTP fields on error
      setOtp(['', '', '', '']);
      if (otpRefs.current[0]) {
        otpRefs.current[0].focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Clear any existing error when user starts typing
      if (error) {
        setError(null);
      }

      // Auto-focus next input
      if (value && index < 3) {
        otpRefs.current[index + 1]?.focus();
      }

      // Auto-verify when all fields are filled
      if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 4) {
       
        // Small delay to allow user to see the complete OTP
        setTimeout(() => {
          handleVerifyOTP(newOtp);
        }, 300);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setTimer(30);
    setError(null);
    
    try {
      // Resend OTP using the notification API
      const response = await notificationAPI.resendOtp({
        notificationType: verificationType,
        type: "APPLICATION_FLOW",
        name: fullName,
        mobile: verificationType === 'mobile' ? mobileNumber : undefined,
        email: verificationType === 'email' ? email : undefined,
        template: verificationType === 'mobile' ? "OTP_APPLICATION_REGISTRATION" : "EMAIL_OTP_VERIFICATION",
      });

      if (response.status === 200 || response.status === 201) {
        // Update reference ID if provided
        if (response.data?.reference_id) {
          setReferenceId(response.data.reference_id);
        }
        
        // Clear all OTP input values after successful resend
        setOtp(['', '', '', '']);
        // Focus on the first OTP input
        if (otpRefs.current[0]) {
          otpRefs.current[0].focus();
        }
      } else {
        throw new Error(response.error || response.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      setError(error.message || 'Failed to resend OTP. Please try again.');
      setCanResend(true);
      setTimer(0);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'details') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting || isLoading}
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Verification Details</h1>
        </div>

        {/* Verification Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose verification method
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setVerificationType('mobile')}
              className={`flex-1 p-3 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                verificationType === 'mobile'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={isSubmitting}
            >
              <Smartphone className="h-4 w-4" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setVerificationType('email')}
              className={`flex-1 p-3 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                verificationType === 'email'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={isSubmitting}
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
          </div>

          {verificationType === 'mobile' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-lg">
                  +91
                </span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Success Message Display */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <div className="h-4 w-4 text-green-500 flex-shrink-0">✓</div>
            <span className="text-sm text-green-700">{successMessage}</span>
          </div>
        )}

        {/* Send OTP Button */}
        <button
          onClick={handleSendOTP}
          disabled={isSubmitting }
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {(isSubmitting || isLoading) && (
            <RefreshCw className="h-4 w-4 animate-spin" />
          )}
          <span>
            {isSubmitting || isLoading ? 'Sending OTP...' : 'Send OTP'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => setStep('details')}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={isSubmitting}
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Verify OTP</h1>
      </div>

      {/* OTP Verification Content */}
      <div className="text-center mb-6">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          {verificationType === 'mobile' ? (
            <Smartphone className="h-8 w-8 text-black" />
          ) : (
            <Mail className="h-8 w-8 text-black" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-black mb-2">Verify OTP</h2>
        <p className="text-gray-600">
          Enter the 4-digit code sent to<br />
          <span className="font-semibold text-black">
            {verificationType === 'mobile' ? mobileNumber : email}
          </span>
        </p>
      </div>

      {/* OTP Input Fields */}
      <div className="mb-6">
        <div className="flex justify-center space-x-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (otpRefs.current[index] = el)}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={1}
              disabled={isSubmitting}
            />
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Timer and Resend */}
        <div className="text-center">
          {!canResend ? (
            <p className="text-gray-600">
              Resend OTP in <span className="font-semibold">{formatTimer(timer)}</span>
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={isSubmitting}
              className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 mx-auto"
            >
              {(isSubmitting) && (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
              <span>Resend OTP</span>
            </button>
          )}
        </div>
      </div>

      {/* Verify Button */}
      {/* <button
        onClick={() => handleVerifyOTP()}
        disabled={otp.join('').length !== 4 || isSubmitting}
        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {(isSubmitting) && (
          <RefreshCw className="h-4 w-4 animate-spin" />
        )}
        <span>
          {isSubmitting || isLoading ? 'Verifying...' : 'Verify OTP'}
        </span>
      </button> */}
    </div>
  );
};

export default MobileEmailOTP;