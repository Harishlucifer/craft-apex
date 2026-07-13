import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Handshake,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useAuthStore } from "@craft-apex/auth";
import { useModuleStore, type ModuleNode } from "@craft-apex/layout";
import { toast } from "@craft-apex/ui";
import { env } from "@/env";
import { usePasswordLogin, useSendOtp, useVerifyOtp } from "./login.api";
import type { LoginResult, RegistrationState } from "./login.types";

const NAVY = "#1E2A6B";
const NAVY_DEEP = "#141C4A";
const GREEN = "#5FDD98";
const BLUE = "#4C7DF0";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 ps-11 pe-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4C7DF0] focus:bg-white focus:ring-4 focus:ring-[#4C7DF0]/15";

const passwordSchema = z.object({
  email: z.string().min(1, "Please enter your email"),
  password: z.string().min(1, "Please enter your password"),
});
type PasswordValues = z.infer<typeof passwordSchema>;

const mobileSchema = z.object({
  mobile: z
    .string()
    .min(10, "Enter a valid 10-digit mobile number")
    .regex(/^[0-9+\s-]+$/, "Enter a valid mobile number"),
});
type MobileValues = z.infer<typeof mobileSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const setModules = useModuleStore((s) => s.setModules);
  const [method, setMethod] = useState<"password" | "otp">("password");

  /**
   * Both flows end here. Partner login returns the same
   * { user, module, change_password } envelope as the employee portal, so the
   * module tree drives the sidebar and permissions exactly the same way.
   */
  const handleSession = (res: LoginResult) => {
    if (res.registration) {
      handleRegistrationState(res.registration);
      return;
    }
    if (res.sessionConflict) {
      toast.error("This account is already signed in on another session.");
      return;
    }
    if (!res.user?.access_token) {
      toast.error(res.message ?? "Login failed");
      return;
    }

    setSession(res.user);
    if (Array.isArray(res.module)) {
      setModules(res.module as ModuleNode[]);
    }

    const from = (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname;
    navigate(from ?? res.user.default_route ?? "/dashboard", { replace: true });
  };

  /** Legacy LoginOtp.js — an unfinished/rejected partner is routed, not errored. */
  const handleRegistrationState = (state: RegistrationState) => {
    switch (state.kind) {
      case "INCOMPLETE":
        toast.message("Finish your registration to continue.");
        navigate(`/register/${state.channelId}`);
        break;
      case "PENDING_ASK":
        toast.message("There are queries pending on your registration.");
        navigate(`/register/${state.channelId}`, {
          state: { ask: state.channelToken, raised_ask: true },
        });
        break;
      case "AWAITING_APPROVAL":
        toast.message("Your registration is submitted and awaiting approval.");
        break;
      case "REJECTED":
        toast.error("Your registration was rejected. Please contact support.");
        break;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left — brand panel */}
      <div
        className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14"
        style={{
          background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -start-32 -top-32 h-[30rem] w-[30rem] rounded-full blur-[120px]"
            style={{ backgroundColor: `${BLUE}55` }}
          />
          <div
            className="absolute -bottom-40 end-0 h-[28rem] w-[28rem] rounded-full blur-[120px]"
            style={{ backgroundColor: `${GREEN}40` }}
          />
        </div>

        <div className="relative flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: GREEN }}
          >
            <Handshake className="h-5 w-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-white">
            {env.brandName}
          </span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            Source more. Close faster.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300/80">
            Submit leads, track applications, and manage your payouts in one
            place.
          </p>
        </div>

        <p className="relative text-xs text-slate-400/70">
          © {new Date().getFullYear()} {env.brandName}. All rights reserved.
        </p>
      </div>

      {/* Right — form */}
      <div className="relative flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="relative mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)]">
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(90deg, ${NAVY}, ${BLUE}, ${GREEN})`,
              }}
            />

            <div className="px-8 py-9 sm:px-10">
              <div className="mb-7 flex items-center justify-between">
                <span className="text-base font-semibold tracking-tight text-slate-900">
                  Partner sign in
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: `${GREEN}1f`, color: "#0f7a4d" }}
                >
                  <ShieldCheck className="h-3 w-3" />
                  Secure
                </span>
              </div>

              {/* Method toggle — legacy picks this from tenant.system.login_type;
                  until that config is wired we offer both. */}
              <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                {(
                  [
                    ["password", "Password"],
                    ["otp", "Mobile OTP"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMethod(key)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      method === key
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {method === "password" ? (
                <PasswordForm onSession={handleSession} />
              ) : (
                <OtpForm onSession={handleSession} />
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            New partner?{" "}
            <a
              href="/register"
              className="font-medium transition hover:opacity-80"
              style={{ color: BLUE }}
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function PasswordForm({ onSession }: { onSession: (r: LoginResult) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync, isPending } = usePasswordLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      onSession(await mutateAsync(values));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            autoComplete="username"
            placeholder="you@partner.com"
            className={inputClass}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-xs text-rose-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${inputClass} pe-11`}
            {...register("password")}
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
          <p className="mt-2 text-xs text-rose-500">{errors.password.message}</p>
        )}
      </div>

      <SubmitButton pending={isPending} label="Sign in" pendingLabel="Signing in" />
    </form>
  );
}

function OtpForm({ onSession }: { onSession: (r: LoginResult) => void }) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const send = useSendOtp();
  const verify = useVerifyOtp();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<MobileValues>({ resolver: zodResolver(mobileSchema) });

  const onSend = handleSubmit(async (values) => {
    try {
      const res = await send.mutateAsync({ mobile: values.mobile });
      if (res.registration) {
        // Reuse the parent's routing for onboarding states.
        onSession({ sessionConflict: false, registration: res.registration });
        return;
      }
      if (!res.ok) {
        toast.error(res.message ?? "Could not send OTP");
        return;
      }
      setSentTo(values.mobile);
      toast.success("OTP sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send OTP");
    }
  });

  const onVerify = async () => {
    if (!sentTo || otp.length < 4) return;
    try {
      onSession(await verify.mutateAsync({ mobile: sentTo, otp }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid OTP");
    }
  };

  const onResend = async () => {
    if (!sentTo) return;
    try {
      await send.mutateAsync({ mobile: sentTo, resend: true });
      toast.success("OTP resent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not resend OTP");
    }
  };

  if (!sentTo) {
    return (
      <form onSubmit={onSend} className="space-y-5">
        <div>
          <label
            htmlFor="mobile"
            className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
          >
            Mobile number
          </label>
          <div className="relative">
            <Smartphone className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="mobile"
              inputMode="tel"
              autoComplete="tel"
              placeholder="9876543210"
              className={inputClass}
              {...register("mobile")}
            />
          </div>
          {errors.mobile && (
            <p className="mt-2 text-xs text-rose-500">{errors.mobile.message}</p>
          )}
        </div>
        <SubmitButton
          pending={send.isPending}
          label="Send OTP"
          pendingLabel="Sending"
        />
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="otp"
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
        >
          Enter OTP
        </label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-center text-lg tracking-[0.5em] text-slate-900 outline-none transition focus:border-[#4C7DF0] focus:bg-white focus:ring-4 focus:ring-[#4C7DF0]/15"
        />
        <p className="mt-2 text-xs text-slate-500">
          Sent to {getValues("mobile")}.{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={send.isPending}
            className="font-medium transition hover:opacity-80 disabled:opacity-50"
            style={{ color: BLUE }}
          >
            Resend
          </button>
        </p>
      </div>

      <button
        type="button"
        onClick={onVerify}
        disabled={verify.isPending || otp.length < 4}
        className="group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
          boxShadow: `0 14px 26px -12px ${BLUE}90`,
        }}
      >
        {verify.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        )}
        {verify.isPending ? "Verifying" : "Verify & sign in"}
      </button>

      <button
        type="button"
        onClick={() => {
          setSentTo(null);
          setOtp("");
        }}
        className="w-full text-center text-xs text-slate-400 transition hover:text-slate-600"
      >
        Use a different number
      </button>
    </div>
  );
}

function SubmitButton({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
        boxShadow: `0 14px 26px -12px ${BLUE}90`,
      }}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      )}
      {pending ? pendingLabel : label}
    </button>
  );
}
