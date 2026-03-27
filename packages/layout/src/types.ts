import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Menu & Layout configuration types                                  */
/* ------------------------------------------------------------------ */

/** A single menu item. Can optionally have children for nested menus. */
export interface MenuItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon name or a React node */
  icon?: ReactNode;
  /** Navigation URL. If omitted the item acts as a parent group toggle. */
  href?: string;
  /** Nested child items */
  children?: MenuItem[];
  /** Whether this item is active / selected */
  isActive?: boolean;
}

/** A labelled group of menu items (e.g. "Platform", "Projects"). */
export interface MenuGroup {
  /** Optional section heading (e.g. "Platform") */
  label?: string;
  /** Items in this group */
  items: MenuItem[];
}

/** Brand / logo block shown in the sidebar or topnav. */
export interface LayoutBrand {
  /** Main title (e.g. "Acme Inc") */
  title: string;
  /** Subtitle (e.g. "Enterprise") */
  subtitle?: string;
  /** Logo icon or image */
  icon?: ReactNode;
}

/**
 * Layout variant determines which shell is rendered:
 *
 * - `"sidebar"` – single collapsible sidebar (image 1)
 * - `"dual-sidebar"` – icon rail + content sidebar (image 2)
 * - `"topnav"` – horizontal top navigation bar
 */
export type LayoutVariant = "sidebar" | "dual-sidebar" | "topnav";

/** Full configuration passed to `<AppLayout />`. */
export interface LayoutConfig {
  /** Which layout shell to render */
  variant: LayoutVariant;
  /** Brand / logo block */
  brand?: LayoutBrand;
  /** Menu groups rendered in the sidebar or topnav */
  menuGroups: MenuGroup[];
  /**
   * For `dual-sidebar` only – the icon-rail items on the far left.
   * Each item's `icon` is displayed; clicking switches the secondary sidebar.
   */
  railItems?: MenuItem[];
  /** Optional header content rendered at the top of the layout */
  header?: ReactNode;
  /** Optional footer content rendered at the bottom of the layout */
  footer?: ReactNode;
}
