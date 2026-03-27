import { useEffect, useRef } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axiosInstance from "../axios-instance";
import { useSetupStore } from "../store/setup-store";
import type { SetupResponse } from "../types/setup";

/* ------------------------------------------------------------------ */
/*  POST /alpha/v1/setup – TanStack Query hook                        */
/* ------------------------------------------------------------------ */

export const SETUP_QUERY_KEY = ["setup"] as const;

/**
 * Calls the setup endpoint and persists the result into both
 * Zustand (global state) and localStorage (tokens).
 */
async function fetchSetup(): Promise<SetupResponse> {
  const { data } = await axiosInstance.post<SetupResponse>(
    "/alpha/v1/setup",
    {}
  );
  return data;
}

/** Shared helper – persists tokens + hydrates the Zustand store. */
function handleSetupSuccess(response: SetupResponse) {
  const setupData = response.data;
  const { setSetupData } = useSetupStore.getState();

  // Persist tokens to localStorage
  if (setupData.user?.access_token) {
    if (setupData.user.user_type === "GUEST") {
      localStorage.setItem("guestToken", setupData.user.access_token);
    } else {
      localStorage.setItem("accessToken", setupData.user.access_token);
    }
  }
  if (setupData.user?.refresh_token) {
    localStorage.setItem("refreshToken", setupData.user.refresh_token);
  }

  // Hydrate the Zustand store
  setSetupData(setupData);
}

/**
 * `useSetupQuery` – fires the setup call on mount and
 * populates the Zustand store with the response.
 *
 * Usage:
 * ```tsx
 * const { isLoading, error } = useSetupQuery();
 * const system = useSetupStore((s) => s.system);
 * ```
 */
export function useSetupQuery() {
  const { setLoading } = useSetupStore();

  return useQuery({
    queryKey: SETUP_QUERY_KEY,
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await fetchSetup();
        handleSetupSuccess(response);
        return response;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    staleTime: 0, // Always consider data stale so it re-fetches on mount
    refetchOnMount: "always", // Re-fetch every time the component mounts
    retry: 2,
  });
}

/**
 * `useSetupMutation` – imperative variant for cases where you want
 * to re-trigger setup manually (e.g. after logout → re-login).
 */
export function useSetupMutation() {
  const { setLoading } = useSetupStore();

  return useMutation({
    mutationFn: fetchSetup,
    onMutate: () => setLoading(true),
    onSuccess: (response) => handleSetupSuccess(response),
    onError: () => setLoading(false),
  });
}

/* ------------------------------------------------------------------ */
/*  SetupInitializer – drop into providers to call setup on every     */
/*  route change.                                                      */
/* ------------------------------------------------------------------ */

interface SetupInitializerProps {
  /** Pass the current pathname (e.g. from `usePathname()`) so setup
   *  is re-triggered on every navigation. */
  routeKey?: string;
  children?: React.ReactNode;
}

/**
 * Renders nothing visible. Calls `POST /alpha/v1/setup` on first
 * mount and again whenever `routeKey` changes (i.e. on navigation).
 *
 * Usage (inside a Next.js client provider):
 * ```tsx
 * const pathname = usePathname();
 * <SetupInitializer routeKey={pathname}>{children}</SetupInitializer>
 * ```
 */
export function SetupInitializer({
  routeKey,
  children,
}: SetupInitializerProps) {
  const queryClient = useQueryClient();
  const prevRouteKey = useRef(routeKey);

  // Initial setup call
  useSetupQuery();

  // Re-fetch whenever the route changes
  useEffect(() => {
    if (prevRouteKey.current !== routeKey) {
      prevRouteKey.current = routeKey;
      queryClient.invalidateQueries({ queryKey: [...SETUP_QUERY_KEY] });
    }
  }, [routeKey, queryClient]);

  return children ?? null;
}
