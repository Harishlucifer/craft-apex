"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axiosInstance from "../../axios-instance";
import { useSetupStore } from "../../store/setup-store";
import type { LoginConfig } from "../../types/login";

/* ------------------------------------------------------------------ */
/*  Login with Password                                                */
/* ------------------------------------------------------------------ */

interface LoginPasswordProps {
  config: LoginConfig;
}

export function LoginPassword({ config }: LoginPasswordProps) {
  const version = config.version ?? "v2";
  const setSetupData = useSetupStore((s) => s.setSetupData);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Please enter your email";
    if (!password.trim()) e.password = "Please enter your password";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const { data: response } = await axiosInstance.post(
        `/alpha/${version}/auth/login-with-password`,
        { email, password }
      );

      // API shape: { data: { user, module, system, tenant, ... }, status: 1 }
      const payload = response.data;
      const user = payload?.user;

      if (user?.access_token) {
        // Persist tokens to localStorage
        localStorage.removeItem("guestToken");
        localStorage.setItem("authUser", JSON.stringify(payload));
        localStorage.setItem("accessToken", user.access_token);
        localStorage.setItem("refreshToken", user.refresh_token);
        localStorage.setItem("module", JSON.stringify(payload.module));

        // Update Zustand store with login response
        // (same structure as setup: system, tenant, module, privilege, user)
        setSetupData(payload);

        config.onLoginSuccess?.(payload);

        // If the API says user must change password, redirect there
        if (payload.change_password) {
          config.onNavigate?.("/change-password");
        } else {
          const route =
            user.default_route ?? config.defaultRoute ?? "/dashboard";
          config.onNavigate?.(route);
        }
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? "Invalid username or password";
      setError(msg);
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`flex h-11 w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            errors.email ? "border-destructive" : "border-input"
          }`}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          {!config.hidePasswordReset && (
            <Link
              href={config.forgotPasswordRoute ?? "/forgot-password"}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot Password
            </Link>
          )}
        </div>
        <div className="relative">
          <input
            id="login-password"
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

      {/* Error alert */}
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
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
