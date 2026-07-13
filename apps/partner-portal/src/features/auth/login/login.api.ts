import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { env } from "@/env";
import type {
  LoginResponse,
  LoginResult,
  OtpLoginRequest,
  OtpSendResult,
  PasswordLoginRequest,
  RegistrationState,
} from "./login.types";

// Legacy: `/alpha/${version}/auth/login-with-password` and `.../login-with-otp`.
const PASSWORD_URL = "/alpha/v1/auth/login-with-password";
const OTP_URL = "/alpha/v1/auth/login-with-otp";

/** Legacy CleanCountryCode(mobile, "91") — the backend expects the country code inline. */
export function withCountryCode(mobile: string, code = "91"): string {
  const digits = mobile.replace(/\D/g, "");
  return digits.startsWith(code) ? digits : `${code}${digits}`;
}

/** Payload may be top-level or under `data` (legacy unwrapped the same way). */
function unwrap(res: LoginResponse) {
  return res?.data && (res.data.user || res.data.module) ? res.data : res;
}

/**
 * Legacy LoginOtp.js:234-290. The backend signals partner onboarding state
 * through the login status code rather than a separate endpoint.
 */
function readRegistrationState(res: LoginResponse): RegistrationState | undefined {
  const status = Number(res?.status);
  const channelId = String(res?.channel_id ?? res?.data?.channel_id ?? "");

  if (status === -100) return { kind: "INCOMPLETE", channelId };
  if (status === -101) {
    return res?.pending_ask
      ? {
          kind: "PENDING_ASK",
          channelId,
          channelToken: res?.channel_token ?? res?.data?.channel_token,
        }
      : { kind: "AWAITING_APPROVAL" };
  }
  if (status === -102) return { kind: "REJECTED" };
  return undefined;
}

function toResult(res: LoginResponse): LoginResult {
  const payload = unwrap(res);
  return {
    user: payload?.user,
    module: payload?.module,
    change_password: payload?.change_password,
    sessionConflict:
      res?.status === "ACTIVE_SESSION_CONFLICT" ||
      Number(res?.status) === -14 ||
      res?.http_status === 409,
    registration: readRegistrationState(res),
    message: res?.message,
  };
}

export function usePasswordLogin() {
  return useMutation({
    mutationFn: async (body: PasswordLoginRequest): Promise<LoginResult> => {
      const res = await api.post<unknown, LoginResponse>(PASSWORD_URL, body);
      return toResult(res);
    },
  });
}

/** Step 1 — request an OTP. No session is issued yet. */
export function useSendOtp() {
  return useMutation({
    mutationFn: async (vars: {
      mobile: string;
      resend?: boolean;
    }): Promise<OtpSendResult> => {
      const body: OtpLoginRequest = {
        mobile: withCountryCode(vars.mobile),
        platform: env.platform,
        ...(vars.resend ? { resend: true, retry_type: "text" } : {}),
      };
      const res = await api.post<unknown, LoginResponse>(OTP_URL, body);
      const registration = readRegistrationState(res);
      if (registration) return { ok: false, registration, message: res?.message };
      // Legacy treats any non-negative status as "OTP sent".
      const status = Number(res?.status);
      return {
        ok: !(status < 0),
        message: res?.message,
      };
    },
  });
}

/** Step 2 — verify the OTP; on success this returns the session + module tree. */
export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (vars: {
      mobile: string;
      otp: string;
    }): Promise<LoginResult> => {
      const body: OtpLoginRequest = {
        mobile: withCountryCode(vars.mobile),
        platform: env.platform,
        otp: String(vars.otp),
      };
      const res = await api.post<unknown, LoginResponse>(OTP_URL, body);
      return toResult(res);
    },
  });
}
