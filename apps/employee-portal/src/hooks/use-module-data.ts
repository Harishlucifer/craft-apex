
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSetupStore } from "@craft-apex/auth";

/* ------------------------------------------------------------------ */
/*  Module Data Types                                                  */
/* ------------------------------------------------------------------ */

export interface ModulePermissions {
  view?: boolean;
  summary?: boolean;
  export?: boolean;
  assign?: boolean;
  assign_type?: string;
  ask_details?: boolean;
  partcipant_details?: boolean;
  bank_statement?: boolean;
  credit_bureau?: boolean;
  activity_stream?: boolean;
  lender_status?: boolean;
  [key: string]: unknown;
}

export interface ModuleConfiguration {
  workflow_type?: string;
  exclude_journey_types?: string;
  include_journey_types?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ModuleData {
  module_id?: number;
  map_id?: number | string;
  code?: string;
  name?: string;
  url?: string;
  icon?: string;
  configuration?: ModuleConfiguration | null;
  allowedPermission?: ModulePermissions | null;
  allowed_permission?: ModulePermissions | null;
  child_module?: ModuleData[] | null;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Route Matching Logic                                               */
/*  Mirrors routeHandle/WithModule.js – getModuleData()                */
/* ------------------------------------------------------------------ */

/**
 * Simple path-to-regexp style matcher.
 * Supports `:param` segments and optional trailing slashes.
 */
function matchPath(pattern: string, pathname: string): boolean {
  // Strip query strings from pattern (modules may store ?foo in url)
  const cleanPattern = pattern.split("?")[0];
  if (!cleanPattern) return false;

  // Build a regex from the pattern: replace :param with [^/]+
  const regexStr =
    "^" +
    cleanPattern
      .replace(/:[^/]+/g, "[^/]+") // :id  →  [^/]+
      .replace(/\//g, "\\/") +     // /    →  \/
    "\\/?$";                        // optional trailing slash

  const regex = new RegExp(regexStr);
  return regex.test(pathname);
}

/**
 * Traverse the module tree (up to 3 levels, matching the old logic)
 * and return the first module whose `url` matches `pathname`.
 */
function findModuleForPath(
  pathname: string,
  modules: ModuleData[]
): ModuleData | null {
  for (const mod of modules) {
    // Level 2: child_module
    if (mod.child_module) {
      for (const child of mod.child_module) {
        // Level 3: inner child_module
        if (child.child_module) {
          for (const innerChild of child.child_module) {
            if (innerChild.url && matchPath(innerChild.url, pathname)) {
              return innerChild;
            }
          }
        }
        // Level 2 match
        if (child.url && matchPath(child.url, pathname)) {
          return child;
        }
      }
    }

    // Level 1 match
    if (mod.url && matchPath(mod.url, pathname)) {
      return mod;
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Hook: useModuleData                                                */
/*  Equivalent of the withModule HOC for the Next.js employee portal.  */
/*  Returns the module data for the current route.                     */
/* ------------------------------------------------------------------ */

/**
 * Returns the module data for the current route by matching the pathname
 * against the module tree stored in the Zustand setup store.
 *
 * This is the Next.js equivalent of `routeHandle/WithModule.js`.
 *
 * @example
 * ```tsx
 * const module = useModuleData();
 * // module?.map_id, module?.configuration, module?.allowedPermission, etc.
 * ```
 */
export function useModuleData(): ModuleData | null {
  const { pathname } = useLocation();
  const { module: modules } = useSetupStore();

  const moduleData = useMemo(() => {
    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      return null;
    }

    return findModuleForPath(pathname, modules as ModuleData[]);
  }, [pathname, modules]);

  return moduleData;
}

/* ------------------------------------------------------------------ */
/*  Hook: useModulePermissions                                         */
/*  Convenience hook returning normalised permissions for the current   */
/*  module.                                                             */
/* ------------------------------------------------------------------ */

export function useModulePermissions(): ModulePermissions {
  const mod = useModuleData();

  return useMemo(() => {
    // The old code uses both `allowedPermission` and `allowed_permission`.
    const perms =
      mod?.allowedPermission ??
      mod?.allowed_permission ??
      ({} as ModulePermissions);

    return {
      view: perms.view ?? false,
      summary: perms.summary ?? false,
      export: perms.export ?? false,
      assign: perms.assign ?? false,
      assign_type: perms.assign_type,
      ask_details: perms.ask_details ?? false,
      partcipant_details: perms.partcipant_details ?? false,
      bank_statement: perms.bank_statement ?? false,
      credit_bureau: perms.credit_bureau ?? false,
      activity_stream: perms.activity_stream ?? false,
      lender_status: perms.lender_status ?? false,
    };
  }, [mod]);
}

/* ------------------------------------------------------------------ */
/*  Hook: useModuleConfiguration                                       */
/*  Convenience hook returning the configuration for the current module */
/* ------------------------------------------------------------------ */

export function useModuleConfiguration(): ModuleConfiguration | null {
  const mod = useModuleData();
  return mod?.configuration ?? null;
}
