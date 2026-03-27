"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSetupStore } from "../store/setup-store";

/* ------------------------------------------------------------------ */
/*  AuthProtected – Next.js App Router auth guard                      */
/*                                                                      */
/*  Wraps protected routes. If no access_token is found in             */
/*  localStorage or the Zustand store, redirects to /login.             */
/*                                                                      */
/*  Adapted from Routes/AuthProtected.js (React Router version).        */
/* ------------------------------------------------------------------ */

interface AuthProtectedProps {
  children: React.ReactNode;
  /** The login route to redirect to when unauthenticated (default: /login) */
  loginRoute?: string;
  /** Optional loading/skeleton to show while checking auth */
  loadingFallback?: React.ReactNode;
}

export function AuthProtected({
  children,
  loginRoute = "/login",
  loadingFallback,
}: AuthProtectedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setSetupData } = useSetupStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // 1. If Zustand already has the user (e.g. after login), we're good
    if (user?.access_token) {
      setIsAuthed(true);
      setIsChecking(false);
      return;
    }

    // 2. Check localStorage (page refresh scenario)
    try {
      const stored = localStorage.getItem("authUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user?.access_token) {
          // Rehydrate the Zustand store from localStorage
          setSetupData(parsed);
          setIsAuthed(true);
          setIsChecking(false);
          return;
        }
      }
    } catch {
      // JSON parse failed – treat as unauthenticated
    }

    // 3. No valid auth found → redirect to login
    setIsAuthed(false);
    setIsChecking(false);
    router.replace(loginRoute);
  }, [user, setSetupData, router, loginRoute]);

  if (isChecking) {
    return (
      loadingFallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      )
    );
  }

  if (!isAuthed) {
    return null; // Will redirect via the effect above
  }

  return <>{children}</>;
}
