import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { setActiveModuleId } from "@craft-apex/api";
import { useModuleStore, resolveModule } from "./module-store";
import type { ResolvedModule } from "./types";

/**
 * Resolves the active module for the current route and publishes its
 * map_id as the `X-Module` header. Replaces the legacy `withModule` HOC —
 * call it in a page (or the layout) and read `module.allowed_permission`.
 */
export function useModule(): ResolvedModule | null {
  const { pathname } = useLocation();
  const modules = useModuleStore((s) => s.modules);

  const resolved = useMemo(
    () => resolveModule(pathname, modules),
    [pathname, modules]
  );

  useEffect(() => {
    setActiveModuleId(resolved?.node.map_id ?? null);
  }, [resolved]);

  return resolved;
}

/** Convenience: permission flag for the active module. */
export function useModulePermission(action: string): boolean {
  const resolved = useModule();
  return Boolean(resolved?.node.allowed_permission?.[action]);
}
