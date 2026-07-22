import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@craft-apex/auth";
import { api } from "@/lib/api";

interface AutoLoginGuardProps {
  /** Children to render after autoLogin is resolved (or if no token is present) */
  children: ReactNode;
}

/**
 * Handles the `?autoLogin=<JWT>` query parameter before rendering protected
 * children.  The token is exchanged for a real session via
 * `POST /alpha/v1/auth/login-with-link`, the session is stored via
 * `useAuthStore.setSession`, and the token is stripped from the URL so
 * the page is clean (and refresh-safe).
 *
 * Usage: wrap any route element that can receive an autoLogin token:
 *
 *   <AutoLoginGuard>
 *     <ConsumerLenderApply />
 *   </AutoLoginGuard>
 *
 * The component must be rendered *inside* the router so it has access to
 * `useSearchParams`.  It should sit *outside* AuthGuard in the route tree so
 * it can set the session before the guard checks it.
 */
export function AutoLoginGuard({ children }: AutoLoginGuardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const autoLoginToken = searchParams.get("autoLogin");

  // null  = not yet resolved
  // true  = resolved OK (or nothing to do)
  // false = exchange failed
  const [resolved, setResolved] = useState<boolean | null>(
    // If already authenticated or no token, skip the exchange immediately
    !autoLoginToken ? true : isAuthenticated ? null : null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No token — nothing to do
    if (!autoLoginToken) {
      setResolved(true);
      return;
    }

    // Already authenticated — just strip the token from the URL
    if (isAuthenticated) {
      stripToken();
      setResolved(true);
      return;
    }

    let cancelled = false;

    const exchange = async () => {
      try {
        const res = await api.post<unknown, any>(
          "/alpha/v1/auth/login-with-link",
          { token: autoLoginToken }
        );

        if (cancelled) return;

        const data = res?.data ?? res;
        const accessToken = data?.user?.access_token;

        if (!accessToken) {
          setError("Auto-login failed. Please log in manually.");
          setResolved(false);
          return;
        }

        // Persist session using the shared auth store
        setSession(data.user);

        // Strip the token from the URL (replace so it's not in history)
        stripToken();
        setResolved(true);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Auto-login failed. Please log in manually.";
        setError(msg);
        setResolved(false);
      }
    };

    exchange();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoginToken]);

  function stripToken() {
    setSearchParams(
      (prev) => {
        prev.delete("autoLogin");
        return prev;
      },
      { replace: true }
    );
  }

  // Still exchanging
  if (resolved === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E2A6B]" />
          <p className="text-sm font-medium">Signing you in&hellip;</p>
        </div>
      </div>
    );
  }

  // Exchange failed
  if (resolved === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-rose-600">Unable to sign in</p>
          <p className="mt-1.5 text-sm text-slate-500">
            {error ?? "The link may have expired. Please request a new one."}
          </p>
          <a
            href="/login"
            className="mt-4 inline-block rounded-xl bg-[#1E2A6B] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#16255C]"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Resolved — render children (AuthGuard will now find a valid session)
  return <>{children}</>;
}
