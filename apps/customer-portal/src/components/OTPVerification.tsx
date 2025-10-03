import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Smartphone, RefreshCw } from 'lucide-react';

interface OTPVerificationProps {
  isReturningCustomer: boolean;
  applicationData: any;
  updateApplicationData: (data: Partial<any>) => void;
  onVerified: () => void;
  onBack: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  isReturningCustomer,
  applicationData,
  updateApplicationData,
  onVerified,
  onBack
}) => {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [fullName, setFullName] = useState(applicationData.fullName);
  const [mobileNumber, setMobileNumber] = useState(applicationData.mobileNumber);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleSendOTP = () => {
    if (fullName.trim() && mobileNumber.trim().length === 10) {
      updateApplicationData({ fullName, mobileNumber });
      setStep('otp');
      setTimer(30);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      // Auto-verify when all fields are filled
      if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
        // Simulate OTP verification
        setTimeout(() => {
          onVerified();
        }, 1000);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = () => {
    setTimer(30);
    setOtp(['', '', '', '', '', '']);
  };

  if (step === 'details') {
    return (
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">
              {isReturningCustomer ? 'Welcome Back!' : 'Let\'s Get Started'}
            </h2>
            <p className="text-gray-600">
              {isReturningCustomer 
                ? 'Enter your details to continue your application' 
                : 'Enter your details to begin your loan application'
              }
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name (as per PAN)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
            </div>

            <button
              onClick={handleSendOTP}
              disabled={!fullName.trim() || mobileNumber.length !== 10}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send OTP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <button
        onClick={() => setStep('details')}
        className="flex items-center text-black hover:text-gray-700 mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Verify OTP</h2>
          <p className="text-gray-600">
            Enter the 6-digit code sent to<br />
            <span className="font-semibold">+91 {mobileNumber}</span>
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-center space-x-3 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => otpRefs.current[index] = el}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all"
                maxLength={1}
              />
            ))}
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-600">Resend OTP in {timer}s</p>
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-sm text-black hover:text-gray-700 font-medium flex items-center justify-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Resend OTP</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By verifying, you agree to our Terms & Conditions and Privacy Policy
        </p>
      </div>
    </div>
  );
};