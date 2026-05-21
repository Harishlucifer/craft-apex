import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useModule, useModulePermission } from "./use-module";

interface PermissionGateProps {
  /** Permission key on `module.allowed_permission` (e.g. "add", "edit", "view", "delete", "export"). */
  action: string;
  /** Rendered when the active module grants the action. */
  children: ReactNode;
  /** Rendered when the action is denied. Defaults to `null` (silently hide). */
  fallback?: ReactNode;
}

/**
 * Conditionally render children based on the active module's
 * `allowed_permission[action]` flag. Mirrors the legacy pattern of guarding
 * Add / Edit / Delete buttons inside the `withModule` HOC's `myModuleList`.
 *
 * If there is no active module (e.g. unmapped route, or modules haven't
 * loaded yet), the gate denies — same default-deny behavior as legacy.
 */
export function PermissionGate({
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const allowed = useModulePermission(action);
  return <>{allowed ? children : fallback}</>;
}

interface RouteGuardProps {
  /** Permission required to render this route. Defaults to "view". */
  action?: string;
  /** Path to redirect to on deny. Defaults to `/dashboard`. */
  redirectTo?: string;
  /**
   * If true, never redirect even if the user has no module mapping yet.
   * Useful while the module tree is loading.
   */
  allowWhileLoading?: boolean;
  children: ReactNode;
}

/**
 * Page-level permission guard. Redirects when the active module doesn't
 * grant the required action. Mirrors legacy `withModule` HOC's behaviour of
 * blocking access entirely to routes a role isn't mapped to.
 *
 * Place it inside the route element:
 *   { path: "/settings/role", element: (
 *     <RouteGuard><RoleListPage/></RouteGuard>
 *   ) }
 *
 * Use the action prop to require a specific permission (e.g. "add" for
 * create routes). Add routes that share an underlying module with the list
 * can declare `action="add"` so the same module guards both.
 */
export function RouteGuard({
  action = "view",
  redirectTo = "/dashboard",
  allowWhileLoading = true,
  children,
}: RouteGuardProps) {
  const module = useModule();

  // No module resolved yet — wait (or allow) rather than flicker.
  if (module === null) {
    return allowWhileLoading ? <>{children}</> : null;
  }

  const allowed = Boolean(module.node.allowed_permission?.[action]);
  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}
