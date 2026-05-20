import type { ModuleNode } from "./types";

/**
 * Menu item, mirroring legacy LayoutMenuData.js (`Navdata`).
 * Exactly three levels: module → child_module → child_module.
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  /** legacy: url ?? "/#" */
  link: string;
  target?: string;
  /** level 2 */
  subItems?: MenuItem[];
  /** level-2 node that itself has children */
  isChildItem?: boolean;
  /** level 3 */
  childItems?: MenuItem[];
}

// Legacy filters every level by `display_mode === "SHOW"`.
const shown = (n: ModuleNode) => n.display_mode === "SHOW";

/**
 * Build the 3-level menu from the module tree, faithfully reproducing
 * legacy `buildMenuData`: level-1 gets `subItems` only when `child_module`
 * is present; a level-2 node with its own `child_module` becomes an
 * `isChildItem` with `childItems` (level 3). Deeper nesting is not produced.
 */
export function buildMenu(modules: ModuleNode[]): MenuItem[] {
  return modules.filter(shown).map((row): MenuItem => {
    const item: MenuItem = {
      id: row.code,
      label: row.name,
      icon: row.icon,
      link: row.url ?? "/#",
      target: row.target,
    };

    if (row.child_module != null) {
      item.subItems = row.child_module.filter(shown).map((el): MenuItem => {
        const sub: MenuItem = {
          id: el.code,
          label: el.name,
          link: el.url ?? "/#",
          target: el.target,
        };
        if (el.child_module != null) {
          sub.isChildItem = true;
          sub.childItems = el.child_module
            .filter(shown)
            .map((g): MenuItem => ({
              id: g.code,
              label: g.name,
              link: g.url ?? "/#",
              target: g.target,
            }));
        }
        return sub;
      });
    }

    return item;
  });
}
