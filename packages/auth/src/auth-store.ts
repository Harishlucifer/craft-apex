import { create } from "zustand";
import { STORAGE_KEYS, tokenStore } from "@craft-apex/api";
import type { AuthSession, AuthUser } from "./types";

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.authUser);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** persist a fresh session after login */
  setSession: (user: AuthUser) => void;
  /** clear the forced password change flag */
  clearPasswordChange: () => void;
  /** clear all session state + storage */
  logout: () => void;
  /** re-read from storage (e.g. cross-tab / bfcache restore) */
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initial = readSession();
  return {
    user: initial?.user ?? null,
    isAuthenticated: Boolean(initial?.user?.access_token),
    setSession: (user) => {
      const session: AuthSession = { user };
      localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(session));
      tokenStore.setTokens(user.access_token, user.refresh_token);
      set({ user, isAuthenticated: true });
    },
    clearPasswordChange: () => {
      set((state) => {
        const user = state.user ? { ...state.user, change_password: false } : null;
        if (user) {
          localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify({ user }));
        }
        return { user, isAuthenticated: Boolean(user?.access_token) };
      });
    },
    logout: () => {
      tokenStore.clear();
      set({ user: null, isAuthenticated: false });
    },
    hydrate: () => {
      const s = readSession();
      set({
        user: s?.user ?? null,
        isAuthenticated: Boolean(s?.user?.access_token),
      });
    },
  };
});
