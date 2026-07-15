import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { useAuthStore } from "@craft-apex/auth";
import { toast } from "@craft-apex/ui";
import { env } from "@/env";
import { useSendOtp, useVerifyOtp } from "./login.api";

const mobileSchema = z.object({
  mobile: z
    .string()
    .min(10, "Enter a valid 10-digit mobile number")
    .regex(/^[0-9+\s-]+$/, "Enter a valid mobile number"),
});
type MobileValues = z.infer<typeof mobileSchema>;

/**
 * Customer login is OTP-by-mobile only — there is no password for
 * UserTypeCustomer, and no module tree comes back, so nothing is written to
 * the module store.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);

  const [sentTo, setSentTo] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const send = useSendOtp();
  const verify = useVerifyOtp();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<MobileValues>({ resolver: zodResolver(mobileSchema) });

  const onSend = handleSubmit(async (values) => {
    try {
      const res = await send.mutateAsync({ mobile: values.mobile });
      if (!res.ok) {
        setError("mobile", {
          type: "manual",
          message: res.message ?? "Invalid credentials",
        });
        return;
      }
      setSentTo(values.mobile);
      toast.success("OTP sent");
    } catch (e) {
      setError("mobile", {
        type: "manual",
        message: e instanceof Error ? e.message : "Invalid credentials",
      });
    }
  });

  const onVerify = async () => {
    if (!sentTo || otp.length < 4) return;
    try {
      const res = await verify.mutateAsync({ mobile: sentTo, otp });
      if (!res.user?.access_token) {
        toast.error(res.message ?? "Invalid OTP");
        return;
      }
      setSession(res.user);
      const from = (location.state as { from?: { pathname: string } } | null)
        ?.from?.pathname;
      navigate(from ?? "/applications", { replace: true });
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {env.brandName}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to track your applications and loans.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {!sentTo ? (
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 ps-11 pe-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                    {...register("mobile")}
                  />
                </div>
                {errors.mobile && (
                  <p className="mt-2 text-xs text-rose-500">
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={send.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {send.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {send.isPending ? "Sending" : "Send OTP"}
              </button>
            </form>
          ) : (
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-center text-lg tracking-[0.5em] text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Sent to {sentTo}.{" "}
                  <button
                    type="button"
                    onClick={onResend}
                    disabled={send.isPending}
                    className="font-medium text-slate-900 underline-offset-2 transition hover:underline disabled:opacity-50"
                  >
                    Resend
                  </button>
                </p>
              </div>

              <button
                type="button"
                onClick={onVerify}
                disabled={verify.isPending || otp.length < 4}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verify.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {verify.isPending ? "Verifying" : "Verify & continue"}
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
          )}
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3 w-3" />
          Your data is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
