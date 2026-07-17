import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { env } from "@/env";
import type {
  LoginResponse,
  LoginResult,
  OtpRequest,
  OtpSendResult,
} from "./login.types";

const OTP_URL = "/alpha/v1/auth/login-with-otp";

/** Backend expects the country code inline (legacy CleanCountryCode(mobile, "91")). */
export function withCountryCode(mobile: string, code = "91"): string {
  const digits = mobile.replace(/\D/g, "");
  return digits.startsWith(code) ? digits : `${code}${digits}`;
}

function unwrapUser(res: LoginResponse) {
  return res?.data?.user ?? res?.user;
}

/** Step 1 — request an OTP. No session is issued yet. */
export function useSendOtp() {
  return useMutation({
    mutationFn: async (vars: {
      mobile: string;
      resend?: boolean;
    }): Promise<OtpSendResult> => {
      const body: OtpRequest = {
        mobile: withCountryCode(vars.mobile),
        platform: env.platform,
        ...(vars.resend ? { resend: true, retry_type: "text" } : {}),
      };
      const res = await api.post<unknown, LoginResponse>(OTP_URL, body);
      const status = Number(res?.status);
      return { ok: !(status < 0) || status === -6, message: res?.message };
    },
  });
}

/** Step 2 — verify the OTP. Returns the session (no module tree for customers). */
export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (vars: {
      mobile: string;
      otp: string;
    }): Promise<LoginResult> => {
      const body: OtpRequest = {
        mobile: withCountryCode(vars.mobile),
        platform: env.platform,
        otp: String(vars.otp),
      };
      const res = await api.post<unknown, LoginResponse>(OTP_URL, body);
      return { user: unwrapUser(res), message: res?.message };
    },
  });
}
