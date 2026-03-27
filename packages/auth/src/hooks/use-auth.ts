import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSetupStore } from "../store/setup-store";
import axiosInstance from "../axios-instance";

/* ------------------------------------------------------------------ */
/*  useAuth – convenience hook for authentication state & actions      */
/* ------------------------------------------------------------------ */

export function useAuth() {
  const router = useRouter();
  const { user, module, privilege, system, tenant, reset, data } =
    useSetupStore();

  /** Whether the current user is authenticated */
  const isAuthenticated = !!user?.access_token;

  /** Current access token (or null) */
  const accessToken = user?.access_token ?? null;

  /** Logout: clear localStorage, reset Zustand, redirect */
  const logout = useCallback(
    (redirectTo = "/login") => {
      localStorage.removeItem("authUser");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("module");
      localStorage.removeItem("guestToken");
      reset();
      router.replace(redirectTo);
    },
    [reset, router]
  );

  /** Get a module tree for verifying route access (mirrors Routes/index.js logic) */
  const verifyRoute = useCallback(
    (routeURL: string, modules?: any[]): boolean => {
      const mods = modules ?? (module as any[]) ?? [];
      for (const mod of mods) {
        const cleanURL = (url: string) => url?.split("?")[0]?.split("#")[0];
        if (cleanURL(mod.url) === routeURL) return true;
        if (mod?.child_module && verifyRoute(routeURL, mod.child_module))
          return true;
      }
      return false;
    },
    [module]
  );

  return {
    isAuthenticated,
    accessToken,
    user,
    module,
    privilege,
    system,
    tenant,
    data,
    logout,
    verifyRoute,
  };
}
