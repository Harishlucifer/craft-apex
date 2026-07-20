import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Mail, Phone, ShieldCheck } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
  cn,
} from "@craft-apex/ui";
import { registerStepComponent, type StepComponentProps } from "../../step-component-registry";
import { sendOrVerifyOtp } from "./otp-verification.api";

// ─── Configuration helpers ────────────────────────────────────────────────────
function getVerificationConfig(step: StepComponentProps["step"]): string[] {
  const config = (step?.configuration as any)?.verification;
  return Array.isArray(config) ? config : ["mobile", "email"];
}

function getFieldMeta(step: StepComponentProps["step"]) {
  const fields: any[] = (step?.configuration as any)?.fields ?? [];
  const meta: Record<string, { label: string; placeholder: string }> = {};
  for (const fieldObj of fields) {
    const key = Object.keys(fieldObj)[0];
    if (!key) continue;
    const cfg = fieldObj[key] ?? {};
    meta[key] = {
      label: cfg.labelname ?? "Contact Person Name",
      placeholder: cfg.placeholder ?? "Provide your name as per Aadhaar",
    };
  }
  return meta;
}

// ─── OTP digit input component ────────────────────────────────────────────────
interface OtpInputProps {
  value: string[];
  onChange: (digits: string[]) => void;
}
function OtpInput({ value, onChange }: OtpInputProps) {
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (i: number, char: string) => {
    const next = [...value];
    next[i] = char.replace(/\D/g, "").slice(-1);
    onChange(next);
    if (char && i < 3) refs[i + 1]?.current?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs[i - 1]?.current?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3 mt-4">
      {refs.map((ref, i) => (
        <input
          key={i}
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            "w-12 h-12 rounded-lg border-2 text-center text-xl font-bold",
            "focus:outline-none focus:ring-2 focus:ring-[#1E2A6B] focus:border-[#1E2A6B]",
            "transition-all duration-200",
            value[i]
              ? "border-[#1E2A6B] bg-[#1E2A6B]/5 text-[#1E2A6B]"
              : "border-slate-300 bg-white text-slate-800"
          )}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function OtpVerificationStep({ step, value, onChange }: StepComponentProps) {
  const verificationConfig = getVerificationConfig(step);
  const fieldMeta = getFieldMeta(step);

  const showMobile = verificationConfig.includes("mobile");
  const showEmail = verificationConfig.includes("email");

  // ── Form state
  const [name, setName] = useState(
    String(value["application.contact_person"] ?? value["application.name"] ?? "")
  );
  const [mobile, setMobile] = useState(String(value["application.mobile"] ?? ""));
  const [email, setEmail] = useState(String(value["application.email"] ?? ""));

  // ── Verification state
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [mobileVerifiedAt, setMobileVerifiedAt] = useState<string | null>(null);
  const [emailVerifiedAt, setEmailVerifiedAt] = useState<string | null>(null);
  const [mobileHash, setMobileHash] = useState<string | null>(null);
  const [emailHash, setEmailHash] = useState<string | null>(null);

  // ── OTP modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [verifyMode, setVerifyMode] = useState<"mobile" | "email">("mobile");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Resend timer
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // ── Seed values from partner detail on load
  useEffect(() => {
    setName(
      String(value["application.contact_person"] ?? value["application.name"] ?? "")
    );
    setMobile(String(value["application.mobile"] ?? ""));
    setEmail(String(value["application.email"] ?? ""));

    const mobileVerified = value["application.data.mobile_verified_at"] as string | undefined;
    const emailVerified = value["application.data.email_verified_at"] as string | undefined;
    const mHash = value["application.data.mobile_verification_hash"] as string | undefined;
    const eHash = value["application.data.email_verification_hash"] as string | undefined;

    if (mobileVerified) {
      setIsMobileVerified(true);
      setMobileVerifiedAt(mobileVerified);
      setMobileHash(mHash ?? null);
    }
    if (emailVerified) {
      setIsEmailVerified(true);
      setEmailVerifiedAt(emailVerified);
      setEmailHash(eHash ?? null);
    }
  }, [
    value["application.mobile"],
    value["application.email"],
    value["application.contact_person"],
  ]);

  // ── Resend countdown timer
  useEffect(() => {
    if (timerSeconds <= 0) {
      setResendDisabled(false);
      return;
    }
    const t = setTimeout(() => setTimerSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timerSeconds]);

  // ── Sync form changes up to parent state
  const syncParent = (overrides: Record<string, unknown> = {}) => {
    onChange({
      ...value,
      "application.contact_person": name,
      "application.name": name,
      "application.mobile": mobile,
      "application.email": email,
      "application.data.mobile_verified_at": mobileVerifiedAt,
      "application.data.email_verified_at": emailVerifiedAt,
      "application.data.mobile_verification_hash": mobileHash,
      "application.data.email_verification_hash": emailHash,
      ...overrides,
    });
  };

  // ── Validate before sending OTP
  const validateField = (mode: "mobile" | "email") => {
    if (!name.trim()) {
      toast.error("Please enter your name first");
      return false;
    }
    if (mode === "mobile") {
      if (!/^\d{10}$/.test(mobile)) {
        toast.error("Enter a valid 10-digit mobile number");
        return false;
      }
    } else {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        toast.error("Enter a valid email address");
        return false;
      }
    }
    return true;
  };

  // ── Send OTP
  const handleSendOtp = async (mode: "mobile" | "email") => {
    if (!validateField(mode)) return;
    setLoading(true);
    try {
      const payload: any = {
        platform: "EMPLOYEE_PORTAL",
        type: "PARTNER_FLOW",
        name,
        template:
          mode === "mobile" ? "OTP_PARTNER_REGISTRATION" : "EMAIL_OTP_VERIFICATION",
        dedupe: true,
      };
      if (mode === "mobile") payload.mobile = "91" + mobile;
      else payload.email = email;

      const res = await sendOrVerifyOtp(payload);
      if (res?.status === 1) {
        setVerifyMode(mode);
        setOtpDigits(["", "", "", ""]);
        setOtpMessage("");
        setOtpSuccess(false);
        setModalOpen(true);
        setResendDisabled(true);
        setTimerSeconds(60);
      } else {
        toast.error((res as any)?.message?.error ?? "Failed to send OTP");
      }
    } catch {
      toast.error("Something went wrong while sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length < 4) return;
    setLoading(true);
    try {
      const payload: any = {
        type: "PARTNER_FLOW",
        name,
        otp,
        template:
          verifyMode === "mobile" ? "OTP_PARTNER_REGISTRATION" : "EMAIL_OTP_VERIFICATION",
      };
      if (verifyMode === "mobile") payload.mobile = "91" + mobile;
      else payload.email = email;

      const res = await sendOrVerifyOtp(payload);
      if (res?.status === 2) {
        setOtpSuccess(true);
        setOtpMessage(res.result ?? "Verified successfully");
        const now = new Date().toISOString();
        if (verifyMode === "mobile") {
          setIsMobileVerified(true);
          setMobileVerifiedAt(now);
          setMobileHash(res.verification_hash ?? null);
          syncParent({
            "application.data.mobile_verified_at": now,
            "application.data.mobile_verification_hash": res.verification_hash ?? null,
          });
          toast.success("Mobile number verified successfully");
        } else {
          setIsEmailVerified(true);
          setEmailVerifiedAt(now);
          setEmailHash(res.verification_hash ?? null);
          syncParent({
            "application.data.email_verified_at": now,
            "application.data.email_verification_hash": res.verification_hash ?? null,
          });
          toast.success("Email address verified successfully");
        }
        setTimeout(() => setModalOpen(false), 800);
      } else {
        setOtpMessage(
          (res as any)?.message?.error ?? (res as any)?.message ?? "Invalid OTP. Please try again."
        );
      }
    } catch {
      setOtpMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const payload: any = {
        type: "PARTNER_FLOW",
        name,
        template:
          verifyMode === "mobile" ? "OTP_PARTNER_REGISTRATION" : "EMAIL_OTP_VERIFICATION",
        resend: true,
        retry_type: "text",
      };
      if (verifyMode === "mobile") payload.mobile = "91" + mobile;
      else payload.email = email;

      const res = await sendOrVerifyOtp(payload);
      if (res?.status === 1) {
        setResendDisabled(true);
        setTimerSeconds(60);
        setOtpDigits(["", "", "", ""]);
        setOtpMessage("");
        toast.success("OTP resent successfully");
      } else {
        toast.error((res as any)?.message ?? "Failed to resend OTP");
      }
    } catch {
      toast.error("Something went wrong while resending OTP");
    } finally {
      setLoading(false);
    }
  };

  const otpComplete = otpDigits.every((d) => d.length === 1);

  return (
    <div className="flex justify-center py-6">
      <Card className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6 space-y-5">
          {/* Title */}
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-[#1E2A6B]" />
            <h3 className="text-base font-semibold text-slate-800">Onboarding Verification</h3>
          </div>

          {/* Contact Person Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">
              {fieldMeta?.name?.label ?? "Contact Person Name"}
            </Label>
            <Input
              placeholder={fieldMeta?.name?.placeholder ?? "Provide your name as per Aadhaar"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isMobileVerified}
              className="h-10 text-sm"
            />
          </div>

          {/* Mobile */}
          {showMobile && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Mobile</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  disabled={isMobileVerified}
                  className="h-10 text-sm flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={isMobileVerified || loading}
                  onClick={() => handleSendOtp("mobile")}
                  className={cn(
                    "h-10 px-4 text-sm font-medium gap-1.5 whitespace-nowrap",
                    isMobileVerified
                      ? "bg-emerald-600 hover:bg-emerald-600 text-white cursor-default"
                      : "bg-[#1E2A6B] hover:bg-[#16255C] text-white"
                  )}
                >
                  {isMobileVerified ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      Verify OTP
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Email */}
          {showEmail && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Email</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter the email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isEmailVerified || (showMobile && !isMobileVerified)}
                  className="h-10 text-sm flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={isEmailVerified || (showMobile && !isMobileVerified) || loading}
                  onClick={() => handleSendOtp("email")}
                  className={cn(
                    "h-10 px-4 text-sm font-medium gap-1.5 whitespace-nowrap",
                    isEmailVerified
                      ? "bg-emerald-600 hover:bg-emerald-600 text-white cursor-default"
                      : "bg-[#1E2A6B] hover:bg-[#16255C] text-white"
                  )}
                >
                  {isEmailVerified ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send OTP
                    </>
                  )}
                </Button>
              </div>
              {showMobile && !isMobileVerified && (
                <p className="text-xs text-amber-600 mt-1">
                  Verify mobile number first to enable email verification.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) setModalOpen(false);
        }}
      >
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader className="items-center text-center space-y-3">
            {/* Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E2A6B]/10 mx-auto">
              {verifyMode === "email" ? (
                <Mail className="h-8 w-8 text-[#1E2A6B]" />
              ) : (
                <Phone className="h-8 w-8 text-[#1E2A6B]" />
              )}
            </div>
            <DialogTitle className="text-lg font-semibold text-slate-800">Verify OTP</DialogTitle>
            <p className="text-sm text-slate-500">
              {verifyMode === "email"
                ? `Please enter the OTP sent to ${email}`
                : `Please enter the OTP sent to ${mobile}`}
            </p>
          </DialogHeader>

          {/* OTP digits */}
          <OtpInput value={otpDigits} onChange={setOtpDigits} />

          {/* Status message */}
          {otpMessage && (
            <p
              className={cn(
                "text-center text-sm mt-3 font-medium",
                otpSuccess ? "text-emerald-600" : "text-red-500"
              )}
            >
              {otpMessage}
            </p>
          )}

          {/* Verify button */}
          <Button
            className="w-full mt-4 bg-[#1E2A6B] hover:bg-[#16255C] text-white h-10"
            disabled={!otpComplete || loading}
            onClick={handleVerifyOtp}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>

          {/* Resend */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-sm text-slate-500">Didn't receive a code?</span>
            {resendDisabled ? (
              <span className="text-sm font-semibold text-[#1E2A6B]">
                Resend in {timerSeconds}s
              </span>
            ) : (
              <button
                type="button"
                className="text-sm font-semibold text-[#1E2A6B] hover:underline"
                onClick={handleResendOtp}
                disabled={loading}
              >
                Resend
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Register this step component globally — it self-registers just like FORM_BUILDER
// so every portal that imports @craft-apex/workflow-runtime gets it automatically.
registerStepComponent("MOBILE_EMAIL_VERIFICATION", OtpVerificationStep);
