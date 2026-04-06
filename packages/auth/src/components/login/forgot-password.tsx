import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import axiosInstance from "../../axios-instance";
import type { LoginConfig } from "../../types/login";

/* ------------------------------------------------------------------ */
/*  Forgot Password                                                    */
/* ------------------------------------------------------------------ */

interface ForgotPasswordProps {
  config: LoginConfig;
}

export function ForgotPassword({ config }: ForgotPasswordProps) {
  const platform = config.platform ?? "EMPLOYEE_PORTAL";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Please enter your email");
      return;
    }
    setEmailError("");
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await axiosInstance.post(
        "/alpha/v1/auth/reset-password",
        { email },
        { headers: { "X-Platform": platform } }
      );
      setSuccess(data?.message || "Reset link sent to your email!");
    } catch (err: any) {
      setError(
        err?.response?.data?.error ?? "Failed to send reset link. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Forgot Password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you instructions to reset your
          password.
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
        Enter your email and instructions will be sent to you!
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="forgot-email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              emailError ? "border-destructive" : "border-input"
            }`}
          />
          {emailError && (
            <p className="text-sm text-destructive">{emailError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
