import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import { useAuthStore } from "@craft-apex/auth";
import { api } from "@/lib/api";
import { env } from "@/env";

// Mirrors the backend policy (utility.IsValidPassword): >= 9 chars with at
// least one uppercase letter, one digit, and one special character.
const PASSWORD_POLICY =
  "Password must be at least 9 characters and include an uppercase letter, a number, and a special character.";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password"),
    password: z
      .string()
      .min(9, PASSWORD_POLICY)
      .regex(/[A-Z]/, PASSWORD_POLICY)
      .regex(/[0-9]/, PASSWORD_POLICY)
      .regex(/[!@#$%^&*(),.?":{}|<>]/, PASSWORD_POLICY),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  })
  .refine((data) => data.password !== data.currentPassword, {
    path: ["password"],
    message: "New password must be different from your current password",
  });

type FormValues = z.infer<typeof schema>;

/** Pull the backend's `{ error }` message out of a failed response. */
function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: unknown } | undefined;
    if (typeof data?.error === "string") return data.error;
  }
  if (error instanceof Error) return error.message;
  return "Unable to change password";
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const clearPasswordChange = useAuthStore((s) => s.clearPasswordChange);
  const user = useAuthStore((s) => s.user);

  const onSubmit = async (values: FormValues) => {
    if (user?.id == null) {
      toast.error("Your session has expired. Please sign in again.");
      navigate("/login", { replace: true });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post<unknown, unknown>("/alpha/v1/auth/change-password", {
        user_id: String(user.id),
        old_password: values.currentPassword,
        password: values.password,
      });
      clearPasswordChange();
      toast.success("Password changed successfully.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div
        className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14"
        style={{
          background: "linear-gradient(160deg, #1E2A6B 0%, #141C4A 100%)",
        }}
      >
        <div className="relative flex items-center gap-3 text-white">
          <div className="grid grid-cols-3 gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#1E2A6B]" />
            <div className="h-10 w-10 rounded-lg bg-[#5FDD98]" />
            <div className="h-10 w-10 rounded-lg bg-[#5FDD98]" />
            <div className="h-10 w-10 rounded-lg bg-[#1E2A6B]" />
            <div className="h-10 w-10 rounded-lg bg-[#4C7DF0]" />
            <div className="h-10 w-10 rounded-lg bg-transparent" />
            <div className="h-10 w-10 rounded-lg bg-[#4C7DF0]" />
            <div className="h-10 w-10 rounded-lg bg-transparent" />
            <div className="h-10 w-10 rounded-lg bg-transparent" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            {env.brandName}
          </span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            Reset your password
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300/80">
            Create a secure new password so you can continue using the portal.
          </p>
        </div>

        <p className="text-xs text-slate-400/70">
          © {new Date().getFullYear()} {env.brandName}. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl shadow-slate-900/5">
          <div className="mb-8">
            <p className="text-2xl font-semibold">Change Password</p>
            <p className="mt-3 text-sm text-slate-500">
              Set a new password for your account.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative mt-2">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  autoComplete="current-password"
                  {...register("currentPassword")}
                  aria-invalid={Boolean(errors.currentPassword)}
                  className="pe-11"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  aria-label={
                    showCurrentPassword ? "Hide password" : "Show password"
                  }
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showCurrentPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">New password</Label>
              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  {...register("password")}
                  aria-invalid={Boolean(errors.password)}
                  className="pe-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative mt-2">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className="pe-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save new password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
