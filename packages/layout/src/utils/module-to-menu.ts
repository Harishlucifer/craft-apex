import type { MenuItem, LayoutConfig, MenuGroup } from "../types";

/* ------------------------------------------------------------------ */
/*  Transform API module[] into LayoutConfig for dual-sidebar          */
/*                                                                      */
/*  API module structure (3 levels):                                    */
/*   L1: { name, icon, code, child_module: [...] }     → Rail items    */
/*   L2: { name, code, child_module: [...] }           → Sidebar groups*/
/*   L3: { name, url, code, allowed_permission }       → Menu links    */
/* ------------------------------------------------------------------ */

export interface ApiModule {
  map_id?: string;
  mapped?: string;
  module_id?: string;
  code: string;
  name: string;
  system?: string;
  icon?: string;
  url?: string;
  target?: string;
  parent_module?: string;
  data_access?: string;
  allowed_permission?: Record<string, boolean> | null;
  configuration?: unknown;
  display_mode?: string;
  child_module?: ApiModule[];
}

/**
 * Convert an API module array into rail items for the dual-sidebar layout.
 *
 * Level 1 → Rail items (icon rail on far left)
 * Level 2 → Groups shown in secondary sidebar when rail item is active
 * Level 3 → Clickable menu links within those groups
 */
export function modulesToRailItems(modules: ApiModule[]): MenuItem[] {
  if (!modules || !Array.isArray(modules)) return [];

  return modules
    .filter((m) => m.display_mode !== "HIDE")
    .map((level1) => {
      // Level 2 children become the rail item's children
      const children: MenuItem[] = [];

      if (level1.child_module && level1.child_module.length > 0) {
        for (const level2 of level1.child_module) {
          if (level2.display_mode === "HIDE") continue;

          // If level 2 has children (level 3), add them as a collapsible group
          if (level2.child_module && level2.child_module.length > 0) {
            const level3Items: MenuItem[] = level2.child_module
              .filter((m) => m.display_mode !== "HIDE")
              .map((level3) => ({
                id: level3.code || level3.module_id || level3.name,
                label: level3.name,
                href: level3.url || undefined,
                children: level3.child_module
                  ? modulesToMenuItems(level3.child_module)
                  : undefined,
              }));

            // Level 2 as a collapsible parent with level 3 children
            children.push({
              id: level2.code || level2.module_id || level2.name,
              label: level2.name,
              href: level2.url || undefined,
              children: level3Items.length > 0 ? level3Items : undefined,
            });
          } else {
            // Level 2 is a leaf (no children) — it's a direct link
            children.push({
              id: level2.code || level2.module_id || level2.name,
              label: level2.name,
              href: level2.url || undefined,
            });
          }
        }
      } else if (level1.url) {
        // Level 1 is itself a leaf (e.g. Dashboard with a direct URL)
        children.push({
          id: `${level1.code}-link`,
          label: level1.name,
          href: level1.url,
        });
      }

      return {
        id: level1.code || level1.module_id || level1.name,
        label: level1.name,
        // Icon will be set by the consumer using the `icon` field from API
        // (e.g. "ri-store-2-line" → mapped to a React icon component)
        iconName: level1.icon,
        children,
      } as MenuItem & { iconName?: string };
    });
}

/** Recursively convert API modules into MenuItem[] (for deeper levels) */
function modulesToMenuItems(modules: ApiModule[]): MenuItem[] {
  if (!modules || !Array.isArray(modules)) return [];

  return modules
    .filter((m) => m.display_mode !== "HIDE")
    .map((mod) => ({
      id: mod.code || mod.module_id || mod.name,
      label: mod.name,
      href: mod.url || undefined,
      children: mod.child_module
        ? modulesToMenuItems(mod.child_module)
        : undefined,
    }));
}

/**
 * Build a complete LayoutConfig from API modules.
 * Used for employee portal (dual-sidebar, 3-level menu).
 */
export function buildDualSidebarConfig(
  modules: ApiModule[],
  brand?: { title: string; subtitle?: string; icon?: React.ReactNode },
  footer?: React.ReactNode
): LayoutConfig {
  const railItems = modulesToRailItems(modules);

  return {
    variant: "dual-sidebar",
    brand,
    railItems,
    menuGroups: [],
    footer,
  };
}
