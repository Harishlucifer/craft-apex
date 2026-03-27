"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetupStore, axiosInstance } from "@craft-apex/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@craft-apex/ui/components/card";
import { Button } from "@craft-apex/ui/components/button";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Change Password Page                                               */
/* ------------------------------------------------------------------ */

interface FormErrors {
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}

const PASSWORD_RULES = [
  { label: "At least 12 characters", test: (v: string) => v.length >= 12 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  {
    label: "One special character (@$!%?&#*^)",
    test: (v: string) => /[@$!%?&#*^]/.test(v),
  },
];

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useSetupStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!currentPassword) {
      errs.current_password = "Please enter Current Password.";
    }

    if (!newPassword) {
      errs.new_password = "Please enter New Password.";
    } else if (newPassword.length !== 12) {
      errs.new_password =
        "Password must be exactly 12 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&#*^])[A-Za-z\d@$!%?&#*^]{12,}$/.test(
        newPassword
      )
    ) {
      errs.new_password =
        "Password must include an uppercase letter, a lowercase letter, a number, and a special character.";
    }

    if (!confirmPassword) {
      errs.confirm_password =
        "Confirm Password is required. It must match the New Password.";
    } else if (confirmPassword !== newPassword) {
      errs.confirm_password =
        "New & Confirm Passwords do not match. Please ensure both fields have the same value.";
    }

    return errs;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = async () => {
    const allTouched = {
      current_password: true,
      new_password: true,
      confirm_password: true,
    };
    setTouched(allTouched);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const payload = {
        user_id: user?.id,
        old_password: currentPassword,
        password: newPassword,
      };

      const response = await axiosInstance.post(
        "/alpha/v1/auth/change-password",
        payload
      );

      if (response.data?.status) {
        setSubmitMessage({
          type: "success",
          text: response.data?.message || "Password changed successfully!",
        });
        // Redirect to logout after a short delay
        setTimeout(() => {
          router.push("/logout");
        }, 2000);
      } else {
        setSubmitMessage({
          type: "error",
          text:
            response.data?.message?.error ||
            "Failed to change password. Please try again.",
        });
      }
    } catch (err: any) {
      setSubmitMessage({
        type: "error",
        text:
          err?.response?.data?.message?.error ||
          "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Change Password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your account password
        </p>
      </div>

      {/* Status message */}
      {submitMessage && (
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            submitMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {submitMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {submitMessage.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Password Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Current Password */}
            <div className="space-y-2">
              <label
                htmlFor="current_password"
                className="text-sm font-medium text-slate-700"
              >
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  id="current_password"
                  autoComplete="off"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onBlur={() => handleBlur("current_password")}
                  className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition-colors ${
                    touched.current_password && errors.current_password
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                      : "border-slate-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {touched.current_password && errors.current_password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.current_password}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="new_password"
                className="text-sm font-medium text-slate-700"
              >
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  id="new_password"
                  autoComplete="off"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => handleBlur("new_password")}
                  className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition-colors ${
                    touched.new_password && errors.new_password
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                      : "border-slate-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {touched.new_password && errors.new_password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.new_password}
                </p>
              )}

              {/* Password strength indicators */}
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(newPassword);
                    return (
                      <div
                        key={rule.label}
                        className="flex items-center gap-1.5 text-[11px]"
                      >
                        {passed ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-slate-300" />
                        )}
                        <span
                          className={
                            passed ? "text-green-600" : "text-slate-400"
                          }
                        >
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirm_password"
                className="text-sm font-medium text-slate-700"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirm_password"
                  autoComplete="off"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur("confirm_password")}
                  onPaste={(e) => {
                    e.preventDefault();
                    setErrors((prev) => ({
                      ...prev,
                      confirm_password: "Please enter password manually",
                    }));
                    setTouched((prev) => ({
                      ...prev,
                      confirm_password: true,
                    }));
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition-colors ${
                    touched.confirm_password && errors.confirm_password
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                      : "border-slate-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {touched.confirm_password && errors.confirm_password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirm_password}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
