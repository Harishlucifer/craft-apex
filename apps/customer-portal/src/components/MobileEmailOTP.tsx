import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Smartphone, RefreshCw, Mail, AlertCircle, ChevronDown, MapPin } from 'lucide-react';
import { NotificationAPI, MasterAPI, PincodeData } from '@repo/shared-state/api';
import { StepComponentProps } from './WorkflowStepComponentLoader';
import FormRenderer, { FormDataRef } from './FormRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';


export const MobileEmailOTP: React.FC<StepComponentProps> = ({
  step,
  data : applicationData = {},
  onBack = () => {},
  handleSubmitSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<'details' | 'otp'>('details');
  const [verificationType, setVerificationType] = useState<'mobile' | 'email'>('mobile');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formRendererData, setFormRendererData] = useState<any>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [formSubmissionError, setFormSubmissionError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRendererRef = useRef<FormDataRef>(null);

  // Timer effect for OTP resend
  useEffect(() => {
    if (currentStep === 'otp' && timer > 0) {
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


  const triggerFormSubmit = async () => {
    console.log('Triggering form submission...', formRendererRef.current);
    setIsFormSubmitting(true);
    setFormSubmissionError(null);
    
    try {
      if (formRendererRef.current != null) {
        formRendererRef.current?.submitFormExternally();
      } else {
        console.log("formRendererRef is null");
        setFormSubmissionError("Form is not ready. Please try again.");
        setIsFormSubmitting(false);
      }
    } catch (error) {
      console.error('Error triggering form submission:', error);
      setFormSubmissionError("Failed to submit form. Please try again.");
      setIsFormSubmitting(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    console.log('Form data received:', formData);
    
    try {
      // Store the complete form data for later use in payload
      setFormRendererData(formData?.data);
    
      // Extract data from form submission - handle both direct data and processed data
      let data = null;
      if (formData?.data) {
        data = formData.data;
      } else {
        data = formData;
      }
      
      if (data) {
        // Set verification type based on available data
        if (data?.application?.mobile || data.mobile_number || data.mobile) {
          setVerificationType('mobile');
        } else if (data.email) {
          setVerificationType('email');
        }
      }
      
      // Trigger OTP sending
      await handleSendOTP(data);
      setIsFormSubmitting(false);
    } catch (error) {
      console.error('Error in form submission:', error);
      setFormSubmissionError("Failed to process form data. Please try again.");
      setIsFormSubmitting(false);
    }
  };

  const handleSendOTP = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Send OTP using the notification API
      const response = await NotificationAPI.getInstance().sendOtp({
        notificationType: verificationType,
        name: data?.application?.contact_name,
        type: "APPLICATION_FLOW",
        mobile: verificationType === 'mobile' ? `91${data?.application?.mobile}` : undefined,
        email: verificationType === 'email' ? data?.application?.email : undefined,
        template: verificationType === 'mobile' ? "OTP_APPLICATION_REGISTRATION" : "EMAIL_OTP_VERIFICATION"
      });
      console.log('Send OTP Response:', response);
      
      if (response.status) {

        // Move to OTP verification step
        setCurrentStep('otp');
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
        name :formRendererData?.application?.contact_name,
        mobile: verificationType === 'mobile' ? `91${formRendererData?.application?.mobile}` : undefined,
        email: verificationType === 'email' ? formRendererData?.application?.email : undefined
      });

      // Verify OTP using the notification API
      const response = await NotificationAPI.getInstance().verifyOtp({
        notificationType: verificationType,
        type: "APPLICATION_FLOW",
        name: formRendererData?.application?.contact_name,
        mobile: verificationType === 'mobile' ? `91${formRendererData?.application?.mobile}` : undefined,
        email: verificationType === 'email' ? formRendererData?.application?.email : undefined,
        template: verificationType === 'mobile' ? "OTP_APPLICATION_REGISTRATION" : "EMAIL_OTP_VERIFICATION",
        otp: finalOtp,
      });

      console.log('Verify OTP Response:', response);
      
      // Check for successful OTP verification
      // Success conditions: status > 0 AND (no error OR result contains success message)
      const responseWithResult = response as any; // Type assertion to access result property
      const isSuccess = response.status > 0 && 
        (!response.error || response.error === "" || response.error === null || response.error === undefined) &&
        (responseWithResult.result?.toLowerCase().includes('success') || responseWithResult.result?.toLowerCase().includes('verified'));
      
      if (isSuccess) {
        console.log("OTP verification successful");
        console.log("applicationDataPayload", formRendererData)
        
        // Call handleFormSubmitSuccess if available
        if (handleSubmitSuccess) {
          handleSubmitSuccess({
            data: formRendererData,
            isValidForm: true,
            optional: true
          });
        }

        // On successful verification, call the onVerified callback
        return;
       
      } else {
        throw new Error(response.message || response.error || `Verification failed with status ${response.status}`);
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
      const response = await NotificationAPI.getInstance().resendOtp({
        notificationType: verificationType,
        type: "APPLICATION_FLOW",
        name: formRendererData?.application?.contact_name,
        mobile: verificationType === 'mobile' ? `91${formRendererData?.application?.mobile}` : undefined,
        email: verificationType === 'email' ? formRendererData?.application?.email : undefined,
        template: verificationType === 'mobile' ? "OTP_APPLICATION_REGISTRATION" : "EMAIL_OTP_VERIFICATION",
      });

      if (response.status) {
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

  if (currentStep === 'details') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-xl mx-auto">
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl text-center font-bold text-gray-900">
                {step?.name || 'Mobile OTP Verification'}
              </CardTitle>
              {step?.description && (
                <p className="text-gray-600 text-sm md:text-base mt-2">
                  {step.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="p-6 md:p-8 lg:p-10">
              {/* Error Display */}
              {formSubmissionError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">{formSubmissionError}</span>
                  </div>
                </div>
              )}

              {/* Form Content */}
              <div className="mb-8">
                <FormRenderer
                  formJson={step.configuration?.form_builder}
                  existingObject={applicationData}
                  onSubmitSuccess={handleFormSubmit}
                  ref={formRendererRef}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center items-center pt-6 border-t border-gray-200">
                {/* Back Button - Left Corner */}

                {/* Create Button - Right Corner */}
                <Button
                  onClick={triggerFormSubmit}
                  type="button"
                  disabled={isFormSubmitting}
                  className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFormSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => setCurrentStep('details')}
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
            {verificationType === 'mobile' ? formRendererData?.application?.mobile : formRendererData?.application?.email}
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