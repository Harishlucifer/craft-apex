import React, { forwardRef, useEffect, useImperativeHandle, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Badge } from "@repo/ui/components/ui/badge";
import { 
  Shield, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Timer,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAxios } from "@/pages/helper/axiosInstance";
import { StepComponentProps } from "@/pages/WorkflowStepComponentLoader";

// Types
interface FormValues {
  name: string;
  mobileNumber: string;
  emailId: string;
}

interface OtpRequestData {
  platform: string;
  type: string;
  name: string;
  dedupe?: boolean;
  email?: string;
  mobile?: string;
  template: string;
  otp?: string;
  resend?: boolean;
  retry_type?: string;
}

interface ApiResponse {
  status: boolean;
  message?: {
    error?: string;
    status?: number;
    channel_id?: string;
  };
  data?: {
    message?: string;
  };
}

type VerificationType = "mobile" | "email" | "both";

interface VerificationConfig {
  type: VerificationType;
  required: {
    mobile: boolean;
    email: boolean;
  };
  sequence: "parallel" | "sequential";
  mobileFirst?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.08
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
} as const;

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.25, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.96,
    transition: { 
      duration: 0.2, 
      ease: [0.55, 0.06, 0.68, 0.19]
    }
  }
} as const;

const MobileEmailOtpVerification = forwardRef<any, StepComponentProps>((props, ref) => {
  // Dynamic configuration based on step configuration
  const verificationConfig: VerificationConfig = useMemo(() => {
    const configType = props.step?.configuration?.verification_type || "both";
    
    switch (configType) {
      case "mobile":
        return {
          type: "mobile",
          required: { mobile: true, email: false },
          sequence: "sequential",
          mobileFirst: true
        };
      case "email":
        return {
          type: "email",
          required: { mobile: false, email: true },
          sequence: "sequential",
          mobileFirst: false
        };
      case "both":
      default:
        return {
          type: "both",
          required: { mobile: true, email: true },
          sequence: props.step?.configuration?.sequence || "sequential",
          mobileFirst: props.step?.configuration?.mobile_first !== false
        };
    }
  }, [props.step?.configuration]);

  // State management
  const [verifyMode, setVerifyMode] = useState<"mobile" | "email" | "">("");
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isOtpVerifySuccess, setIsOtpVerifySuccess] = useState(true);
  const [isDigitsValid, setIsDigitsValid] = useState(false);
  const [isMobileOtpVerified, setIsMobileOtpVerified] = useState(false);
  const [isEmailOtpVerified, setIsEmailOtpVerified] = useState(false);
  const [mobileVerifiedAt, setMobileVerifiedAt] = useState<string | null>(null);
  const [emailVerifiedAt, setEmailVerifiedAt] = useState<string | null>(null);

  const axios = useAxios();

  // Dynamic validation schema based on configuration
  const validationSchema = useMemo(() => {
    const baseSchema = {
      name: Yup.string().required("Name is required")
    };

    const mobileSchema = verificationConfig.required.mobile ? {
      mobileNumber: Yup.string()
        .matches(/^\d{10}$/, "Invalid Mobile Number")
        .required("Mobile is Required")
        .trim()
    } : {
      mobileNumber: Yup.string().optional()
    };

    const emailSchema = verificationConfig.required.email ? {
      emailId: Yup.string()
        .max(45, "Too Long! Should be less than 45 characters")
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email Must be Valid')
        .email("Invalid email address")
        .required("Email is Required")
    } : {
      emailId: Yup.string().optional()
    };

    return Yup.object().shape({
      ...baseSchema,
      ...mobileSchema,
      ...emailSchema
    });
  }, [verificationConfig]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      name: "",
      mobileNumber: "",
      emailId: ""
    },
    mode: "onChange"
  });

  // Watch form values
  const formValues = watch();

  // React Query mutations for API calls
  const sendOtpMutation = useMutation({
    mutationFn: async ({ mode, dedupe = true }: { mode: "mobile" | "email"; dedupe?: boolean }) => {
      const otpRequestData: OtpRequestData = {
        platform: "CUSTOMER_PORTAL",
        type: "APPLICATION_FLOW",
        name: formValues.name,
        dedupe,
        template: mode === "email" ? "EMAIL_OTP_VERIFICATION" : "OTP_PARTNER_REGISTRATION"
      };

      if (mode === "email") {
        otpRequestData.email = formValues.emailId;
      } else if (mode === "mobile") {
        otpRequestData.mobile = "91" + formValues.mobileNumber;
      }

      const response = await axios.post<ApiResponse>("/alpha/v1/notification/otp", otpRequestData);
      return { response: response.data, mode };
    },
    onSuccess: ({ response, mode }) => {
      if (response.status) {
        setVerifyMode(mode);
        setIsOtpModalOpen(true);
        setResendDisabled(true);
        setTimerSeconds(60);
        toast.success(`OTP sent to your ${mode}`, {
          icon: <Sparkles className="w-4 h-4" />
        });
      } else {
        if (response.message?.status === -5) {
          sendOtpMutation.mutate({ mode, dedupe: false });
        } else {
          toast.error(response.message?.error || "OTP sending failed");
        }
      }
    },
    onError: () => {
      toast.error("Something went wrong while sending OTP.");
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const otpRequestData: OtpRequestData = {
        type: "APPLICATION_FLOW",
        name: formValues.name,
        otp: otpValues.join(''),
        platform: "CUSTOMER_PORTAL",
        template: verifyMode === "mobile" ? "OTP_PARTNER_REGISTRATION" : "EMAIL_OTP_VERIFICATION"
      };

      if (verifyMode === "mobile") {
        otpRequestData.mobile = "91" + formValues.mobileNumber;
      } else if (verifyMode === "email") {
        otpRequestData.email = formValues.emailId;
      }

      const response = await axios.post<ApiResponse>("/alpha/v1/notification/otp", otpRequestData);
      return response.data;
    },
    onSuccess: (response) => {
      if (response.status) {
        setIsOtpVerifySuccess(false);

        if (verifyMode === "mobile") {
          setIsMobileOtpVerified(true);
          setMobileVerifiedAt(new Date().toISOString());
        } else if (verifyMode === "email") {
          setIsEmailOtpVerified(true);
          setEmailVerifiedAt(new Date().toISOString());
        }
        
        toast.success(`${verifyMode} verified successfully!`, {
          icon: <CheckCircle className="w-4 h-4" />
        });
        setIsOtpModalOpen(false);
        clearModalData();
      } else {
        const errorMessage = typeof response.message === 'string' 
          ? response.message 
          : response.message?.error || "Invalid OTP";
        toast.error("Invalid OTP. Please try again.");
      }
    },
    onError: () => {
      toast.error("Verification failed. Please try again.");
    }
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const otpRequestData: OtpRequestData = {
        type: "APPLICATION_FLOW",
        name: formValues.name,
        resend: true,
        retry_type: "text",
        platform: "CUSTOMER_PORTAL",
        template: verifyMode === "mobile" ? "OTP_PARTNER_REGISTRATION" : "EMAIL_OTP_VERIFICATION"
      };

      if (verifyMode === "mobile") {
        otpRequestData.mobile = "91" + formValues.mobileNumber;
      } else if (verifyMode === "email") {
        otpRequestData.email = formValues.emailId;
      }

      const response = await axios.post<ApiResponse>("/alpha/v1/notification/otp", otpRequestData);
      return response.data;
    },
    onSuccess: (response) => {
      if (response.status) {
        setResendDisabled(true);
        setTimerSeconds(60);
        toast.success("OTP resent successfully!");
      } else {
        const errorMessage = typeof response.message === 'string' 
          ? response.message 
          : response.message?.error || "Error";
        toast.error("Failed to resend OTP");
      }
    },
    onError: () => {
      toast.error("Failed to resend OTP");
    }
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    const mobileRequired = verificationConfig.required.mobile;
    const emailRequired = verificationConfig.required.email;
    
    const mobileVerified = !mobileRequired || isMobileOtpVerified;
    const emailVerified = !emailRequired || isEmailOtpVerified;

    if (mobileVerified && emailVerified) {
      const applicationData = {
        application: {
          ...props?.data?.application,
          applicant_name:data.name || "",
          contact_name: data.name || "",
          mobile: data.mobileNumber?.toString() || "",
          email: data.emailId || "",
          apply_capacity: "PERSON",
          data: {
            mobile_verified_at: mobileVerifiedAt,
            email_verified_at: emailVerifiedAt,
          },
          status: 1,
        }
      };
      props?.handleSubmitSuccess({ data: applicationData, isValidForm: true, optional: true });
    }
  };

  // Imperative handle for external form submission
  useImperativeHandle(ref, () => ({
    submitStepExternally: async () => {
      handleSubmit(onSubmit)();
    }
  }));

  // Initialize form with existing data
  useEffect(() => {
    if (props?.data && props?.data?.application?.contact_person && props?.data?.application?.email && props?.data?.application?.mobile) {
      const nameFromData = props?.data?.application?.contact_person || "";
      const emailFromData = props?.data?.application?.email || "";
      const mobileFromData = (props?.data?.application?.mobile ?? "").toString();

      setValue("name", nameFromData);
      setValue("mobileNumber", mobileFromData);
      setValue("emailId", emailFromData);

      const mobileVerified = props?.data?.application?.data?.mobile_verified_at || null;
      const emailVerified = props?.data?.application?.data?.email_verified_at || null;

      if (mobileVerified) {
        setIsMobileOtpVerified(true);
        setMobileVerifiedAt(mobileVerified);
      }
      if (emailVerified) {
        setIsEmailOtpVerified(true);
        setEmailVerifiedAt(emailVerified);
      }
    }
  }, [props?.data, setValue]);

  // Timer effect for resend functionality
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | undefined;
    if (timerSeconds > 0 && resendDisabled) {
      timerInterval = setInterval(() => {
        setTimerSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (timerSeconds === 0 && resendDisabled) {
      if (timerInterval) clearInterval(timerInterval);
      setResendDisabled(false);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerSeconds, resendDisabled]);

  // Helper functions
  const clearModalData = () => {
    setOtpValues(['', '', '', '']);
    setIsOtpVerifySuccess(true);
    setIsDigitsValid(false);
  };

  const getInputElement = (index: number): HTMLInputElement | null => 
    document.getElementById(`digit${index + 1}-input`) as HTMLInputElement;

  const moveToNext = (index: number) => {
    const currentInput = getInputElement(index);
    if (currentInput && currentInput.value.length === 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = currentInput.value;
      setOtpValues(newOtpValues);

      const nextIndex = index + 1;
      if (nextIndex !== 4) {
        const nextInput = getInputElement(nextIndex);
        nextInput?.focus();
      } else {
        currentInput.blur();
        const isAllFilled = newOtpValues.every(value => value.length === 1);
        setIsDigitsValid(isAllFilled);
      }
    }
  };

  const handleInputChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const updatedOtpValues = [...otpValues];
    updatedOtpValues[index] = value;
    setOtpValues(updatedOtpValues);
    moveToNext(index);
  };

  const handleBackspace = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && index > 0 && !otpValues[index]) {
      const prevInput = getInputElement(index - 1);
      prevInput?.focus();
      setIsDigitsValid(false);
    }
  };

  // API functions
  const validateAndSubmit = async (mode: "mobile" | "email") => {
    if (mode === "mobile") {
      const isNameValid = await trigger("name");
      const isMobileValid = await trigger("mobileNumber");
      if (isNameValid && isMobileValid) {
        sendOtpMutation.mutate({ mode });
      }
    } else if (mode === "email") {
      const isNameValid = await trigger("name");
      const isEmailValid = await trigger("emailId");
      if (isNameValid && isEmailValid) {
        sendOtpMutation.mutate({ mode });
      }
    }
  };

  // Calculate verification progress
  const getVerificationProgress = () => {
    const totalRequired = (verificationConfig.required.mobile ? 1 : 0) + (verificationConfig.required.email ? 1 : 0);
    const completed = (isMobileOtpVerified && verificationConfig.required.mobile ? 1 : 0) + 
                     (isEmailOtpVerified && verificationConfig.required.email ? 1 : 0);
    return { completed, total: totalRequired, percentage: totalRequired > 0 ? (completed / totalRequired) * 100 : 0 };
  };

  const progress = getVerificationProgress();

  // Determine if email field should be enabled
  const isEmailFieldEnabled = () => {
    if (!verificationConfig.required.email) return false;
    if (verificationConfig.sequence === "parallel") return true;
    if (verificationConfig.sequence === "sequential" && verificationConfig.mobileFirst) {
      return !verificationConfig.required.mobile || isMobileOtpVerified;
    }
    return true;
  };

  return (
    <div className="flex justify-center items-center min-h-screen from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md sm:max-w-lg lg:max-w-xl px-4 sm:px-6 lg:px-8"
      >
        <Card className="shadow-2xl pt-0 border-0 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden" role="main" aria-label="Mobile and Email OTP Verification Form">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 pointer-events-none" />
          <motion.div variants={itemVariants}>
            <CardHeader className="relative text-center pb-6 pt-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white">
              <motion.div 
                className="mx-auto w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Shield className="w-12 h-12 text-white drop-shadow-sm" />
              </motion.div>
              <CardTitle className="text-3xl font-bold mb-3">
                Verification Required
              </CardTitle>
              <p className="text-blue-100 mt-2 text-lg">
                {verificationConfig.type === "mobile" && "Secure your account with mobile verification"}
                {verificationConfig.type === "email" && "Secure your account with email verification"}
                {verificationConfig.type === "both" && "Secure your account with mobile and email verification"}
              </p>
            </CardHeader>
          </motion.div>

          <CardContent className="relative space-y-6 sm:space-y-8 p-6 sm:p-8 bg-gradient-to-b from-white/95 to-gray-50/95 backdrop-blur-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6" role="form" aria-label="Verification form">
              {/* Name Field */}
              <motion.div variants={itemVariants} className="space-y-2">
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <motion.div
                      className="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    />
                    Contact Person Name
                  </Label>
                </motion.div>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{ willChange: "transform" }}
                    >
                      <Input
                            {...field}
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            aria-describedby={errors.name ? "name-error" : undefined}
                            aria-invalid={!!errors.name}
                            className={cn(
                              "h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base rounded-xl border-2 bg-white/80 backdrop-blur-sm",
                              "transition-all duration-300 ease-in-out",
                              "shadow-sm hover:shadow-md focus:shadow-lg",
                              "border-gray-200 hover:border-gray-300",
                              "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                              "placeholder:text-gray-400",
                              errors.name && "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/50"
                            )}
                          />
                    </motion.div>
                  )}
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p 
                      id="name-error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-600 flex items-center gap-1"
                      role="alert"
                      aria-live="polite"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.name.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Mobile Field */}
              {verificationConfig.required.mobile && (
                <motion.div variants={itemVariants} className="space-y-2">
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Label htmlFor="mobileNumber" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <motion.div
                        className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      />
                      Mobile Number
                    </Label>
                  </motion.div>
                  <div className="flex gap-2">
                    <Controller
                      name="mobileNumber"
                      control={control}
                      render={({ field }) => (
                        <motion.div
                          className="flex-1"
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Input
                            {...field}
                            id="mobileNumber"
                            type="tel"
                            placeholder="Enter your mobile number"
                            disabled={isMobileOtpVerified}
                            aria-describedby={errors.mobileNumber ? "mobile-error" : undefined}
                            aria-invalid={!!errors.mobileNumber}
                            className={cn(
                              "h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base rounded-xl border-2 bg-white/80 backdrop-blur-sm",
                              "transition-all duration-300 ease-in-out",
                              "shadow-sm hover:shadow-md focus:shadow-lg",
                              "border-gray-200 hover:border-gray-300",
                              "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                              "placeholder:text-gray-400",
                              "disabled:bg-gray-50/80 disabled:border-gray-200 disabled:text-gray-500",
                              errors.mobileNumber && "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/50"
                            )}
                          />
                        </motion.div>
                      )}
                    />
                    <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          style={{ willChange: "transform" }}
                        >
                      <Button
                        type="button"
                        onClick={() => validateAndSubmit("mobile")}
                        disabled={isMobileOtpVerified || sendOtpMutation.isPending}
                        className={cn(
                          "h-12 px-6 rounded-xl font-semibold text-white shadow-lg relative overflow-hidden group",
                          "transition-all duration-300 ease-in-out transform",
                          "hover:scale-105 hover:shadow-xl active:scale-95",
                          "disabled:transform-none disabled:shadow-md",
                          isMobileOtpVerified 
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                            : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        )}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="relative z-10 flex items-center">
                          {sendOtpMutation.isPending && verifyMode === "mobile" ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="w-4 h-4" />
                            </motion.div>
                          ) : isMobileOtpVerified ? (
                            <>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <ShieldCheck className="w-4 h-4 mr-1" />
                              </motion.div>
                              Verified
                            </>
                          ) : (
                            <>
                              <motion.div
                                whileHover={{ rotate: 10 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <Phone className="w-4 h-4 mr-1" />
                              </motion.div>
                              Verify
                            </>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {errors.mobileNumber && (
                      <motion.p 
                        id="mobile-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-600 flex items-center gap-1"
                        role="alert"
                        aria-live="polite"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.mobileNumber.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {isMobileOtpVerified && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200/50 rounded-xl px-3 py-1.5 shadow-sm backdrop-blur-sm">
                          <CheckCircle className="w-3 h-3 mr-1.5" />
                          Mobile Verified
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Email Field */}
              {verificationConfig.required.email && (
                <motion.div variants={itemVariants} className="space-y-2">
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <motion.div
                        className="w-1 h-4 bg-gradient-to-b from-purple-500 to-violet-600 rounded-full"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                      />
                      Email Address
                    </Label>
                  </motion.div>
                  <div className="flex gap-2">
                    <Controller
                      name="emailId"
                      control={control}
                      render={({ field }) => (
                        <motion.div
                          className="flex-1"
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Input
                            {...field}
                            id="emailId"
                            type="email"
                            placeholder="Enter your email address"
                            disabled={!isEmailFieldEnabled() || isEmailOtpVerified}
                            aria-describedby={errors.emailId ? "email-error" : undefined}
                            aria-invalid={!!errors.emailId}
                            className={cn(
                              "h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base rounded-xl border-2 bg-white/80 backdrop-blur-sm",
                              "transition-all duration-300 ease-in-out",
                              "shadow-sm hover:shadow-md focus:shadow-lg",
                              "border-gray-200 hover:border-gray-300",
                              "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                              "placeholder:text-gray-400",
                              "disabled:bg-gray-50/80 disabled:border-gray-200 disabled:text-gray-500",
                              !isEmailFieldEnabled() && "bg-gray-50/80 border-gray-200",
                              errors.emailId && "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/50"
                            )}
                          />
                        </motion.div>
                      )}
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button
                        type="button"
                        onClick={() => validateAndSubmit("email")}
                        disabled={!isEmailFieldEnabled() || isEmailOtpVerified || sendOtpMutation.isPending}
                        className={cn(
                          "h-12 px-6 rounded-xl font-semibold text-white shadow-lg relative overflow-hidden group",
                          "transition-all duration-300 ease-in-out transform",
                          "hover:scale-105 hover:shadow-xl active:scale-95",
                          "disabled:transform-none disabled:shadow-md disabled:opacity-60",
                          isEmailOtpVerified 
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                            : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        )}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="relative z-10 flex items-center">
                          {sendOtpMutation.isPending && verifyMode === "email" ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="w-4 h-4" />
                            </motion.div>
                          ) : isEmailOtpVerified ? (
                            <>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <ShieldCheck className="w-4 h-4 mr-1" />
                              </motion.div>
                              Verified
                            </>
                          ) : (
                            <>
                              <motion.div
                                whileHover={{ rotate: 10 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <Mail className="w-4 h-4 mr-1" />
                              </motion.div>
                              Send OTP
                            </>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {errors.emailId && (
                      <motion.p 
                        id="email-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-600 flex items-center gap-1"
                        role="alert"
                        aria-live="polite"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.emailId.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {isEmailOtpVerified && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200/50 rounded-xl px-3 py-1.5 shadow-sm backdrop-blur-sm">
                          <CheckCircle className="w-3 h-3 mr-1.5" />
                          Email Verified
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {!isEmailFieldEnabled() && verificationConfig.sequence === "sequential" && verificationConfig.mobileFirst && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-gray-500"
                      >
                        Please verify your mobile number first
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Progress Indicator */}
              <motion.div 
                variants={itemVariants} 
                className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-sm"
              >
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Verification Progress
                  </span>
                  <span className="text-gray-600 font-medium bg-white/60 px-3 py-1 rounded-full">
                    {progress.completed}/{progress.total} completed
                  </span>
                </div>
                <div className="bg-gray-200/60 rounded-full h-4 overflow-hidden shadow-inner">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-4 rounded-full shadow-sm relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                  </motion.div>
                </div>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {isOtpModalOpen && (
          <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
            <DialogContent className="sm:max-w-md w-[95vw] max-w-[400px] rounded-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden" role="dialog" aria-labelledby="otp-modal-title" aria-describedby="otp-modal-description">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 pointer-events-none" />
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative"
              >
                <DialogHeader className="text-center pb-6">
                  <motion.div 
                    className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {verifyMode === "email" ? (
                      <Mail className="w-10 h-10 text-white drop-shadow-sm" />
                    ) : (
                      <Phone className="w-10 h-10 text-white drop-shadow-sm" />
                    )}
                  </motion.div>
                  <DialogTitle id="otp-modal-title" className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Verify OTP
                  </DialogTitle>
                  <p id="otp-modal-description" className="text-center text-gray-600 mt-3 text-sm sm:text-base">
                    {verifyMode === "email"
                      ? `Enter the OTP sent to ${formValues.emailId}`
                      : `Enter the OTP sent to ${formValues.mobileNumber}`
                    }
                  </p>
                </DialogHeader>

                <div className="space-y-6 sm:space-y-8 px-2 sm:px-4">
                  {/* OTP Input Fields */}
                  <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="OTP input fields">
                    {[0, 1, 2, 3].map((index) => (
                      <motion.div
                        key={index}
                        whileFocus={{ scale: 1.05, y: -1 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="relative"
                        style={{ willChange: "transform" }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl opacity-0"
                          animate={{ 
                            opacity: otpValues[index] ? 0.1 : 0,
                            scale: otpValues[index] ? 1.05 : 1
                          }}
                          transition={{ duration: 0.2 }}
                        />
                        <Input
                          id={`digit${index + 1}-input`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={otpValues[index]}
                          onChange={handleInputChange(index)}
                          onKeyDown={(e) => handleBackspace(index, e)}
                          aria-label={`OTP digit ${index + 1} of 4`}
                          aria-describedby="otp-modal-description"
                          className={cn(
                            "w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-2xl border-2 relative z-10",
                            "bg-white/90 backdrop-blur-sm shadow-md",
                            "transition-all duration-300 ease-in-out",
                            "border-gray-200 hover:border-gray-300",
                            "focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:shadow-lg",
                            "hover:shadow-lg transform hover:scale-105",
                            otpValues[index] && "border-blue-400 bg-blue-50/50 text-blue-700 shadow-blue-200/50"
                          )}
                          autoComplete="off"
                        />
                        {otpValues[index] && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full z-20"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Verify Button */}
                  {isOtpVerifySuccess && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => verifyOtpMutation.mutate()}
                        disabled={!isDigitsValid || verifyOtpMutation.isPending}
                        className={cn(
                          "w-full h-12 rounded-xl font-semibold text-white shadow-lg",
                          "bg-gradient-to-r from-blue-500 to-indigo-600",
                          "hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl",
                          "transition-all duration-300 ease-in-out transform",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          "disabled:opacity-60 disabled:transform-none disabled:shadow-md"
                        )}
                      >
                        {verifyOtpMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify OTP
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {/* Timer and Resend */}
                  <div className="text-center">
                    <AnimatePresence mode="wait">
                      {resendDisabled ? (
                        <motion.div 
                          key="timer"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2 text-gray-600"
                        >
                          <Timer className="w-4 h-4" />
                          <span>Resend OTP in {timerSeconds}s</span>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="resend"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-2"
                        >
                          <p className="text-gray-600">Didn't receive the code?</p>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="outline"
                              onClick={() => resendOtpMutation.mutate()}
                              disabled={resendOtpMutation.isPending}
                              className={cn(
                                "h-11 px-6 rounded-xl font-medium border-2",
                                "text-blue-600 border-blue-200 bg-white/80 backdrop-blur-sm",
                                "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md",
                                "transition-all duration-300 ease-in-out transform",
                                "hover:scale-105 active:scale-95",
                                "disabled:opacity-60 disabled:transform-none"
                              )}
                            >
                              {resendOtpMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Resend OTP
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
});

MobileEmailOtpVerification.displayName = "MobileEmailOtpVerification";

export default MobileEmailOtpVerification;
