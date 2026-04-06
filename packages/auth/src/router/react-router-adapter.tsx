/**
 * React Router v7 adapter for @craft-apex/auth & @craft-apex/layout.
 *
 * This adapter wraps React Router's `Link`, `useNavigate`, and
 * `useLocation` so that shared packages remain framework-agnostic.
 *
 * Usage in a Vite portal:
 *   import { ReactRouterAdapter } from "@craft-apex/auth/router";
 *   <RouterAdapterProvider adapter={ReactRouterAdapter}>
 */

import {
  Link as RRLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import type { RouterAdapter } from "./router-context";

/* ------------------------------------------------------------------ */
/*  Link wrapper                                                        */
/* ------------------------------------------------------------------ */

function AdapterLink({
  href,
  children,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <RRLink to={href} {...(rest as any)}>
      {children}
    </RRLink>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook wrappers                                                       */
/* ------------------------------------------------------------------ */

function useRouter() {
  const navigate = useNavigate();
  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => navigate(-1),
  };
}

function usePathname() {
  const location = useLocation();
  return location.pathname;
}

/* ------------------------------------------------------------------ */
/*  Adapter object                                                      */
/* ------------------------------------------------------------------ */

export const ReactRouterAdapter: RouterAdapter = {
  Link: AdapterLink,
  useRouter,
  usePathname,
};
