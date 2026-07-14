// POST /alpha/v1/auth/login-with-otp  { mobile, platform, otp? , resend? }
//
// Customers are keyed by MOBILE, not email (alpha-api user.FindByMobile /
// CreateUpdateCustomer), and have no password — OTP is the only login method.

export interface OtpRequest {
  /** country-code prefixed, e.g. "919876543210" */
  mobile: string;
  platform: string;
  otp?: string;
  resend?: boolean;
  retry_type?: string;
}

export interface CustomerUser {
  access_token: string;
  refresh_token?: string;
  user_type?: string;
  name?: string;
  mobile?: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  /** payload may be top-level or nested under `data` */
  data?: { user?: CustomerUser };
  user?: CustomerUser;
  status?: string | number | boolean;
  http_status?: number;
  message?: string;
}

export interface OtpSendResult {
  ok: boolean;
  message?: string;
}

export interface LoginResult {
  user?: CustomerUser;
  message?: string;
}
