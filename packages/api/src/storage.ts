/**
 * Single source of truth for the auth/session keys we persist in localStorage.
 * Mirrors the legacy keys so a half-migrated deployment stays compatible.
 */
export const STORAGE_KEYS = {
  authUser: "authUser",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  module: "module",
  privilege: "privilege",
  tenant: "tenant",
} as const;

export const tokenStore = {
  get access() {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  },
  get refresh() {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  },
  setTokens(access: string, refresh?: string) {
    localStorage.setItem(STORAGE_KEYS.accessToken, access);
    if (refresh) localStorage.setItem(STORAGE_KEYS.refreshToken, refresh);
  },
  clear() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
