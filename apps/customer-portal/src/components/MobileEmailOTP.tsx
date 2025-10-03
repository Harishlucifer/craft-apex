import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Smartphone, RefreshCw, Mail, AlertCircle } from 'lucide-react';
import { NotificationAPI, LeadAPI, WorkflowAPI } from '@repo/shared-state/api';
import { StepComponentProps } from './WorkflowStepComponentLoader';
import FormRenderer, { FormDataRef } from './FormRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';


export const MobileEmailOTP: React.FC<StepComponentProps> = ({
  step,
  data : applicationData = {},
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
  // Add state for existing leads and selection UI
  const [leadResults, setLeadResults] = useState<any[]>([]);
  const [showLeadSelection, setShowLeadSelection] = useState(false);
  const [isSelectingLead, setIsSelectingLead] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
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
        
        // Call the new OTP success handler that checks for existing leads
        await handleOTPSuccess();

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

  const handleOTPSuccess = async () => {
    try {
      // Get the mobile number from form data
      const mobileNumber = formRendererData?.application?.mobile;
      
      if (!mobileNumber) {
        console.error('Mobile number not found in form data');
        // Keep user on OTP capture section; do not progress
        setError('Mobile number not found.');
        return;
      }

      console.log('Checking for existing leads with mobile number:', mobileNumber);
      
      // Call LeadAPI to check for existing applications with this mobile number
      const leadResponse = await LeadAPI.getInstance().fetchLeads({
        mobile_no: mobileNumber
      });

      console.log('Lead API Response:', leadResponse);

      // Coerce results to an array to avoid null map errors
      const rawResults = (leadResponse as any)?.data;
      const results = Array.isArray(rawResults) ? rawResults : [];
      console.log('results', results);
      if (results.length > 0) {
        // Found existing leads - log the results
        console.log('Found existing leads for mobile number:', mobileNumber);
        console.log('Lead results:', results);
        // Store results and show selection UI while staying on OTP section
        setLeadResults(results);
        setShowLeadSelection(true);
      } else {
        if(handleSubmitSuccess){
          await handleSubmitSuccess({
            data: formRendererData,
            isValidForm: true
          });
        }
        // No existing leads found - remain on OTP capture section and do not progress prematurely
        console.log('No existing leads found for mobile number:', mobileNumber);
       
        // Intentionally NOT calling handleSubmitSuccess to keep user on OTP section
      }
    } catch (error: any) {
      console.error('Error checking for existing leads:', error);
      // Keep user on OTP capture section; provide feedback but do not progress
      setError(error?.message || 'Could not check existing applications. Please try again.');
    
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

  // Lead selection handlers
  const handleProceedWithCurrentData = () => {
    try {
      setSelectionError(null);
      setShowLeadSelection(false);
      if (handleSubmitSuccess) {
        handleSubmitSuccess({
          data: formRendererData,
          isValidForm: true,
          optional: true,
        });
      }
    } catch (err: any) {
      console.error('Failed to proceed with current data:', err);
      setSelectionError(err?.message || 'Unable to proceed. Please try again.');
    }
  };

  const handleSelectLead = async (lead: any) => {
    try {
      setSelectionError(null);
      const applicationId = lead?.application_id || lead?.id || lead?.application?.application_id;
      if (!applicationId) {
        throw new Error('Application ID not found for the selected lead.');
      }
      setSelectedLeadId(applicationId);
      setIsSelectingLead(true);

      // 1) Fetch the lead details and sync to store
      const leadResponse = await LeadAPI.getInstance().fetchLead(applicationId, "V2");
      console.log('leadResponse', leadResponse);
      // 2) Build workflow for the selected application
      await WorkflowAPI.getInstance().fetchWorkflow({
        source_id: applicationId,
        workflow_type: "LEAD_CREATION",
      });
    } catch (err: any) {
      console.error('Failed to select lead:', err);
      setSelectionError(err?.message || 'Failed to select lead. Please try again.');
    } finally {
      setIsSelectingLead(false);
      setSelectedLeadId(null);
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
            <CardContent className="p-4 md:p-8 lg:p-10">
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

  // When leads exist after OTP, show selection list and hide OTP section
  if (currentStep === 'otp' && showLeadSelection && leadResults.length > 0) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-0 md:p-6">
        <div className="border-b border-gray-200 p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Existing applications found</h1>
          <p className="text-sm text-gray-600 mt-1">Select a lead to continue or cancel to proceed with the current details.</p>
        </div>
        <div className="p-4 md:p-6">
          {selectionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{selectionError}</span>
            </div>
          )}
          <ul className="divide-y divide-gray-200">
            {leadResults?.map((item, idx) => {
              const id = item?.application_id || item?.id || `Lead-${idx + 1}`;
              const name = item?.customer_name || item?.applicant_name || item?.name || 'Unknown name';
              const status = item?.status || item?.application_status || 'Unknown status';
              const isThisSelecting = isSelectingLead && selectedLeadId === id;
              return (
                <li key={id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">{String(name).charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{name}</p>
                      <p className="text-xs text-gray-600">ID: {id} • Status: {status}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="px-3 py-2 text-sm bg-black text-white hover:bg-gray-800 disabled:opacity-60"
                    disabled={isSelectingLead}
                    onClick={() => handleSelectLead(item)}
                  >
                    {isThisSelecting ? (
                      <span className="flex items-center"><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Loading...</span>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="px-3 py-2 text-sm border-gray-300"
              onClick={handleProceedWithCurrentData}
            >
              proceed with current details
            </Button>
          </div>
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
          {otp?.map((digit, index) => (
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

        {/* Lead selection early return handled above; removed inline block */}
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
    </div>
  );
};

export default MobileEmailOTP;