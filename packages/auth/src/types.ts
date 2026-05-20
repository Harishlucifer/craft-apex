export interface AuthUser {
  id?: string | number;
  name?: string;
  email?: string;
  access_token: string;
  refresh_token?: string;
  [key: string]: unknown;
}

/** Shape persisted under localStorage `authUser` (legacy-compatible). */
export interface AuthSession {
  user: AuthUser;
}
