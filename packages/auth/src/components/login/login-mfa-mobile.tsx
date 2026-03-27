"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import axiosInstance from "../../axios-instance";
import { useSetupStore } from "../../store/setup-store";
import type { LoginConfig } from "../../types/login";

/* ------------------------------------------------------------------ */
/*  Login with MFA Mobile (Mobile + Password → OTP)                    */
/*  Ref: LoginWithMfaMobile.js                                         */
/* ------------------------------------------------------------------ */

interface LoginMfaMobileProps {
  config: LoginConfig;
}

export function LoginMfaMobile({ config }: LoginMfaMobileProps) {
  const version = config.version ?? "v2";
  const setSetupData = useSetupStore((s) => s.setSetupData);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState<{
    mobile?: string;
    password?: string;
    otp?: string;
  }>({});

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const validate = () => {
    const e: typeof errors = {};
    if (!mobile.trim()) e.mobile = "Please enter your mobile number";
    else if (mobile.length < 10) e.mobile = "Enter a valid 10-digit mobile number";
    if (!password.trim()) e.password = "Please enter your password";
    if (otpSent && (!otp.trim() || otp.length < 4))
      e.otp = "Enter a valid OTP";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (otpSent && !otp) {
      setError("Please enter the OTP to proceed.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const payload: Record<string, unknown> = { mobile, password };
    if (otpSent && otp) payload.otp = otp;

    try {
      const { data: response } = await axiosInstance.post(
        `/alpha/${version}/auth/login-with-mfa`,
        payload
      );

      // API shape: { data: { user, module, system, ... }, status: 1 }
      const loginData = response.data;
      const user = loginData?.user;

      if (user?.access_token) {
        // Login success – OTP verified
        localStorage.removeItem("guestToken");
        localStorage.setItem("authUser", JSON.stringify(loginData));
        localStorage.setItem("accessToken", user.access_token);
        localStorage.setItem("refreshToken", user.refresh_token);
        localStorage.setItem("module", JSON.stringify(loginData.module));

        // Update Zustand store with login response
        setSetupData(loginData);

        config.onLoginSuccess?.(loginData);
        if (loginData.change_password) {
          config.onNavigate?.("/change-password");
        } else {
          const route =
            user.default_route ?? config.defaultRoute ?? "/dashboard";
          config.onNavigate?.(route);
        }
      } else {
        // OTP sent successfully, show OTP field
        setOtpSent(true);
        setTimer(60);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Login failed";
      setError(msg);
      // If not an OTP-related error (-7), reset OTP state
      if (err?.response?.data?.status !== -7) {
        setOtpSent(false);
        setPassword("");
        setOtp("");
      } else {
        setOtp("");
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await axiosInstance.post(`/alpha/${version}/auth/login-with-mfa`, {
        mobile,
        password,
        resend: true,
      });
      setTimer(60);
      setSuccess("OTP resent successfully");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Step 1: Mobile + Password (animated slide) */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          otpSent
            ? "max-h-0 overflow-hidden opacity-0"
            : "max-h-96 opacity-100"
        }`}
      >
        {/* Mobile Number */}
        <div className="space-y-2 mb-4">
          <label
            htmlFor="mfa-mobile"
            className="text-sm font-medium text-foreground"
          >
            Mobile Number
          </label>
          <input
            id="mfa-mobile"
            type="tel"
            placeholder="Enter your mobile number"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            className={`flex h-11 w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              errors.mobile ? "border-destructive" : "border-input"
            }`}
          />
          {errors.mobile && (
            <p className="text-sm text-destructive">{errors.mobile}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="mfa-mobile-password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            {!config.hidePasswordReset && (
              <Link
                href={config.forgotPasswordRoute ?? "/forgot-password"}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="mfa-mobile-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`flex h-11 w-full rounded-lg border bg-muted/50 px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                errors.password ? "border-destructive" : "border-input"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>
      </div>

      {/* Step 2: OTP (animated slide in) */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          otpSent
            ? "max-h-96 opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        {otpSent && (
          <>
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError("");
              }}
              className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </button>

            <div className="space-y-2">
              <label
                htmlFor="mfa-mobile-otp"
                className="text-sm font-medium text-foreground"
              >
                Enter OTP
              </label>
              <input
                id="mfa-mobile-otp"
                type="text"
                placeholder={`Enter OTP${timer > 0 ? ` (${timer}s)` : ""}`}
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                autoComplete="one-time-code"
                className={`flex h-11 w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm tracking-[0.5em] text-center font-mono ring-offset-background placeholder:text-muted-foreground placeholder:tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  errors.otp ? "border-destructive" : "border-input"
                }`}
              />
              {errors.otp && (
                <p className="text-sm text-destructive">{errors.otp}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Success */}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#111] px-4 py-2 text-sm font-semibold text-white shadow-md ring-offset-background transition-all hover:bg-[#222] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait...
          </>
        ) : otpSent ? (
          "Verify OTP"
        ) : (
          "Submit"
        )}
      </button>

      {/* Resend */}
      {otpSent && timer === 0 && (
        <div className="text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Didn&apos;t receive a code?
          </p>
          <button
            type="button"
            onClick={resendOtp}
            disabled={loading}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Resend OTP
          </button>
        </div>
      )}
    </form>
  );
}
