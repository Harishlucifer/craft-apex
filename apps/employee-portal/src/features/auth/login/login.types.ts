// Exact shape from legacy craft-frontend/src/pages/Authentication/Login.js
// POST /alpha/v1/auth/login-with-password  body { email, password }

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  access_token: string;
  refresh_token?: string;
  /** legacy: response.data.user.default_route */
  default_route?: string;
  user_type?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

/** The meaningful login payload (legacy read these off response.data). */
export interface LoginPayload {
  user?: LoginUser;
  /** backend module tree, persisted to localStorage `module` */
  module?: unknown[];
  /** legacy: forces password reset step */
  change_password?: boolean;
}

/**
 * Raw body. The API may return the payload at the top level OR wrapped in a
 * `{ status, message, data }` envelope (legacy api_helper unwrapped the same
 * way: `response.data ? response.data : response`).
 */
export interface LoginResponse extends LoginPayload {
  data?: LoginPayload;
  /** session-conflict signalling (legacy API_STATUS / HTTP_STATUS) */
  status?: string | boolean;
  http_status?: number;
  sessions?: unknown[];
  message?: string;
}

/** Normalized result the page consumes. */
export interface LoginResult {
  user?: LoginUser;
  module?: unknown[];
  change_password?: boolean;
  sessionConflict: boolean;
  message?: string;
}
