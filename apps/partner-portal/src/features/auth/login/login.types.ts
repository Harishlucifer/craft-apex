// Legacy channel-flexi/src/pages/Authentication/{Login,LoginOtp}.js
//   POST /alpha/v1/auth/login-with-password  { email, password }
//   POST /alpha/v1/auth/login-with-otp       { mobile, platform, otp? , resend? }

export interface PasswordLoginRequest {
  email: string;
  password: string;
}

/** OTP is a two-call flow on the same endpoint: without `otp` = send, with `otp` = verify. */
export interface OtpLoginRequest {
  /** country-code prefixed, e.g. "919876543210" (legacy CleanCountryCode(mobile, "91")) */
  mobile: string;
  platform: string;
  otp?: string;
  resend?: boolean;
  retry_type?: string;
}

export interface LoginUser {
  access_token: string;
  refresh_token?: string;
  /** legacy: response.data.user.default_route */
  default_route?: string;
  user_type?: string;
  /** present for channel users — alpha-api authResponse.ChannelId */
  channel_id?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  user?: LoginUser;
  /** backend module tree, persisted to localStorage `module` */
  module?: unknown[];
  change_password?: boolean;
}

/**
 * Raw body. The API may return the payload at the top level OR wrapped in a
 * `{ status, message, data }` envelope (legacy api_helper unwrapped the same way).
 */
export interface LoginResponse extends LoginPayload {
  data?: LoginPayload & { channel_id?: string; channel_token?: string };
  status?: string | number | boolean;
  http_status?: number;
  sessions?: unknown[];
  message?: string;
  channel_id?: string;
  channel_token?: string;
  pending_ask?: boolean;
}

/**
 * Legacy LoginOtp.js status branches — these drive partner self-registration,
 * so they are part of the login contract, not generic errors.
 */
export type RegistrationState =
  /** -100: registration incomplete → resume onboarding at /register/:channelId */
  | { kind: "INCOMPLETE"; channelId: string }
  /** -101 with pending_ask: queries raised against the application */
  | { kind: "PENDING_ASK"; channelId: string; channelToken?: string }
  /** -101 without pending_ask: submitted, awaiting approval */
  | { kind: "AWAITING_APPROVAL" }
  /** -102: registration rejected */
  | { kind: "REJECTED" };

/** Normalized result both login flows return. */
export interface LoginResult {
  user?: LoginUser;
  module?: unknown[];
  change_password?: boolean;
  sessionConflict: boolean;
  /** set when the backend reports the partner has not finished onboarding */
  registration?: RegistrationState;
  message?: string;
}

/** Result of the OTP *send* step (no session yet). */
export interface OtpSendResult {
  ok: boolean;
  message?: string;
  registration?: RegistrationState;
}
