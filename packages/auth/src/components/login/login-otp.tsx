"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import axiosInstance from "../../axios-instance";
import { useSetupStore } from "../../store/setup-store";
import type { LoginConfig } from "../../types/login";

/* ------------------------------------------------------------------ */
/*  Login with OTP                                                     */
/* ------------------------------------------------------------------ */

interface LoginOtpProps {
  config: LoginConfig;
}

export function LoginOtp({ config }: LoginOtpProps) {
  const version = config.version ?? "v2";
  const platform = config.platform ?? "EMPLOYEE_PORTAL";
  const setSetupData = useSetupStore((s) => s.setSetupData);

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState<{ mobile?: string; otp?: string }>({});

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const validate = () => {
    const e: typeof errors = {};
    if (!mobile.trim() || !/^\d{10}$/.test(mobile))
      e.mobile = "Enter a valid 10-digit mobile number";
    if (otpSent && (!otp.trim() || otp.length !== 4))
      e.otp = "Enter a 4-digit OTP";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sendOtp = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await axiosInstance.post(
        `/alpha/${version}/auth/login-with-otp`,
        { mobile: "91" + mobile, platform }
      );

      if (data?.status === -6) {
        setOtpSent(true);
        setSuccess(data.message || "OTP sent successfully");
        setTimer(60);
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data?.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error ?? "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      const { data: response } = await axiosInstance.post(
        `/alpha/${version}/auth/login-with-otp`,
        { mobile: "91" + mobile, platform, otp: String(otp) }
      );

      // API shape: { data: { user, module, system, ... }, status: 1 }
      const loginData = response.data;
      const user = loginData?.user;

      if (user?.access_token) {
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
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`/alpha/${version}/auth/login-with-otp`, {
        mobile: "91" + mobile,
        platform,
        resend: true,
        retry_type: "text",
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        otpSent ? verifyOtp() : sendOtp();
      }}
      className="space-y-4"
    >
      {/* Mobile */}
      <div className="space-y-2">
        <label
          htmlFor="login-mobile"
          className="text-sm font-medium text-foreground"
        >
          Mobile Number
        </label>
        <input
          id="login-mobile"
          type="text"
          placeholder="Enter 10-digit mobile number"
          maxLength={10}
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
          disabled={otpSent}
          className={`flex h-11 w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.mobile ? "border-destructive" : "border-input"
          }`}
        />
        {errors.mobile && (
          <p className="text-sm text-destructive">{errors.mobile}</p>
        )}
      </div>

      {/* OTP (after send) */}
      {otpSent && (
        <div className="space-y-2">
          <label
            htmlFor="login-otp"
            className="text-sm font-medium text-foreground"
          >
            OTP
          </label>
          <input
            id="login-otp"
            type="text"
            placeholder="Enter 4-digit OTP"
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
      )}

      {/* Alerts */}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Timer */}
      {otpSent && timer > 0 && (
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {timer}
          </div>
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
          "Send OTP"
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
