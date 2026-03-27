/* ------------------------------------------------------------------ */
/*  @craft-apex/layout – barrel export                                 */
/* ------------------------------------------------------------------ */

// Main entry-point component
export { AppLayout } from "./components/app-layout";

// Individual layout components (if you need them directly)
export { SidebarLayout } from "./components/sidebar-layout";
export { DualSidebarLayout } from "./components/dual-sidebar-layout";
export { TopNavLayout } from "./components/topnav-layout";
export { SidebarMenuItem } from "./components/sidebar-menu-item";

// Header components – shared across all portals
export {
  NotificationDropdown,
  SearchOption,
  FullScreenToggle,
  ProfileDropdown,
} from "./components/header";
export type { ProfileMenuItem } from "./components/header";

// Header store (Zustand)
export { useHeaderStore } from "./store/header-store";

// Header hooks (TanStack Query)
export {
  useNotificationsQuery,
  useSearchTypesQuery,
  setHeaderAxios,
  NOTIFICATIONS_QUERY_KEY,
  SEARCH_TYPES_QUERY_KEY,
} from "./hooks/header-hooks";

// Header types
export type {
  Notification,
  NotificationResponse,
  SearchType,
  SearchTypeLookupResponse,
} from "./types/header";

// Utilities
export { modulesToRailItems, buildDualSidebarConfig } from "./utils/module-to-menu";
export { getIconForName, RemixIcon } from "./utils/icon-map";
export type { ApiModule } from "./utils/module-to-menu";

// Types
export type {
  MenuItem,
  MenuGroup,
  LayoutBrand,
  LayoutVariant,
  LayoutConfig,
} from "./types";
