/* ------------------------------------------------------------------ */
/*  Login-related types                                                */
/* ------------------------------------------------------------------ */

/** Login type values returned by the setup API (system.login_type) */
export const LOGIN_TYPE = {
  PASSWORD: "PASSWORD",
  OTP: "OTP",
  PASSWORD_AND_OTP: "PASSWORD+OTP",
  MOBILE_PASSWORD_OTP: "MOBILE+PASSWORD+OTP",
} as const;

export type LoginTypeValue = (typeof LOGIN_TYPE)[keyof typeof LOGIN_TYPE];

/** Callback to handle successful login (persist tokens, navigate, etc.) */
export interface LoginSuccessPayload {
  data: Record<string, unknown>;
  user: {
    access_token: string;
    refresh_token?: string;
    default_route?: string;
    user_type?: string;
    [key: string]: unknown;
  };
  module?: unknown;
  change_password?: boolean;
  sessions?: ActiveSession[];
}

export interface ActiveSession {
  accessToken?: string;
  [key: string]: unknown;
}

export interface LoginConfig {
  /** API base URL (falls back to env var) */
  apiUrl?: string;
  /** Platform identifier (e.g. "EMPLOYEE_PORTAL") */
  platform?: string;
  /** API version (e.g. "v1" or "v2") */
  version?: string;
  /** Logo URL */
  logoUrl?: string;
  /** Brand name */
  brandName?: string;
  /** Background image URL for the left panel */
  backgroundUrl?: string;
  /** Whether to hide the forgot-password link */
  hidePasswordReset?: boolean;
  /** Route for forgot-password page */
  forgotPasswordRoute?: string;
  /** Route after successful login */
  defaultRoute?: string;
  /** Route for signup / registration page */
  signupRoute?: string;
  /** Label for the signup link (e.g. "Sign Up", "Register") */
  signupLabel?: string;
  /** Callback after successful login */
  onLoginSuccess?: (payload: LoginSuccessPayload) => void;
  /** Callback for navigating (e.g. router.push) */
  onNavigate?: (path: string) => void;
}
