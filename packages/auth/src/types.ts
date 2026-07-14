export interface AuthUser {
  id?: string | number;
  name?: string;
  email?: string;
  /**
   * Present on every AuthResponse the backend returns (app/handler/user/user.go).
   * Declared explicitly so it resolves to `string` rather than `unknown` via the
   * index signature below — the consumer portal is mobile/OTP-first and renders
   * it directly.
   */
  mobile?: string;
  access_token: string;
  refresh_token?: string;
  [key: string]: unknown;
}

/** Shape persisted under localStorage `authUser` (legacy-compatible). */
export interface AuthSession {
  user: AuthUser;
}
